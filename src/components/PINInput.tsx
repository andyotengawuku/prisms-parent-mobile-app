import React from "react";
import { View } from "react-native";

type Props = {
  length?: number;
  filled: number;
};

export function PINInput({ length = 4, filled }: Props) {
  return (
    <View
      accessibilityLabel={`PIN, ${filled} of ${length} digits entered`}
      className="mb-stack-md flex-row items-center justify-center gap-4"
    >
      {Array.from({ length }).map((_, i) => (
        <View
          key={i}
          className={`h-4 w-4 rounded-full ${
            i < filled ? "bg-primary" : "bg-outline-variant"
          }`}
        />
      ))}
    </View>
  );
}
