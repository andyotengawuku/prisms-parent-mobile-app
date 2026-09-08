import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import {
  AppBar,
  ChildCard,
  EmptyState,
  ErrorBanner,
  Screen,
  SkeletonBlock,
} from "../../src/components";
import { useChildren } from "../../src/hooks/useChildren";

export default function ChildrenScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useChildren();

  return (
    <Screen scroll>
      <AppBar title="Children" subtitle="Linked students" />
      {isLoading && !data ? <SkeletonBlock /> : null}
      {isError ? (
        <ErrorBanner
          message="Couldn't load children."
          onRetry={() => refetch()}
        />
      ) : null}
      {data && data.length === 0 ? (
        <EmptyState
          title="No children linked"
          description="Ask the school office to link your mobile number to your wards."
          icon="account-child-outline"
        />
      ) : null}
      <View className="gap-3">
        {data?.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            className="mr-0 w-full"
            onPress={() => router.push(`/child/${child.id}`)}
          />
        ))}
      </View>
    </Screen>
  );
}
