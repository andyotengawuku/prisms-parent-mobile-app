import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PressableScale } from "./PressableScale";

type Tint = "maroon" | "gold" | "green" | "rose" | "teal" | "violet";

const TINTS: Record<Tint, { bg: string; fg: string }> = {
  maroon: { bg: "#ffd9e2", fg: "#76023a" },
  gold: { bg: "#ffdf9b", fg: "#7a5900" },
  green: { bg: "#96f7b0", fg: "#006d37" },
  rose: { bg: "#ffe3e0", fg: "#b3261e" },
  teal: { bg: "#c6f0ef", fg: "#00696d" },
  violet: { bg: "#e8dcff", fg: "#5b3a9c" },
};

type Props = {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  tint?: Tint;
  onPress?: () => void;
};

export function QuickActionTile({ label, icon, tint = "maroon", onPress }: Props) {
  const colors = TINTS[tint];
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="min-h-[88px] flex-1 items-start justify-between rounded-xl bg-surface-container-lowest p-gutter-card border border-outline-variant/30"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.bg }}
      >
        <MaterialCommunityIcons name={icon} size={22} color={colors.fg} />
      </View>
      <Text className="mt-3 font-headline-sm text-body-md text-on-surface">
        {label}
      </Text>
    </PressableScale>
  );
}
