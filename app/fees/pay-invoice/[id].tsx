import React, { useEffect, useMemo, useRef, useState } from "react";
import { Linking, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AppBar,
  BottomSheet,
  MoneyText,
  PaymentMethodRow,
  PhoneField,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from "../../../src/components";
import { apiFetch } from "../../../src/lib/api";
import { getDeviceId } from "../../../src/lib/device";
import { SAMPLE_INVOICES } from "../../../src/lib/sample-data";
import { formatGhs } from "../../../src/lib/money";

type Method = "mtn" | "telecel" | "airteltigo" | "card";

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 20;

export default function PayInvoiceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const invoice =
    SAMPLE_INVOICES.find((i) => i.id === id) ?? SAMPLE_INVOICES[0]!;
  const remaining = invoice.amountMinor - invoice.paidMinor;

  const [sheetOpen, setSheetOpen] = useState(true);
  const [method, setMethod] = useState<Method>("mtn");
  const [momoPhone, setMomoPhone] = useState("241234567");
  const [status, setStatus] = useState<"idle" | "prompt" | "success">("idle");
  const [payError, setPayError] = useState<string | undefined>();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const instruction = useMemo(() => {
    if (method === "mtn") return "Approve the prompt on your MTN handset";
    if (method === "telecel") return "Approve the prompt on your Telecel handset";
    if (method === "airteltigo")
      return "Approve the prompt on your AirtelTigo handset";
    return "Complete card checkout securely";
  }, [method]);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => stopPolling, []);

  const pollStatus = (reference: string) => {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
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
          } else {
            setPayError("The payment did not go through. No money is lost — try again.");
            setStatus("idle");
          }
        } else if (attempts >= POLL_MAX_ATTEMPTS) {
          stopPolling();
          setPayError(
            "Still waiting on the MoMo prompt. You can check the receipt under Fees in a moment.",
          );
          setStatus("idle");
        }
      } catch {
        // transient network error — keep polling until the attempt budget runs out
      }
    }, POLL_INTERVAL_MS);
  };

  const pay = async () => {
    setPayError(undefined);
    setStatus("prompt");
    try {
      const res = await apiFetch<{
        reference: string;
        authorizationUrl: string;
      }>("/v1/mobile/payments/momo", {
        method: "POST",
        headers: {
          "Idempotency-Key": `${invoice.id}-${await getDeviceId()}`,
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          ...(method !== "card"
            ? { provider: method, phone: momoPhone }
            : {}),
        }),
      });

      if (!res.data) {
        setPayError(res.error?.message ?? "Could not start the payment.");
        setStatus("idle");
        return;
      }

      if (method === "card" && res.data.authorizationUrl) {
        await Linking.openURL(res.data.authorizationUrl);
      }
      pollStatus(res.data.reference);
    } catch {
      setPayError("Network problem — check your connection and try again.");
      setStatus("idle");
    }
  };

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
          accessibilityLabel={`Overdue, ${formatGhs(remaining)}, due 15 Oct`}
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
          <SecondaryButton
            label="Choose payment method"
            onPress={() => setSheetOpen(true)}
          />
          {status === "prompt" ? (
            <Text className="mt-4 text-center font-body-md text-body-md text-primary">
              {instruction}…
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

      <BottomSheet visible={sheetOpen && status !== "success"} onClose={() => setSheetOpen(false)}>
        <Text className="mb-3 font-headline-sm text-headline-sm text-on-surface">
          Pay with
        </Text>
        <PaymentMethodRow
          label="MTN MoMo"
          subtitle="Most common in Ghana"
          icon="cellphone"
          selected={method === "mtn"}
          onPress={() => setMethod("mtn")}
        />
        <PaymentMethodRow
          label="Telecel Cash"
          icon="cellphone-wireless"
          selected={method === "telecel"}
          onPress={() => setMethod("telecel")}
        />
        <PaymentMethodRow
          label="AirtelTigo Money"
          icon="cellphone-check"
          selected={method === "airteltigo"}
          onPress={() => setMethod("airteltigo")}
        />
        <PaymentMethodRow
          label="Card"
          subtitle="Visa / Mastercard"
          icon="credit-card-outline"
          selected={method === "card"}
          onPress={() => setMethod("card")}
        />
        {method !== "card" ? (
          <PhoneField
            label="MoMo number"
            value={momoPhone}
            onChangeText={setMomoPhone}
          />
        ) : null}
        <Text className="mb-3 font-body-md text-body-md text-on-surface-variant">
          {instruction}
        </Text>
        <PrimaryButton
          label={`Pay ${formatGhs(remaining)}`}
          loading={status === "prompt"}
          onPress={() => {
            setSheetOpen(false);
            pay();
          }}
          accessibilityLabel={`Pay ${formatGhs(remaining)}`}
        />
      </BottomSheet>
    </Screen>
  );
}
