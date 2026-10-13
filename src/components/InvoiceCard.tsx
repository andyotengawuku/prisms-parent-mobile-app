import React from "react";
import { Text, View } from "react-native";
import type { Invoice } from "../lib/models";
import { formatGhs } from "../lib/money";
import { MoneyText } from "./MoneyText";
import { StatusChip } from "./StatusChip";
import { PressableScale } from "./PressableScale";

type Props = {
  invoice: Invoice;
  onPress?: () => void;
};

function formatDue(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function InvoiceCard({ invoice, onPress }: Props) {
  const remaining = invoice.amountMinor - invoice.paidMinor;
  const due = formatDue(invoice.dueDate);
  const fraction =
    invoice.status === "overdue" || invoice.status === "pending"
      ? `${Math.round((invoice.paidMinor / invoice.amountMinor) * 12) || 0}/12`
      : undefined;

  const a11y =
    invoice.status === "overdue"
      ? `Overdue, ${formatGhs(remaining)}, due ${due}`
      : invoice.status === "paid"
        ? `Paid, ${formatGhs(invoice.amountMinor)}`
        : `Pending, ${formatGhs(remaining)}, due ${due}`;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${invoice.title}, ${invoice.childName}. ${a11y}`}
      className={`mb-3 overflow-hidden rounded-lg bg-surface-container-lowest ${
        invoice.status === "overdue" ? "border-l-4 border-l-tertiary" : ""
      } border border-outline-variant/30`}
    >
      <View className="p-gutter-card">
        <View className="mb-2 flex-row items-start justify-between gap-2">
          <View className="flex-1">
            <Text className="font-headline-sm text-body-lg text-on-surface">
              {invoice.title}
            </Text>
            <Text className="font-body-md text-body-md text-on-surface-variant">
              {invoice.childName}
            </Text>
          </View>
          <StatusChip status={invoice.status} fraction={fraction} />
        </View>
        <MoneyText
          minorUnits={remaining > 0 ? remaining : invoice.amountMinor}
          className="mb-1"
        />
        <Text className="font-label-md text-label-md text-on-surface-variant">
          Due {due} · {invoice.term}
        </Text>
      </View>
    </PressableScale>
  );
}
