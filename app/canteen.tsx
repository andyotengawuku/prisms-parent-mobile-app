import React, { useEffect, useRef, useState } from "react";
import { Linking, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  AppBar,
  BottomSheet,
  EmptyState,
  ErrorBanner,
  FilterChip,
  MoneyText,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionHeader,
  SegmentedControl,
  SkeletonBlock,
} from "../src/components";
import { useCanteenMenu, useCanteenWallet } from "../src/hooks/useCanteen";
import { useHome } from "../src/hooks/useHome";
import { apiFetch } from "../src/lib/api";
import { formatGhs, parseGhsInput } from "../src/lib/money";
import type { WalletTransaction } from "../src/lib/models";

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 20;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TOPUP_QUICK = [1000, 2000, 5000, 10000];
const LIMIT_QUICK = [500, 1000, 2000, 4000];

function mondayOf(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d.toISOString().slice(0, 10);
}

function txSign(type: string): string {
  return type === "purchase" ? "-" : "+";
}

function TransactionRow({ tx }: { tx: WalletTransaction }) {
  const isPurchase = tx.type === "purchase";
  return (
    <View className="flex-row items-center justify-between border-b border-outline-variant/20 py-3">
      <View className="min-w-0 flex-1 pr-3">
        <Text className="font-body-md text-body-md text-on-surface" numberOfLines={1}>
          {tx.description ?? (tx.type === "topup" ? "Top-up" : tx.type === "refund" ? "Refund" : "Adjustment")}
        </Text>
        <Text className="font-label-md text-label-md text-on-surface-variant">
          {new Date(tx.mealDate).toLocaleDateString("en-GH", { weekday: "short", day: "numeric", month: "short" })} ·{" "}
          {new Date(tx.mealDate).toLocaleTimeString("en-GH", { hour: "numeric", minute: "2-digit" })}
        </Text>
      </View>
      <Text
        className={`font-headline-sm text-headline-sm ${isPurchase ? "text-on-surface" : "text-secondary"}`}
        accessibilityLabel={`${txSign(tx.type)}${formatGhs(tx.amountMinor)}`}
      >
        {txSign(tx.type)}
        {formatGhs(tx.amountMinor)}
      </Text>
    </View>
  );
}

