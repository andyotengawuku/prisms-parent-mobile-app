import React, { useEffect } from "react";
import { Image, Text, View } from "react-native";
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
        <Image
          source={require("../../assets/school-logo.png")}
          style={{ width: 112, height: 112 }}
          accessibilityLabel="School logo"
        />
        <Text className="mt-4 font-display-lg text-[24px] text-on-primary">
          PRIS
        </Text>
        <Text className="mt-2 font-body-md text-body-md text-on-primary/80">
          Parents
        </Text>
        <Text className="mt-3 font-label-md text-label-md uppercase tracking-[0.18em] text-on-primary/60">
          Knowledge, Excellence &amp; Honour
        </Text>
      </View>
    </Screen>
  );
}
