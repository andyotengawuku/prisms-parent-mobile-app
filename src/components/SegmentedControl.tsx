import React from "react";
import { Text, View } from "react-native";
import { PressableScale } from "./PressableScale";

type Props = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export function SegmentedControl({ options, value, onChange }: Props) {
  return (
    <View
      accessibilityRole="tablist"
      className="mb-stack-md flex-row rounded-full bg-surface-container-high p-1"
    >
      {options.map((opt) => {
        const selected = opt === value;
        return (
          <PressableScale
            key={opt}
            scaleTo={0.95}
            onPress={() => onChange(opt)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={opt}
            className={`min-h-touch-target-min flex-1 items-center justify-center rounded-full px-2 ${
              selected ? "bg-surface-container-lowest" : ""
            }`}
          >
            <Text
              className={`font-label-md text-label-md ${
                selected ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              {opt}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
