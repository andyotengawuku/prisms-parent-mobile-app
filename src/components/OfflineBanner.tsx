import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  visible?: boolean;
  message?: string;
};

export function OfflineBanner({
  visible = true,
  message = "You're offline. Showing cached data.",
}: Props) {
  if (!visible) return null;
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      className="mb-stack-sm flex-row items-center gap-2 rounded-md bg-surface-container-high px-3 py-2"
    >
      <MaterialCommunityIcons name="wifi-off" size={18} color="#3f4852" />
      <Text className="flex-1 font-label-md text-label-md text-on-surface-variant">
        {message}
      </Text>
    </View>
  );
}
