import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PressableScale } from "./PressableScale";

type Props = {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  onPress?: () => void;
};

export function QuickActionTile({ label, icon, onPress }: Props) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="min-h-[88px] flex-1 items-start justify-between rounded-lg bg-surface-container-lowest p-gutter-card border border-outline-variant/30"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/12">
        <MaterialCommunityIcons name={icon} size={22} color="#00629e" />
      </View>
      <Text className="mt-3 font-headline-sm text-body-md text-on-surface">
        {label}
      </Text>
    </PressableScale>
  );
}
