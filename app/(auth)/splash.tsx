import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components";
import { getAccessToken } from "../../src/lib/api";
import { registerPushIfAvailable } from "../../src/lib/push";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getAccessToken();
        if (cancelled) return;
        if (token) {
          void registerPushIfAvailable(false);
          router.replace("/(tabs)/home");
        } else {
          router.replace("/(auth)/login");
        }
      } catch {
        if (cancelled) return;
        router.replace("/(auth)/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <Screen padded={false} edges={["top", "bottom", "left", "right"]}>
      <View className="flex-1 items-center justify-center bg-primary">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-2xl bg-primary-container">
          <Text className="font-display-lg text-display-lg text-on-primary-container">
            P
          </Text>
        </View>
        <Text className="font-display-lg text-[24px] text-on-primary">
          PRISMS
        </Text>
        <Text className="mt-2 font-body-md text-body-md text-on-primary/80">
          Parent
        </Text>
      </View>
    </Screen>
  );
}
