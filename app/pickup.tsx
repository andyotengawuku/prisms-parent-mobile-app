import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AppBar,
  PrimaryButton,
  QRDisplay,
  Screen,
} from "../src/components";

export default function PickupScreen() {
  const router = useRouter();
  const token = useMemo(
    () => `PASS-KWAME-${new Date().toISOString().slice(0, 10)}`,
    [],
  );

  return (
    <Screen scroll>
      <AppBar
        title="Gate pass"
        subtitle="Show this QR at the security desk"
        onBack={() => router.back()}
      />
      <View className="mb-6 items-center">
        <QRDisplay token={token} caption="Valid today only" />
      </View>
      <View className="mb-4 rounded-lg bg-surface-container-low p-gutter-card">
        <Text className="mb-1 font-label-md text-label-md text-on-surface-variant">
          Student
        </Text>
        <Text className="font-headline-sm text-headline-sm text-on-surface">
          Kwame Mensah · JHS 2A
        </Text>
        <Text className="mt-2 font-body-md text-body-md text-on-surface-variant">
          Authorized picker: Akosua Mensah (Mother)
        </Text>
      </View>
      <Text className="mb-4 font-body-md text-body-md text-on-surface-variant">
        One-time pass. The QR refreshes when you reopen this screen. Never
        screenshot and share outside your trusted pickup persons.
      </Text>
      <PrimaryButton label="Close" onPress={() => router.back()} />
    </Screen>
  );
}
