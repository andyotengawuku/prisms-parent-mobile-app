import React from "react";
import {
  AppBar,
  AlertRow,
  EmptyState,
  ErrorBanner,
  Screen,
  SkeletonBlock,
} from "../../src/components";
import { useAlerts } from "../../src/hooks/useFees";

export default function AlertsScreen() {
  const { data, isLoading, isError, refetch } = useAlerts();

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
        <AlertRow key={alert.id} alert={alert} />
      ))}
    </Screen>
  );
}
