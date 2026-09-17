import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PressableScale } from "./PressableScale";

type Props = {
  onDigit: (digit: string) => void;
  onDelete: () => void;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"] as const;

export function PinKeypad({ onDigit, onDelete }: Props) {
  return (
    <View className="w-full max-w-sm self-center">
      <View className="flex-row flex-wrap justify-center">
        {KEYS.map((key, idx) => {
          if (key === "") {
            return <View key={`empty-${idx}`} className="m-2 h-16 w-16" />;
          }
          if (key === "del") {
            return (
              <PressableScale
                key="del"
                onPress={onDelete}
                accessibilityRole="button"
                accessibilityLabel="Delete"
                className="m-2 h-16 w-16 items-center justify-center rounded-full bg-surface-container-high"
              >
                <MaterialCommunityIcons
                  name="backspace-outline"
                  size={24}
                  color="#1a1c1e"
                />
              </PressableScale>
            );
          }
          return (
            <PressableScale
              key={key}
              onPress={() => onDigit(key)}
              accessibilityRole="button"
              accessibilityLabel={`Digit ${key}`}
              className="m-2 h-16 w-16 items-center justify-center rounded-full bg-surface-container-high"
            >
              <Text className="font-headline-md text-headline-md text-on-surface">
                {key}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}
