import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AppBar,
  BottomSheet,
  EmptyState,
  ErrorBanner,
  FilterChip,
  PrimaryButton,
  QRDisplay,
  Screen,
  SecondaryButton,
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

  const [omwBusy, setOmwBusy] = useState(false);
  const [omwMessage, setOmwMessage] = useState<string>();
  const [vehicleVisible, setVehicleVisible] = useState(false);
  const [vehicleBusy, setVehicleBusy] = useState(false);
  const [vehicleError, setVehicleError] = useState<string>();
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");

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

  const sendOnMyWay = async () => {
    if (!selectedChild || omwBusy) return;
    setOmwBusy(true);
    setOmwMessage(undefined);
    try {
      const res = await apiFetch<{ sent: boolean; cooldownSeconds: number }>(
        "/v1/mobile/pickup/on-my-way",
        {
          method: "POST",
          body: JSON.stringify({ studentId: selectedChild.id }),
        },
      );
      if (res.data?.sent) {
        setOmwMessage("Heads-up sent to the security desk.");
      } else {
        const seconds = (res.error as unknown as { cooldownSeconds?: number })?.cooldownSeconds;
        setOmwMessage(
          seconds
            ? `Already sent — try again in about ${Math.ceil(seconds / 60)} minutes.`
            : (res.error?.message ?? "Couldn't send the heads-up right now."),
        );
      }
    } catch {
      setOmwMessage("Network problem — check your connection and try again.");
    } finally {
      setOmwBusy(false);
    }
  };

  const saveVehicle = async () => {
    if (!selectedChild || vehicleBusy) return;
    setVehicleBusy(true);
    setVehicleError(undefined);
    try {
      const res = await apiFetch("/v1/mobile/parent/vehicle", {
        method: "PUT",
        body: JSON.stringify({
          childId: selectedChild.id,
          vehicleMake: vehicleMake.trim(),
          vehiclePlate: vehiclePlate.trim(),
          vehicleColor: vehicleColor.trim(),
        }),
      });
      if (!res.data) {
        setVehicleError(res.error?.message ?? "Couldn't save vehicle info.");
        return;
      }
      setVehicleVisible(false);
      void home.refetch();
    } catch {
      setVehicleError("Network problem — check your connection and try again.");
    } finally {
      setVehicleBusy(false);
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

          {selectedChild.usualDropoffTime || selectedChild.usualPickupTime ? (
            <View className="mb-4 rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-gutter-card">
              <Text className="font-label-md text-label-md text-on-surface-variant">
                Usual schedule
              </Text>
              <Text className="font-body-md text-body-md text-on-surface">
                Drop-off {selectedChild.usualDropoffTime ?? "—"} · Pickup {selectedChild.usualPickupTime ?? "—"}
              </Text>
            </View>
          ) : null}

          <View className="mb-4 flex-row gap-3">
            <View className="flex-1">
              <PrimaryButton
                label={omwBusy ? "Sending…" : "I'm on my way"}
                loading={omwBusy}
                onPress={() => void sendOnMyWay()}
              />
            </View>
            <View className="flex-1">
              <SecondaryButton
                label="Vehicle info"
                onPress={() => {
                  setVehicleError(undefined);
                  setVehicleVisible(true);
                }}
              />
            </View>
          </View>
          {omwMessage ? (
            <Text
              accessibilityLiveRegion="polite"
              className="mb-4 text-center font-body-md text-body-md text-primary"
            >
              {omwMessage}
            </Text>
          ) : null}

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

      <BottomSheet visible={vehicleVisible} onClose={() => setVehicleVisible(false)}>
        <View className="p-4">
          <Text className="mb-1 font-headline-sm text-headline-sm text-on-surface">
            Vehicle at pickup
          </Text>
          <Text className="mb-4 font-body-md text-body-md text-on-surface-variant">
            Shown to the security desk so they can prepare the pickup line for {selectedChild?.firstName}.
          </Text>
          <TextInput
            value={vehicleMake}
            onChangeText={setVehicleMake}
            placeholder="Make & model (e.g. Toyota Corolla)"
            accessibilityLabel="Vehicle make and model"
            className="mb-3 min-h-12 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface"
          />
          <TextInput
            value={vehiclePlate}
            onChangeText={setVehiclePlate}
            placeholder="Number plate (e.g. GR 1234-25)"
            autoCapitalize="characters"
            accessibilityLabel="Vehicle number plate"
            className="mb-3 min-h-12 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface"
          />
          <TextInput
            value={vehicleColor}
            onChangeText={setVehicleColor}
            placeholder="Colour (e.g. Silver)"
            accessibilityLabel="Vehicle colour"
            className="mb-4 min-h-12 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface"
          />
          {vehicleError ? (
            <Text accessibilityLiveRegion="polite" className="mb-3 text-center font-body-md text-body-md text-error">
              {vehicleError}
            </Text>
          ) : null}
          <PrimaryButton
            label={vehicleBusy ? "Saving…" : "Save vehicle"}
            loading={vehicleBusy}
            disabled={!vehicleMake.trim() && !vehiclePlate.trim() && !vehicleColor.trim()}
            onPress={() => void saveVehicle()}
          />
          <View className="mt-3">
            <SecondaryButton label="Cancel" onPress={() => setVehicleVisible(false)} />
          </View>
        </View>
      </BottomSheet>
    </Screen>
  );
}
