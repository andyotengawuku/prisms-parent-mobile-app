import React from "react";
import { FlatList, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AppBar,
  ChildCard,
  ErrorBanner,
  LunchWalletCard,
  OfflineBanner,
  OutstandingBanner,
  QuickActionTile,
  Screen,
  SectionHeader,
  SkeletonBlock,
} from "../../src/components";
import { useHome } from "../../src/hooks/useHome";

export default function HomeScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useHome();

  if (isLoading && !data) {
    return (
      <Screen>
        <AppBar title="PRISMS" />
        <SkeletonBlock />
        <SkeletonBlock />
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen>
        <AppBar title="PRISMS" />
        <ErrorBanner
          message="Couldn't load your home feed."
          onRetry={() => refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll padded edges={["top", "left", "right"]}>
      <AppBar
        title={`${data.greeting}, ${data.parentName.split(" ")[0]}`}
        subtitle="Here's what's happening today"
      />
      <OfflineBanner visible={false} />

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
          onPay={() =>
            router.push(
              `/fees/pay-invoice/${data.outstandingInvoiceId ?? "inv-2026-term3-tuition"}`,
            )
          }
        />
      ) : null}

      <SectionHeader title="Quick actions" />
      <View className="mb-stack-md flex-row gap-3">
        <QuickActionTile
          label="Pay fees"
          icon="cash"
          onPress={() => router.push("/(tabs)/fees")}
        />
        <QuickActionTile
          label="Gate pass"
          icon="qrcode"
          onPress={() => router.push("/pickup")}
        />
      </View>
      <View className="mb-stack-md flex-row gap-3">
        <QuickActionTile
          label="Report cards"
          icon="file-document-outline"
          onPress={() => router.push("/(tabs)/academics")}
        />
        <QuickActionTile
          label="Alerts"
          icon="bell-outline"
          onPress={() => router.push("/(tabs)/alerts")}
        />
      </View>

      <SectionHeader title="Lunch wallet" />
      <LunchWalletCard
        balanceMinor={data.lunchWalletMinor}
        weeklyLimitMinor={data.lunchWeeklyLimitMinor}
        childName={data.children[0]?.firstName}
      />
    </Screen>
  );
}
