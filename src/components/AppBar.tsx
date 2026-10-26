import React from "react";
import { Image, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PressableScale } from "./PressableScale";

type Props = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  onBack?: () => void;
  showLogo?: boolean;
  right?: React.ReactNode;
};

export function AppBar({ title, subtitle, eyebrow, onBack, showLogo, right }: Props) {
  return (
    <View className="flex-row items-center justify-between min-h-touch-target-min mb-stack-sm">
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
              color="#1c1a17"
            />
          </PressableScale>
        ) : null}
        {showLogo ? (
          <Image
            source={require("../../assets/school-logo.png")}
            style={{ width: 44, height: 44 }}
            accessibilityLabel="School logo"
          />
        ) : null}
        <View className="flex-1">
          {eyebrow ? (
            <Text
              className="font-label-md text-label-md text-primary uppercase"
              numberOfLines={1}
            >
              {eyebrow}
            </Text>
          ) : null}
          {title ? (
            <Text
              className="font-display-lg text-display-lg text-on-surface"
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
