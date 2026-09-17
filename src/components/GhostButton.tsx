import React from "react";
import { Text } from "react-native";
import { PressableScale } from "./PressableScale";

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function GhostButton({
  label,
  onPress,
  disabled,
  accessibilityLabel,
}: Props) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      className={`h-touch-target-min min-h-touch-target-min w-full items-center justify-center rounded-full px-6 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <Text className="font-headline-sm text-body-lg text-primary">{label}</Text>
    </PressableScale>
  );
}
