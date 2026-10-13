import React, { useEffect, useRef, useState } from "react";
import { Linking, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  AppBar,
  EmptyState,
  ErrorBanner,
  MoneyText,
  PrimaryButton,
  Screen,
  SkeletonBlock,
} from "../../../src/components";
import { apiFetch } from "../../../src/lib/api";
import { useFees } from "../../../src/hooks/useFees";
import { useHome } from "../../../src/hooks/useHome";
import { formatGhs } from "../../../src/lib/money";

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 20;

export default function PayInvoiceScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: invoices, isLoading, isError, refetch } = useFees();
  const home = useHome();
  const invoice = invoices?.find(
    (item) => item.id === id && home.data?.children.some((child) => child.id === item.studentId),
  );
  const remaining = invoice ? invoice.amountMinor - invoice.paidMinor : 0;

  const [status, setStatus] = useState<"idle" | "prompt" | "success">("idle");
  const [payError, setPayError] = useState<string | undefined>();
  const [paymentMessage, setPaymentMessage] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollInFlight = useRef(false);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => stopPolling, []);

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
          if (current === "success" || current === "paid") {
            setStatus("success");
            void queryClient.invalidateQueries({ queryKey: ["fees", "invoices"] });
            void queryClient.invalidateQueries({ queryKey: ["home"] });
          } else {
            setPayError("The payment did not go through. No money is lost — try again.");
            setStatus("idle");
          }
        } else if (attempts >= POLL_MAX_ATTEMPTS) {
          stopPolling();
          setPayError(
            "Payment is still pending. Check Fees before starting another payment.",
          );
          setStatus("idle");
        }
      } catch {
        // transient network error — keep polling until the attempt budget runs out
      } finally {
        pollInFlight.current = false;
      }
    }, POLL_INTERVAL_MS);
  };

  const pay = async () => {
    if (!invoice) return;
    setPayError(undefined);
    setPaymentMessage("Starting secure checkout…");
    setStatus("prompt");
    try {
      const res = await apiFetch<{
        reference: string;
        authorizationUrl?: string;
      }>("/v1/mobile/payments/momo", {
        method: "POST",
        body: JSON.stringify({
          invoiceId: invoice.id,
        }),
      });

      if (!res.data) {
        setPayError(res.error?.message ?? "Could not start the payment.");
        setStatus("idle");
        return;
      }

      if (res.data.authorizationUrl) {
        const checkoutUrl = new URL(res.data.authorizationUrl);
        if (checkoutUrl.protocol !== "https:") {
          throw new Error("Payment checkout URL must use HTTPS");
        }
        await Linking.openURL(checkoutUrl.toString());
        setPaymentMessage("Complete payment in secure checkout, then return here.");
      } else {
        setPaymentMessage("A payment is already pending. Checking its status…");
      }
      pollStatus(res.data.reference);
    } catch {
      setPayError("Network problem — check your connection and try again.");
      setStatus("idle");
    }
  };

  if ((isLoading && !invoices) || (home.isLoading && !home.data)) {
    return (
      <Screen>
        <AppBar title="Pay invoice" onBack={() => router.back()} />
        <SkeletonBlock />
      </Screen>
    );
  }

  if (isError || home.isError) {
    return (
      <Screen>
        <AppBar title="Pay invoice" onBack={() => router.back()} />
        <ErrorBanner
          message="Couldn't load this invoice."
          onRetry={() => {
            void refetch();
            void home.refetch();
          }}
        />
      </Screen>
    );
  }

  if (!invoice) {
    return (
      <Screen>
        <AppBar title="Pay invoice" onBack={() => router.back()} />
        <EmptyState
          title="Invoice not found"
          description="This invoice may have been paid or is no longer available."
          icon="script-text-outline"
        />
      </Screen>
    );
  }

  if (invoice.status === "paid" || remaining <= 0) {
    return (
      <Screen>
        <AppBar title="Invoice" onBack={() => router.back()} />
        <EmptyState
          title="Invoice already paid"
          description="There is no balance left to pay on this invoice."
          icon="check-circle-outline"
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppBar
        title="Pay invoice"
        subtitle={invoice.title}
        onBack={() => router.back()}
      />
      <View className="mb-4 rounded-lg bg-surface-container-lowest p-gutter-card border border-outline-variant/30">
        <Text className="font-body-md text-body-md text-on-surface-variant">
          {invoice.childName}
        </Text>
        <MoneyText minorUnits={remaining} className="my-1" />
        <Text
          accessibilityLabel={`Amount due ${formatGhs(remaining)}, due ${new Date(invoice.dueDate).toLocaleDateString("en-GH")}`}
          className="font-label-md text-label-md text-tertiary"
        >
          Amount due
        </Text>
      </View>

      {status === "success" ? (
        <View className="items-center py-8">
          <Text className="mb-2 font-headline-md text-headline-md text-secondary">
            Payment received
          </Text>
          <Text className="mb-6 text-center font-body-md text-body-md text-on-surface-variant">
            Receipt for {formatGhs(remaining)} will appear under Fees.
          </Text>
          <PrimaryButton label="Done" onPress={() => router.back()} />
        </View>
      ) : (
        <>
          <Text className="mb-3 text-center font-body-md text-body-md text-on-surface-variant">
            Choose MoMo or card on the secure checkout page.
          </Text>
          <PrimaryButton
            label={`Pay ${formatGhs(remaining)}`}
            loading={status === "prompt"}
            onPress={() => void pay()}
            accessibilityLabel={`Pay ${formatGhs(remaining)}`}
          />
          {status === "prompt" ? (
            <Text className="mt-4 text-center font-body-md text-body-md text-primary">
              {paymentMessage}
            </Text>
          ) : null}
          {payError ? (
            <Text
              accessibilityLiveRegion="polite"
              className="mt-4 text-center font-body-md text-body-md text-error"
            >
              {payError}
            </Text>
          ) : null}
        </>
      )}
    </Screen>
  );
}
