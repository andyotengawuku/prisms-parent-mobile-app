import React from "react";
import { ActivityIndicator, Text } from "react-native";
import { PressableScale } from "./PressableScale";

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  accessibilityLabel,
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      accessibilityLabel={accessibilityLabel ?? label}
      className={`h-touch-target-min min-h-touch-target-min w-full items-center justify-center rounded-full px-6 ${
        isDisabled ? "bg-outline-variant" : "bg-primary"
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text className="font-headline-sm text-body-lg text-on-primary">
          {label}
        </Text>
      )}
    </PressableScale>
  );
}
