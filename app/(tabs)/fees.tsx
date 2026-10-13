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
import { useHome } from "../../src/hooks/useHome";
import type { FeeStatus } from "../../src/lib/models";

const FILTERS: Array<"All" | FeeStatus> = ["All", "overdue", "pending", "paid"];

export default function FeesScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useFees();
  const home = useHome();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const invoices = useMemo(() => {
    if (!data || !home.data) return [];
    const currentSchoolChildren = new Set(home.data.children.map((child) => child.id));
    const currentSchoolInvoices = data.filter((invoice) =>
      currentSchoolChildren.has(invoice.studentId),
    );
    if (filter === "All") return currentSchoolInvoices;
    return currentSchoolInvoices.filter((invoice) => invoice.status === filter);
  }, [data, filter, home.data]);

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

      {(isLoading && !data) || (home.isLoading && !home.data) ? <SkeletonBlock /> : null}
      {isError || home.isError ? (
        <ErrorBanner
          message="Couldn't load your fees."
          onRetry={() => {
            void refetch();
            void home.refetch();
          }}
        />
      ) : null}
      {invoices.length === 0 && data && home.data ? (
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
