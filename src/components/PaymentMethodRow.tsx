import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PressableScale } from "./PressableScale";

type Props = {
  label: string;
  subtitle?: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  selected?: boolean;
  onPress?: () => void;
};

export function PaymentMethodRow({
  label,
  subtitle,
  icon,
  selected,
  onPress,
}: Props) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={`${label}${subtitle ? `, ${subtitle}` : ""}${selected ? ", selected" : ""}`}
      className={`mb-2 min-h-touch-target-min flex-row items-center gap-3 rounded-lg border p-3 ${
        selected
          ? "border-primary bg-primary/12"
          : "border-outline-variant/40 bg-surface-container-lowest"
      }`}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-high">
        <MaterialCommunityIcons name={icon} size={22} color="#00629e" />
      </View>
      <View className="flex-1">
        <Text className="font-headline-sm text-body-lg text-on-surface">
          {label}
        </Text>
        {subtitle ? (
          <Text className="font-body-md text-body-md text-on-surface-variant">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {selected ? (
        <MaterialCommunityIcons name="check-circle" size={22} color="#00629e" />
      ) : null}
    </PressableScale>
  );
}
