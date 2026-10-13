import React, { useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AppBar,
  EmptyState,
  ErrorBanner,
  FilterChip,
  PrimaryButton,
  QRDisplay,
  Screen,
  SkeletonBlock,
} from "../src/components";
import { useHome } from "../src/hooks/useHome";
import { apiFetch } from "../src/lib/api";

type PickupPass = {
  token: string;
  validFrom: string;
  validUntil: string;
  status: string;
};

export default function PickupScreen() {
  const router = useRouter();
  const home = useHome();
  const children = home.data?.children ?? [];
  const [selectedChildId, setSelectedChildId] = useState<string>();
  const [pass, setPass] = useState<PickupPass | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const selectedChild = children.find((child) => child.id === selectedChildId) ?? children[0];

  const createPass = async () => {
    if (!selectedChild || busy) return;
    setBusy(true);
    setError(undefined);
    setPass(null);
    try {
      const res = await apiFetch<{ pass: PickupPass }>("/parent/pickup-passes", {
        method: "POST",
        body: JSON.stringify({ studentId: selectedChild.id, action: "quick" }),
      });
      if (!res.data?.pass) {
        setError(res.error?.message ?? "Couldn't create a pickup pass.");
        return;
      }
      setPass(res.data.pass);
    } catch {
      setError("Network problem — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (home.isLoading && !home.data) {
    return (
      <Screen>
        <AppBar title="Pickup pass" onBack={() => router.back()} />
        <SkeletonBlock />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <AppBar
        title="Pickup pass"
        subtitle="Create a short-lived pass for an authorized parent"
        onBack={() => router.back()}
      />
      {home.isError ? (
        <ErrorBanner message="Couldn't load your children." onRetry={() => void home.refetch()} />
      ) : null}
      {children.length === 0 && home.data ? (
        <EmptyState
          title="No children linked"
          description="Ask the school office to link your account to your child."
          icon="account-child-outline"
        />
      ) : null}

      {children.length > 1 ? (
        <View className="mb-4">
          <Text className="mb-2 font-label-md text-label-md text-on-surface-variant">
            Choose a child
          </Text>
          <View className="flex-row flex-wrap">
            {children.map((child) => (
              <FilterChip
                key={child.id}
                label={`${child.firstName} ${child.lastName}`}
                selected={child.id === selectedChild?.id}
                onPress={() => {
                  setSelectedChildId(child.id);
                  setPass(null);
                  setError(undefined);
                }}
              />
            ))}
          </View>
        </View>
      ) : null}

      {selectedChild ? (
        <>
          <View className="mb-4 rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-gutter-card">
            <Text className="font-label-md text-label-md text-on-surface-variant">
              Student
            </Text>
            <Text className="font-headline-sm text-headline-sm text-on-surface">
              {selectedChild.firstName} {selectedChild.lastName}
            </Text>
            <Text className="font-body-md text-body-md text-on-surface-variant">
              {selectedChild.className}
            </Text>
          </View>

          <Text className="mb-4 font-body-md text-body-md text-on-surface-variant">
            The school server creates and validates this pass. It expires 15 minutes after creation.
          </Text>

          {error ? (
            <Text accessibilityLiveRegion="polite" className="mb-3 text-center font-body-md text-body-md text-error">
              {error}
            </Text>
          ) : null}

          {pass ? (
            <View className="mb-4 items-center">
              <QRDisplay
                token={pass.token}
                caption={`Valid until ${new Date(pass.validUntil).toLocaleTimeString("en-GH", { hour: "numeric", minute: "2-digit" })}`}
              />
              <Text className="mt-3 font-label-md text-label-md text-on-surface-variant">
                Pass code: {pass.token}
              </Text>
            </View>
          ) : null}

          <PrimaryButton
            label={pass ? "Create another pass" : "Create pickup pass"}
            loading={busy}
            onPress={() => void createPass()}
          />
        </>
      ) : null}
    </Screen>
  );
}
