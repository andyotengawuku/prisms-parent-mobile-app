import React from "react";
import { Text, View } from "react-native";
import { PressableScale } from "./PressableScale";

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel = "View All", onAction }: Props) {
  return (
    <View className="mb-stack-sm flex-row items-center justify-between">
      <Text className="font-headline-sm text-headline-sm text-on-surface">
        {title}
      </Text>
      {onAction ? (
        <PressableScale
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel}, ${title}`}
          className="min-h-touch-target-min justify-center px-2"
        >
          <Text className="font-label-md text-label-md text-primary">
            {actionLabel}
          </Text>
        </PressableScale>
      ) : null}
    </View>
  );
}
