import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GhostButton } from "./GhostButton";

type Props = {
  message: string;
  onRetry?: () => void;
};

export function ErrorBanner({ message, onRetry }: Props) {
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      className="mb-stack-md rounded-lg bg-error-container p-gutter-card"
    >
      <View className="mb-2 flex-row items-start gap-2">
        <MaterialCommunityIcons name="alert-circle" size={20} color="#93000a" />
        <Text className="flex-1 font-body-md text-body-md text-on-error-container">
          {message}
        </Text>
      </View>
      {onRetry ? (
        <GhostButton
          label="Try again"
          onPress={onRetry}
          accessibilityLabel="Try again"
        />
      ) : null}
    </View>
  );
}
