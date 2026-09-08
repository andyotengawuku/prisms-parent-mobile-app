import React, { useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  AppBar,
  GhostButton,
  PrimaryButton,
  Screen,
} from "../../src/components";
import { setTokens } from "../../src/lib/api";

export default function BiometricScreen() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);

  const enableBiometric = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !enrolled) {
      setEnabled(false);
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Enable biometric unlock for PRISMS Parent",
      cancelLabel: "Not now",
    });
    setEnabled(result.success);
  };

  const finish = async () => {
    // Demo tokens until mobile auth API ships
    await setTokens("demo-access-token", "demo-refresh-token");
    router.replace("/(tabs)/home");
  };

  return (
    <Screen>
      <AppBar
        title="Biometrics"
        subtitle="Optional — unlock with Face ID or fingerprint"
        onBack={() => router.back()}
      />
      <View className="mb-8 flex-1 items-center justify-center">
        <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-primary/12">
          <MaterialCommunityIcons
            name="fingerprint"
            size={48}
            color="#00629e"
          />
        </View>
        <Text className="mb-2 text-center font-headline-sm text-headline-sm text-on-surface">
          Faster, safer unlock
        </Text>
        <Text className="max-w-xs text-center font-body-md text-body-md text-on-surface-variant">
          Biometrics stay on this device. We never send fingerprints or face
          data to PRISMS.
        </Text>
        {enabled ? (
          <Text className="mt-4 font-label-md text-label-md text-secondary">
            Biometrics enabled
          </Text>
        ) : null}
      </View>
      <PrimaryButton
        label={enabled ? "Continue" : "Enable biometrics"}
        onPress={enabled ? finish : enableBiometric}
      />
      {!enabled ? (
        <GhostButton label="Skip for now" onPress={finish} />
      ) : null}
    </Screen>
  );
}
