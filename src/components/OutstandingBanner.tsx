import React from "react";
import { Text, View } from "react-native";
import { MoneyText } from "./MoneyText";
import { PrimaryButton } from "./PrimaryButton";
import { formatGhs } from "../lib/money";

type Props = {
  amountMinor: number;
  onPay?: () => void;
};

export function OutstandingBanner({ amountMinor, onPay }: Props) {
  const formatted = formatGhs(amountMinor);
  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={`Outstanding fees, ${formatted}`}
      className="mb-stack-md rounded-lg bg-error-container p-gutter-card"
    >
      <Text className="mb-1 font-label-md text-label-md text-on-error-container">
        Outstanding fees
      </Text>
      <MoneyText
        minorUnits={amountMinor}
        className="mb-3 text-on-error-container"
      />
      {onPay ? (
        <PrimaryButton
          label="Pay Now"
          onPress={onPay}
          accessibilityLabel={`Pay now, ${formatted} outstanding`}
        />
      ) : null}
    </View>
  );
}
