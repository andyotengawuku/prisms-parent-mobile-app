import React, { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  AppBar,
  ChildCard,
  ErrorBanner,
  GhostButton,
  HubNav,
  LunchWalletCard,
  OutstandingBanner,
  PressableScale,
  Screen,
  SectionHeader,
  SkeletonBlock,
} from "../../src/components";
import { useHome } from "../../src/hooks/useHome";
import { logoutSession } from "../../src/lib/api";
import { unregisterPush } from "../../src/lib/push";

const TINTS = {
  maroon: { bg: "#ffd9e2", fg: "#76023a" },
  gold: { bg: "#ffdf9b", fg: "#7a5900" },
  green: { bg: "#96f7b0", fg: "#006d37" },
  rose: { bg: "#ffe3e0", fg: "#b3261e" },
  teal: { bg: "#c6f0ef", fg: "#00696d" },
  violet: { bg: "#e8dcff", fg: "#5b3a9c" },
} as const;

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);
  const { data, isLoading, isError, refetch } = useHome();

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      try {
        await Promise.race([
          unregisterPush(),
          new Promise<void>((resolve) => setTimeout(resolve, 2000)),
        ]);
      } catch {
        // Continue signing out if the push registration cannot be revoked.
      }
      await logoutSession();
    } catch {
      // Clear the screen and local query data even if secure storage fails.
    } finally {
      queryClient.clear();
      router.replace("/(auth)/login");
    }
  };

  if (isLoading && !data) {
    return (
      <Screen>
        <AppBar title="PRIS" showLogo />
        <SkeletonBlock />
        <SkeletonBlock />
        <GhostButton
          label={signingOut ? "Signing out…" : "Sign out"}
          onPress={() => void signOut()}
        />
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen>
        <AppBar title="PRIS" showLogo />
        <ErrorBanner
          message="Couldn't load your home feed."
          onRetry={() => refetch()}
        />
        <GhostButton
          label={signingOut ? "Signing out…" : "Sign out"}
          onPress={() => void signOut()}
        />
      </Screen>
    );
  }

  const firstChildId = data.children[0]?.id;

  return (
    <Screen scroll padded edges={["top", "left", "right"]}>
      <AppBar
        eyebrow="PRIS Parents"
        title={`${data.greeting}, ${data.parentName.split(" ")[0]}`}
        subtitle="Here's what's happening today"
        showLogo
      />

      <HubNav
        onCenterPress={() => router.push("/pickup")}
        satellites={[
          {
            key: "attendance",
            label: "Attendance",
            icon: "calendar-check-outline",
            tint: TINTS.green,
            onPress: () =>
              router.push(firstChildId ? `/child/${firstChildId}` : "/(tabs)/academics"),
          },
          {
            key: "canteen",
            label: "Canteen",
            icon: "food-outline",
            tint: TINTS.gold,
            onPress: () => router.push("/canteen"),
          },
          {
            key: "fees",
            label: "Fees",
            icon: "cash",
            tint: TINTS.green,
            onPress: () => router.push("/(tabs)/fees"),
          },
          {
            key: "notify",
            label: "Notify",
            icon: "email-alert-outline",
            tint: TINTS.teal,
            onPress: () => router.push("/notice"),
          },
          {
            key: "academics",
            label: "Results",
            icon: "file-document-outline",
            tint: TINTS.violet,
            onPress: () => router.push("/(tabs)/academics"),
          },
          {
            key: "alerts",
            label: "Alerts",
            icon: "bell-outline",
            tint: TINTS.rose,
            onPress: () => router.push("/(tabs)/alerts"),
          },
        ]}
      />

      {/* one-tap notices, SmartSapp-style */}
      <View className="mb-stack-md mt-stack-sm flex-row gap-3">
        <PressableScale
          onPress={() => router.push("/notice?type=lateness")}
          accessibilityRole="button"
          accessibilityLabel="Will be late"
          className="min-h-touch-target-min flex-1 flex-row items-center justify-center gap-2 rounded-full bg-secondary-container px-4"
        >
          <MaterialCommunityIcons name="clock-alert-outline" size={20} color={TINTS.gold.fg} />
          <Text className="font-headline-sm text-body-md text-on-secondary-container">
            Will be late
          </Text>
        </PressableScale>
        <PressableScale
          onPress={() => router.push("/notice?type=absence")}
          accessibilityRole="button"
          accessibilityLabel="Will be absent"
          className="min-h-touch-target-min flex-1 flex-row items-center justify-center gap-2 rounded-full bg-primary-container px-4"
        >
          <MaterialCommunityIcons name="home-remove-outline" size={20} color={TINTS.maroon.fg} />
          <Text className="font-headline-sm text-body-md text-on-primary-container">
            Will be absent
          </Text>
        </PressableScale>
      </View>

      <SectionHeader title="Your children" />
      <FlatList
        horizontal
        data={data.children}
        keyExtractor={(c) => c.id}
        showsHorizontalScrollIndicator={false}
        snapToInterval={268}
        decelerationRate="fast"
        contentContainerStyle={{ paddingBottom: 8 }}
        renderItem={({ item }) => (
          <ChildCard
            child={item}
            onPress={() => router.push(`/child/${item.id}`)}
          />
        )}
        className="mb-stack-md"
      />

      {data.outstandingMinor > 0 ? (
        <OutstandingBanner
          amountMinor={data.outstandingMinor}
          onPay={() => router.push("/(tabs)/fees")}
        />
      ) : null}

      <SectionHeader title="Lunch wallet" />
      {data.lunchWalletAvailable ? (
        <LunchWalletCard
          balanceMinor={data.lunchWalletMinor}
          weeklyLimitMinor={data.lunchWeeklyLimitMinor}
          childName={data.children[0]?.firstName}
        />
      ) : (
        <Text className="font-body-md text-body-md text-on-surface-variant">
          No lunch wallet is set up for your children.
        </Text>
      )}
      <View className="mt-stack-lg">
        <GhostButton
          label={signingOut ? "Signing out…" : "Sign out"}
          onPress={() => void signOut()}
        />
      </View>
    </Screen>
  );
}