export default function CanteenScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const home = useHome();
  const children = home.data?.children ?? [];
  const [selectedChildId, setSelectedChildId] = useState<string>();
  const selectedChild = children.find((child) => child.id === selectedChildId) ?? children[0];

  const [section, setSection] = useState("Wallet");
  const [menuWeek, setMenuWeek] = useState<string | undefined>(undefined);

  const wallet = useCanteenWallet(selectedChild?.id);
  const menu = useCanteenMenu(menuWeek);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [amountText, setAmountText] = useState("");
  const [payState, setPayState] = useState<"idle" | "starting" | "prompt" | "success">("idle");
  const [payMessage, setPayMessage] = useState("");
  const [payError, setPayError] = useState<string>();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollInFlight = useRef(false);

  const [limitBusy, setLimitBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const invalidateWallet = () => {
    void queryClient.invalidateQueries({ queryKey: ["canteen", "wallet"] });
    void queryClient.invalidateQueries({ queryKey: ["home"] });
  };

  const pollStatus = (reference: string) => {
    stopPolling();
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      if (pollInFlight.current) return;
      pollInFlight.current = true;
      attempts += 1;
      try {
        const res = await apiFetch<{ status: string }>(
          `/v1/mobile/payments/${encodeURIComponent(reference)}`,
        );
        const current = res.data?.status;
        if (current && current !== "pending") {
          stopPolling();
          if (current === "completed" || current === "success" || current === "paid") {
            setPayState("success");
            invalidateWallet();
          } else {
            setPayError("The payment did not go through. No money is lost — try again.");
            setPayState("idle");
          }
        } else if (attempts >= POLL_MAX_ATTEMPTS) {
          stopPolling();
          setPayError("Payment is still pending. It will appear once confirmed.");
          setPayState("idle");
        }
      } catch {
        // transient network error — keep polling until the budget runs out
      } finally {
        pollInFlight.current = false;
      }
    }, POLL_INTERVAL_MS);
  };

  const startTopUp = async (amountMinor: number) => {
    if (!selectedChild) return;
    const settings = wallet.data?.settings;
    if (settings && (amountMinor < settings.minTopUpMinor || amountMinor > settings.maxTopUpMinor)) {
      setPayError(`Top-up must be between ${formatGhs(settings.minTopUpMinor)} and ${formatGhs(settings.maxTopUpMinor)}.`);
      return;
    }
    setPayError(undefined);
    setPayState("starting");
    try {
      const res = await apiFetch<{
        reference: string;
        authorizationUrl?: string | null;
      }>("/v1/mobile/canteen/topup", {
        method: "POST",
        headers: { "idempotency-key": `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` },
        body: JSON.stringify({ studentId: selectedChild.id, amountMinor }),
      });
      if (!res.data) {
        setPayError(res.error?.message ?? "Could not start the top-up.");
        setPayState("idle");
        return;
      }
      if (res.data.authorizationUrl) {
        const url = new URL(res.data.authorizationUrl);
        if (url.protocol !== "https:") {
          throw new Error("Checkout URL must use HTTPS");
        }
        await Linking.openURL(url.toString());
        setPayMessage("Complete payment in secure checkout, then come back.");
      } else {
        setPayMessage("A payment is already pending — checking its status…");
      }
      setPayState("prompt");
      pollStatus(res.data.reference);
    } catch {
      setPayError("Network problem — check your connection and try again.");
      setPayState("idle");
    }
  };

  const setLimit = async (dailyLimitMinor: number | null) => {
    if (!selectedChild || limitBusy) return;
    setLimitBusy(true);
    try {
      await apiFetch("/v1/mobile/canteen/limit", {
        method: "PUT",
        body: JSON.stringify({ studentId: selectedChild.id, dailyLimitMinor }),
      });
      invalidateWallet();
    } finally {
      setLimitBusy(false);
    }
  };

  if (home.isLoading && !home.data) {
    return (
      <Screen>
        <AppBar title="Canteen" onBack={() => router.back()} />
        <SkeletonBlock />
      </Screen>
    );
  }

  if (home.isError || !home.data) {
    return (
      <Screen>
        <AppBar title="Canteen" onBack={() => router.back()} />
        <ErrorBanner message="Couldn't load your children." onRetry={() => void home.refetch()} />
      </Screen>
    );
  }

  if (children.length === 0) {
    return (
      <Screen>
        <AppBar title="Canteen" onBack={() => router.back()} />
        <EmptyState
          title="No children linked"
          description="Ask the school office to link your account to your child."
          icon="account-child-outline"
        />
      </Screen>
    );
  }

  const walletData = wallet.data;

  return (
    <Screen scroll>
      <AppBar
        title="Canteen"
        subtitle="Wallet, menus and meal spending"
        onBack={() => router.back()}
      />

      {children.length > 1 ? (
        <View className="mb-4 flex-row flex-wrap">
          {children.map((child) => (
            <FilterChip
              key={child.id}
              label={`${child.firstName} ${child.lastName}`}
              selected={child.id === selectedChild?.id}
              onPress={() => {
                setSelectedChildId(child.id);
                setPayState("idle");
                setPayError(undefined);
              }}
            />
          ))}
        </View>
      ) : null}

      <View className="mb-4">
        <SegmentedControl options={["Wallet", "Menu"]} value={section} onChange={setSection} />
      </View>

      {section === "Wallet" ? (
        wallet.isLoading && !walletData ? (
          <SkeletonBlock />
        ) : wallet.isError ? (
          <ErrorBanner message="Couldn't load the wallet." onRetry={() => void wallet.refetch()} />
        ) : !walletData ? null : !walletData.hasWallet ? (
          <EmptyState
            title="No wallet yet"
            description="The school hasn't set up a canteen wallet for this child. A first top-up creates one."
            icon="wallet-outline"
            actionLabel="Top up anyway"
            onAction={() => {
              setSheetVisible(true);
            }}
          />
        ) : (
          <View className="space-y-4 gap-4">
            <View className="rounded-lg bg-primary p-gutter-card">
              <Text className="font-label-md text-label-md text-on-primary/80">
                {selectedChild?.firstName}'s balance
              </Text>
              <MoneyText minorUnits={walletData.balanceMinor} className="my-1 text-on-primary" />
              <View className="mt-2 flex-row gap-4">
                <View>
                  <Text className="font-label-md text-label-md text-on-primary/70">Today</Text>
                  <Text className="font-body-md text-body-md text-on-primary">
                    {formatGhs(walletData.spentTodayMinor)}
                  </Text>
                </View>
                <View>
                  <Text className="font-label-md text-label-md text-on-primary/70">This month</Text>
                  <Text className="font-body-md text-body-md text-on-primary">
                    {formatGhs(walletData.spentMonthMinor)}
                  </Text>
                </View>
                <View>
                  <Text className="font-label-md text-label-md text-on-primary/70">Daily limit</Text>
                  <Text className="font-body-md text-body-md text-on-primary">
                    {walletData.dailyLimitMinor ? formatGhs(walletData.dailyLimitMinor) : "None"}
                  </Text>
                </View>
              </View>
            </View>

            {payState === "success" ? (
              <Text className="rounded-lg bg-surface-container-lowest p-3 text-center font-body-md text-body-md text-secondary">
                Top-up received — balance updated.
              </Text>
            ) : null}
            {payError ? (
              <Text accessibilityLiveRegion="polite" className="text-center font-body-md text-body-md text-error">
                {payError}
              </Text>
            ) : null}

            <PrimaryButton
              label={payState === "starting" ? "Starting checkout…" : "Top up wallet"}
              loading={payState === "starting"}
              onPress={() => {
                setPayState("idle");
                setPayError(undefined);
                setSheetVisible(true);
              }}
            />

            <View>
              <SectionHeader title="Daily spending limit" />
              <View className="flex-row flex-wrap">
                {LIMIT_QUICK.map((value) => (
                  <FilterChip
                    key={value}
                    label={formatGhs(value)}
                    selected={walletData.dailyLimitMinor === value}
                    onPress={() => void setLimit(value)}
                  />
                ))}
                <FilterChip
                  label="No limit"
                  selected={walletData.dailyLimitMinor === null}
                  onPress={() => void setLimit(null)}
                />
              </View>
            </View>

            <View>
              <SectionHeader title="Recent activity" />
              {walletData.transactions.length === 0 ? (
                <Text className="font-body-md text-body-md text-on-surface-variant">
                  No purchases yet.
                </Text>
              ) : (
                walletData.transactions.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
              )}
            </View>
          </View>
        )
      ) : menu.isLoading && !menu.data ? (
        <SkeletonBlock />
      ) : menu.isError ? (
        <ErrorBanner message="Couldn't load the menu." onRetry={() => void menu.refetch()} />
      ) : !menu.data || !menu.data.hasMenu ? (
        <EmptyState
          title="No menu published"
          description="The school hasn't published a canteen menu yet."
          icon="food-outline"
        />
      ) : (
        <View className="space-y-4 gap-4">
          <View className="flex-row flex-wrap">
            <FilterChip
              label="This week"
              selected={!menuWeek}
              onPress={() => setMenuWeek(undefined)}
            />
            <FilterChip
              label="Next week"
              selected={menuWeek === mondayOf(new Date(Date.now() + 7 * 86400000))}
              onPress={() => setMenuWeek(mondayOf(new Date(Date.now() + 7 * 86400000)))}
            />
          </View>
          {menu.data.days
            .filter((day) => day.services.length > 0)
            .map((day) => (
              <View
                key={day.dayOfWeek}
                className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-gutter-card"
              >
                <Text className="mb-2 font-headline-sm text-headline-sm text-on-surface">
                  {DAY_LABELS[day.dayOfWeek]}
                </Text>
                {day.services.map((service) => (
                  <View key={service.mealService} className="mb-2">
                    <Text className="font-label-md text-label-md text-primary capitalize">
                      {service.title ?? service.mealService}
                    </Text>
                    {service.items.map((item) => (
                      <View key={item.name} className="flex-row justify-between">
                        <Text className="flex-1 font-body-md text-body-md text-on-surface">
                          {item.name}
                        </Text>
                        {item.priceMinor ? (
                          <Text className="font-body-md text-body-md text-on-surface-variant">
                            {formatGhs(item.priceMinor)}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ))}
        </View>
      )}

      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)}>
        <View className="p-4">
          <Text className="mb-1 font-headline-sm text-headline-sm text-on-surface">
            Top up {selectedChild?.firstName}'s wallet
          </Text>
          <Text className="mb-4 font-body-md text-body-md text-on-surface-variant">
            Paid securely with Paystack — MoMo or card.
          </Text>
          <View className="mb-4 flex-row flex-wrap">
            {TOPUP_QUICK.map((value) => (
              <FilterChip key={value} label={formatGhs(value)} onPress={() => setAmountText(String(value / 100))} />
            ))}
          </View>
          <TextInput
            value={amountText}
            onChangeText={setAmountText}
            keyboardType="decimal-pad"
            placeholder="Amount in GHS"
            accessibilityLabel="Top-up amount in Ghana cedis"
            className="mb-4 min-h-12 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 font-headline-md text-headline-md text-on-surface"
          />
          {payState === "prompt" ? (
            <Text className="mb-3 text-center font-body-md text-body-md text-primary">
              {payMessage}
            </Text>
          ) : null}
          <PrimaryButton
            label="Continue to secure checkout"
            disabled={!parseGhsInput(amountText)}
            onPress={() => {
              const minor = parseGhsInput(amountText);
              if (!minor) return;
              setSheetVisible(false);
              void startTopUp(minor);
            }}
          />
          <View className="mt-3">
            <SecondaryButton label="Cancel" onPress={() => setSheetVisible(false)} />
          </View>
        </View>
      </BottomSheet>
    </Screen>
  );
}
