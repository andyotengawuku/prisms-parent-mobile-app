import React from "react";
import { Text, View } from "react-native";
import type { Child } from "../lib/sample-data";
import { AttendanceChip } from "./AttendanceChip";
import { MovementBadge } from "./MovementBadge";
import { PressableScale } from "./PressableScale";

type Props = {
  child: Child;
  onPress?: () => void;
  selected?: boolean;
  className?: string;
};

export function ChildCard({ child, onPress, selected, className = "" }: Props) {
  const name = `${child.firstName} ${child.lastName}`;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={`${name}, ${child.className}, ${child.house}`}
      className={`mr-3 w-64 rounded-lg bg-surface-container-lowest p-gutter-card ${
        selected ? "border-2 border-primary" : "border border-outline-variant/30"
      } ${className}`}
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-primary-container">
        <Text className="font-headline-sm text-headline-sm text-on-primary-container">
          {child.firstName[0]}
          {child.lastName[0]}
        </Text>
      </View>
      <Text className="font-headline-sm text-headline-sm text-on-surface" numberOfLines={1}>
        {name}
      </Text>
      <Text className="mb-2 font-body-md text-body-md text-on-surface-variant">
        {child.className} · {child.house}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        <AttendanceChip
          status={child.attendance.status}
          arrivedAt={child.attendance.arrivedAt}
        />
        <MovementBadge status={child.movement} />
      </View>
    </PressableScale>
  );
}
