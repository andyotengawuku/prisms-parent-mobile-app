import React from "react";
import { Text, View } from "react-native";
import { MoneyText } from "./MoneyText";
import { formatGhs } from "../lib/money";

type Props = {
  balanceMinor: number;
  /** Backend currently models a daily limit, not weekly — null hides the meter. */
  weeklyLimitMinor: number | null;
  childName?: string;
};

export function LunchWalletCard({
  balanceMinor,
  weeklyLimitMinor,
  childName,
}: Props) {
  const hasLimit = weeklyLimitMinor !== null && weeklyLimitMinor > 0;
  const pct = hasLimit
    ? Math.min(100, Math.round((balanceMinor / (weeklyLimitMinor as number)) * 100))
    : 0;
  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={`Lunch wallet${childName ? ` for ${childName}` : ""}, balance ${formatGhs(balanceMinor)}${hasLimit ? `, weekly limit ${formatGhs(weeklyLimitMinor as number)}` : ""}`}
      className="overflow-hidden rounded-lg bg-primary p-gutter-card"
    >
      <Text className="mb-1 font-label-md text-label-md text-on-primary/80">
        Lunch wallet{childName ? ` · ${childName}` : ""}
      </Text>
      <MoneyText minorUnits={balanceMinor} className="mb-3 text-on-primary" />
      {hasLimit && (
        <>
          <View className="mb-1 h-2 overflow-hidden rounded-full bg-on-primary/20">
            <View
              className="h-full rounded-full bg-secondary-container"
              style={{ width: `${pct}%` }}
            />
          </View>
          <Text className="font-label-md text-label-md text-on-primary/80">
            {formatGhs(balanceMinor)} of {formatGhs(weeklyLimitMinor as number)} weekly limit
          </Text>
        </>
      )}
    </View>
  );
}
