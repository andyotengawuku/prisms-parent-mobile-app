import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { AlertItem } from "../lib/models";
import { PressableScale } from "./PressableScale";

const ICONS: Record<
  AlertItem["category"],
  React.ComponentProps<typeof MaterialCommunityIcons>["name"]
> = {
  attendance: "clipboard-check-outline",
  fees: "cash",
  pickup: "qrcode",
  academic: "school-outline",
  announcement: "bullhorn-outline",
};

type Props = {
  alert: AlertItem;
  onPress?: () => void;
};

export function AlertRow({ alert, onPress }: Props) {
  const time = new Date(alert.createdAt).toLocaleString("en-GH", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${alert.unread ? "Unread. " : ""}${alert.title}. ${alert.body}. ${time}`}
      className="mb-2 flex-row items-start gap-3 rounded-lg bg-surface-container-lowest p-gutter-card border border-outline-variant/30"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/12">
        <MaterialCommunityIcons
          name={ICONS[alert.category]}
          size={20}
          color="#00629e"
        />
      </View>
      <View className="flex-1">
        <View className="mb-0.5 flex-row items-center gap-2">
          <Text className="flex-1 font-headline-sm text-body-md text-on-surface">
            {alert.title}
          </Text>
          {alert.unread ? (
            <View
              accessibilityLabel="Unread"
              className="h-2 w-2 rounded-full bg-primary"
            />
          ) : null}
        </View>
        <Text className="mb-1 font-body-md text-body-md text-on-surface-variant">
          {alert.body}
        </Text>
        <Text className="font-label-md text-label-md text-outline">{time}</Text>
      </View>
    </PressableScale>
  );
}
