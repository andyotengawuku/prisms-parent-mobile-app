import React from "react";
import { Text, View } from "react-native";
import type { MovementStatus } from "../lib/models";

const LABELS: Record<MovementStatus, string> = {
  at_school: "At school",
  at_home: "At home",
  in_transit: "In transit",
  unknown: "Status unavailable",
};

type Props = {
  status: MovementStatus;
};

export function MovementBadge({ status }: Props) {
  const label = LABELS[status];
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label}
      className="rounded-full bg-primary/12 px-2.5 py-1"
    >
      <Text className="font-label-md text-label-md text-primary">{label}</Text>
    </View>
  );
}
