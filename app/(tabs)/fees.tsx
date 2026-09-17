import React, { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AppBar,
  EmptyState,
  ErrorBanner,
  FilterChip,
  InvoiceCard,
  Screen,
  SkeletonBlock,
} from "../../src/components";
import { useFees } from "../../src/hooks/useFees";
import type { FeeStatus } from "../../src/lib/sample-data";

const FILTERS: Array<"All" | FeeStatus> = ["All", "overdue", "pending", "paid"];

export default function FeesScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useFees();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const invoices = useMemo(() => {
    if (!data) return [];
    if (filter === "All") return data;
    return data.filter((i) => i.status === filter);
  }, [data, filter]);

  return (
    <Screen>
      <AppBar title="Fees" subtitle="Invoices & receipts" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-stack-md max-h-12"
      >
        {FILTERS.map((f) => (
          <FilterChip
            key={f}
            label={f === "All" ? "All" : f[0]!.toUpperCase() + f.slice(1)}
            selected={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </ScrollView>

      {isLoading && !data ? <SkeletonBlock /> : null}
      {isError ? (
        <ErrorBanner
          message="Couldn't load invoices."
          onRetry={() => refetch()}
        />
      ) : null}
      {invoices.length === 0 && data ? (
        <EmptyState
          title="No invoices"
          description="Nothing matches this filter."
          icon="receipt"
        />
      ) : null}

      <ScrollView showsVerticalScrollIndicator={false}>
        {invoices.map((inv) => (
          <InvoiceCard
            key={inv.id}
            invoice={inv}
            onPress={() => {
              if (inv.status !== "paid") {
                router.push(`/fees/pay-invoice/${inv.id}`);
              }
            }}
          />
        ))}
        <View className="h-8" />
      </ScrollView>
    </Screen>
  );
}
