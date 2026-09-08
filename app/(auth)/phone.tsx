import React, { useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AppBar,
  PhoneField,
  PrimaryButton,
  Screen,
} from "../../src/components";

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("241234567");
  const [error, setError] = useState<string | undefined>();

  const onContinue = () => {
    if (phone.length < 9) {
      setError("Enter a valid Ghana mobile number");
      return;
    }
    setError(undefined);
    router.push({ pathname: "/(auth)/otp", params: { phone } });
  };

  return (
    <Screen scroll>
      <AppBar title="Welcome" subtitle="Sign in with your mobile number" />
      <Text className="mb-6 font-body-lg text-body-lg text-on-surface-variant">
        We'll send a one-time code to verify it's you. Use the number linked to
        your children's school account.
      </Text>
      <PhoneField value={phone} onChangeText={setPhone} error={error} />
      <PrimaryButton label="Send code" onPress={onContinue} />
      <View className="mt-6">
        <Text className="text-center font-body-md text-body-md text-on-surface-variant">
          Sample: +233 24 123 4567 (Akosua Mensah)
        </Text>
      </View>
    </Screen>
  );
}
