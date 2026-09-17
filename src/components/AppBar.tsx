import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PressableScale } from "./PressableScale";

type Props = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export function AppBar({ title, subtitle, onBack, right }: Props) {
  return (
    <View className="flex-row items-center justify-between h-touch-target-min min-h-touch-target-min mb-stack-sm">
      <View className="flex-row items-center gap-3 flex-1">
        {onBack ? (
          <PressableScale
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-touch-target-min w-touch-target-min items-center justify-center"
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#1a1c1e"
            />
          </PressableScale>
        ) : null}
        <View className="flex-1">
          {title ? (
            <Text
              className="font-headline-sm text-headline-sm text-on-surface"
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text
              className="font-body-md text-body-md text-on-surface-variant"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {right ? <View className="ml-2">{right}</View> : null}
    </View>
  );
}
