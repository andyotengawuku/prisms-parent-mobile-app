import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PrimaryButton } from "./PrimaryButton";

type Props = {
  title: string;
  description?: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  icon = "inbox-outline",
  actionLabel,
  onAction,
}: Props) {
  return (
    <View
      accessibilityRole="summary"
      className="items-center px-6 py-12"
    >
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
        <MaterialCommunityIcons name={icon} size={32} color="#6f7883" />
      </View>
      <Text className="mb-2 text-center font-headline-sm text-headline-sm text-on-surface">
        {title}
      </Text>
      {description ? (
        <Text className="mb-6 text-center font-body-md text-body-md text-on-surface-variant">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}
