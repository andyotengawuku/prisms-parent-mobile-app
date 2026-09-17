import React, { useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import {
  AppBar,
  PINInput,
  PinKeypad,
  PrimaryButton,
  Screen,
} from "../../src/components";

export default function PinScreen() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [error, setError] = useState<string | undefined>();

  const active = step === "create" ? pin : confirm;
  const setActive = step === "create" ? setPin : setConfirm;

  const onDigit = (d: string) => {
    if (active.length >= 4) return;
    setError(undefined);
    setActive(active + d);
  };

  const onDelete = () => setActive(active.slice(0, -1));

  const onContinue = () => {
    if (step === "create") {
      if (pin.length < 4) return;
      setStep("confirm");
      return;
    }
    if (confirm !== pin) {
      setError("PINs don't match. Try again.");
      setConfirm("");
      return;
    }
    router.push("/(auth)/biometric");
  };

  return (
    <Screen>
      <AppBar
        title={step === "create" ? "Create PIN" : "Confirm PIN"}
        subtitle="4-digit PIN unlocks the app on this device"
        onBack={() => {
          if (step === "confirm") {
            setStep("create");
            setConfirm("");
          } else {
            router.back();
          }
        }}
      />
      <Text className="mb-4 text-center font-body-md text-body-md text-on-surface-variant">
        {step === "create"
          ? "Choose a PIN you can remember"
          : "Enter the same PIN again"}
      </Text>
      <PINInput filled={active.length} />
      {error ? (
        <Text className="mb-3 text-center font-label-md text-label-md text-error">
          {error}
        </Text>
      ) : null}
      <PinKeypad onDigit={onDigit} onDelete={onDelete} />
      <PrimaryButton
        label={step === "create" ? "Continue" : "Save PIN"}
        disabled={active.length < 4}
        onPress={onContinue}
      />
    </Screen>
  );
}
