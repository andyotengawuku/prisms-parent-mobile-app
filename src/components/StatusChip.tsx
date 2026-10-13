import React from "react";
import { Text, View } from "react-native";
import type { FeeStatus } from "../lib/models";

type Props = {
  status: FeeStatus;
  fraction?: string;
};

export function StatusChip({ status, fraction }: Props) {
  const map = {
    overdue: {
      label: fraction ? `Overdue · ${fraction}` : "Overdue",
      bg: "bg-tertiary/12",
      fg: "text-tertiary",
    },
    paid: {
      label: "Paid",
      bg: "bg-secondary/12",
      fg: "text-secondary",
    },
    pending: {
      label: "Pending",
      bg: "bg-primary/12",
      fg: "text-primary",
    },
  } as const;

  const cfg = map[status];
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={cfg.label}
      className={`rounded-full px-2.5 py-1 ${cfg.bg}`}
    >
      <Text className={`font-label-md text-label-md ${cfg.fg}`}>{cfg.label}</Text>
    </View>
  );
}
