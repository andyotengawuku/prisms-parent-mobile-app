import React from "react";
import { View } from "react-native";

export function SheetHandle() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      className="mb-3 mt-2 items-center"
    >
      <View className="h-1 w-10 rounded-full bg-outline-variant" />
    </View>
  );
}
