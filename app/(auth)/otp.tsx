import React, { useState } from "react";
import { Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AppBar,
  GhostButton,
  OTPInput,
  PrimaryButton,
  Screen,
} from "../../src/components";

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const [code, setCode] = useState("");

  const masked = phone
    ? `+233 ${phone.slice(0, 2)} *** ${phone.slice(-3)}`
    : "+233 ** *** ***";

  return (
    <Screen scroll>
      <AppBar
        title="Enter code"
        subtitle={`Sent to ${masked}`}
        onBack={() => router.back()}
      />
      <Text className="mb-6 font-body-lg text-body-lg text-on-surface-variant">
        Type the 6-digit code from your SMS. Sample code for demo: 123456
      </Text>
      <OTPInput value={code} onChange={setCode} />
      <PrimaryButton
        label="Verify"
        disabled={code.length < 6}
        onPress={() => router.push("/(auth)/pin")}
      />
      <GhostButton label="Resend code" onPress={() => setCode("")} />
    </Screen>
  );
}
