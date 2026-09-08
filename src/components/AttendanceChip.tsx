import React from "react";
import { Text, View } from "react-native";
import type { AttendanceStatus } from "../lib/sample-data";

type Props = {
  status: AttendanceStatus;
  arrivedAt?: string;
};

function formatTime(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function AttendanceChip({ status, arrivedAt }: Props) {
  const time = formatTime(arrivedAt);
  let label = "Not yet";
  let a11y = "Not yet arrived";
  let bg = "bg-surface-container-high";
  let fg = "text-on-surface-variant";

  if (status === "present") {
    label = time ? `Present · ${time}` : "Present";
    a11y = time ? `Present, arrived ${time}` : "Present";
    bg = "bg-secondary/12";
    fg = "text-secondary";
  } else if (status === "absent") {
    label = "Absent";
    a11y = "Absent";
    bg = "bg-tertiary/12";
    fg = "text-tertiary";
  }

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={a11y}
      className={`rounded-full px-3 py-1 ${bg}`}
    >
      <Text className={`font-label-md text-label-md ${fg}`}>{label}</Text>
    </View>
  );
}
