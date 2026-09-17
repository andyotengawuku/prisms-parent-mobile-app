import React from "react";
import { Text } from "react-native";
import { formatGhs } from "../lib/money";

type Props = {
  minorUnits: number;
  className?: string;
  accessibilityLabel?: string;
};

export function MoneyText({ minorUnits, className = "", accessibilityLabel }: Props) {
  const formatted = formatGhs(minorUnits);
  return (
    <Text
      className={`font-currency-display text-currency-display text-on-surface ${className}`}
      accessibilityLabel={accessibilityLabel ?? formatted}
    >
      {formatted}
    </Text>
  );
}
