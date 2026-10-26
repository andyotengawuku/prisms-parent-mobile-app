import "../global.css";
import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from "@expo-google-fonts/outfit";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import * as SplashScreen from "expo-splash-screen";
import { ThemeProvider, useTheme } from "../src/lib/theme";
import * as Notifications from "expo-notifications";
import { getAccessToken, onAuthExpired } from "../src/lib/api";
import { useQueryClient } from "@tanstack/react-query";

void SplashScreen.preventAutoHideAsync().catch(() => {});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function RootNavigator() {
  const { colorScheme } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const queryClient = useQueryClient();
  const routeKey = segments.join("/");
  const inAuthFlow = segments[0] === "(auth)";

  useEffect(() => {
    if (!routeKey || routeKey === "index" || routeKey.startsWith("(auth)")) return;
    let active = true;
    void getAccessToken()
      .then((token) => {
        if (active && !token) router.replace("/(auth)/login");
      })
      .catch(() => {
        if (active) router.replace("/(auth)/login");
      });
    return () => {
      active = false;
    };
  }, [routeKey, router]);

  useEffect(
    () =>
      onAuthExpired(() => {
        queryClient.clear();
        if (!inAuthFlow) router.replace("/(auth)/login");
      }),
    [inAuthFlow, queryClient, router],
  );

  useEffect(() => {
    let handledResponse = false;
    const handleResponse = () => {
      if (handledResponse) return;
      handledResponse = true;
      void Notifications.clearLastNotificationResponseAsync().catch(() => {});
      router.push("/(tabs)/alerts");
    };
    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
    void Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) handleResponse();
      })
      .catch(() => {});
    return () => subscription.remove();
  }, [router]);

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="child/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen
          name="fees/pay-invoice/[id]"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="pickup" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="canteen" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="notice" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const [fontsLoaded] = useFonts({
    // mgTix-style pairing: Outfit for headings/figures, Plus Jakarta Sans for body.
    Inter: PlusJakartaSans_400Regular,
    InterMedium: PlusJakartaSans_500Medium,
    InterSemiBold: PlusJakartaSans_600SemiBold,
    InterBold: PlusJakartaSans_700Bold,
    OutfitSemiBold: Outfit_600SemiBold,
    OutfitBold: Outfit_700Bold,
    OutfitExtraBold: Outfit_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null; // the native splash stays up until fonts are ready
  }

  void SplashScreen.hideAsync().catch(() => {});

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
