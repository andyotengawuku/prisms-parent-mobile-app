import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AppBar,
  AlertRow,
  EmptyState,
  ErrorBanner,
  Screen,
  SkeletonBlock,
} from "../../src/components";
import { useAlerts } from "../../src/hooks/useFees";
import { apiFetch } from "../../src/lib/api";

export default function AlertsScreen() {
  const { data, isLoading, isError, refetch } = useAlerts();
  const queryClient = useQueryClient();

  const markRead = async (id: string) => {
    const res = await apiFetch<{ success: boolean }>("/notifications", {
      method: "POST",
      body: JSON.stringify({ notificationIds: [id] }),
    });
    if (res.error) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["alerts"] }),
      queryClient.invalidateQueries({ queryKey: ["home"] }),
    ]);
  };

  return (
    <Screen scroll>
      <AppBar title="Alerts" subtitle="Attendance, fees, pickup & more" />
      {isLoading && !data ? <SkeletonBlock /> : null}
      {isError ? (
        <ErrorBanner
          message="Couldn't load alerts."
          onRetry={() => refetch()}
        />
      ) : null}
      {data && data.length === 0 ? (
        <EmptyState
          title="You're all caught up"
          description="New school notices will appear here."
          icon="bell-check-outline"
        />
      ) : null}
      {data?.map((alert) => (
        <AlertRow
          key={alert.id}
          alert={alert}
          onPress={alert.unread ? () => void markRead(alert.id) : undefined}
        />
      ))}
    </Screen>
  );
}
