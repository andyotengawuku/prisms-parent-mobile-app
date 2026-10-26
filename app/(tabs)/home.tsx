import React, { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  AppBar,
  ChildCard,
  ErrorBanner,
  GhostButton,
  LunchWalletCard,
  OutstandingBanner,
  QuickActionTile,
  Screen,
  SectionHeader,
  SkeletonBlock,
} from "../../src/components";
import { useHome } from "../../src/hooks/useHome";
import { logoutSession } from "../../src/lib/api";
import { unregisterPush } from "../../src/lib/push";

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

  return (
    <Screen scroll padded edges={["top", "left", "right"]}>
      <AppBar
        eyebrow="PRIS Parents"
        title={`${data.greeting}, ${data.parentName.split(" ")[0]}`}
        subtitle="Here's what's happening today"
        showLogo
      />
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

      <SectionHeader title="Quick actions" />
      <View className="mb-stack-md flex-row gap-3">
        <QuickActionTile
          label="Pay fees"
          icon="cash"
          tint="green"
          onPress={() => router.push("/(tabs)/fees")}
        />
        <QuickActionTile
          label="Gate pass"
          icon="qrcode"
          tint="maroon"
          onPress={() => router.push("/pickup")}
        />
      </View>
      <View className="mb-stack-md flex-row gap-3">
        <QuickActionTile
          label="Report cards"
          icon="file-document-outline"
          tint="violet"
          onPress={() => router.push("/(tabs)/academics")}
        />
        <QuickActionTile
          label="Alerts"
          icon="bell-outline"
          tint="rose"
          onPress={() => router.push("/(tabs)/alerts")}
        />
      </View>
      <View className="mb-stack-md flex-row gap-3">
        <QuickActionTile
          label="Canteen"
          icon="food-outline"
          tint="gold"
          onPress={() => router.push("/canteen")}
        />
        <QuickActionTile
          label="Notify school"
          icon="email-alert-outline"
          tint="teal"
          onPress={() => router.push("/notice")}
        />
      </View>

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
