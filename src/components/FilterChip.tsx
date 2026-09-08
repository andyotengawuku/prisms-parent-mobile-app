import React from "react";
import { Text } from "react-native";
import { PressableScale } from "./PressableScale";

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function FilterChip({ label, selected, onPress }: Props) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      className={`mr-2 min-h-touch-target-min items-center justify-center rounded-full px-4 ${
        selected
          ? "bg-primary"
          : "bg-surface-container-high border border-outline-variant/40"
      }`}
    >
      <Text
        className={`font-label-md text-label-md ${
          selected ? "text-on-primary" : "text-on-surface-variant"
        }`}
      >
        {label}
      </Text>
    </PressableScale>
  );
}
