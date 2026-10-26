import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PressableScale } from "./PressableScale";

export type TabKey = "home" | "children" | "academics" | "fees" | "alerts";

type TabDef = {
  key: TabKey;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconFocused: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

const TABS: TabDef[] = [
  { key: "home", label: "Home", icon: "home-outline", iconFocused: "home" },
  {
    key: "children",
    label: "Children",
    icon: "account-group-outline",
    iconFocused: "account-group",
  },
  {
    key: "academics",
    label: "Academics",
    icon: "book-open-page-variant-outline",
    iconFocused: "book-open-page-variant",
  },
  {
    key: "fees",
    label: "Fees",
    icon: "cash-multiple",
    iconFocused: "cash-multiple",
  },
  {
    key: "alerts",
    label: "Alerts",
    icon: "bell-outline",
    iconFocused: "bell",
  },
];

type Props = {
  active: TabKey;
  onChange: (key: TabKey) => void;
  unreadAlerts?: number;
};

export function TabBar({ active, onChange, unreadAlerts = 0 }: Props) {
  return (
    <View className="flex-row border-t border-outline-variant/40 bg-surface-container-lowest px-2 pt-1 pb-2">
      {TABS.map((tab) => {
        const selected = tab.key === active;
        const color = selected ? "#76023a" : "#837377";
        return (
          <PressableScale
            key={tab.key}
            scaleTo={0.9}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={
              tab.key === "alerts" && unreadAlerts > 0
                ? `${tab.label}, ${unreadAlerts} unread`
                : tab.label
            }
            className="flex-1 items-center justify-center min-h-touch-target-min py-1"
          >
            <View className="relative">
              <MaterialCommunityIcons
                name={selected ? tab.iconFocused : tab.icon}
                size={24}
                color={color}
              />
              {tab.key === "alerts" && unreadAlerts > 0 ? (
                <View className="absolute -right-1.5 -top-0.5 h-2 w-2 rounded-full bg-tertiary" />
              ) : null}
            </View>
            <Text
              className={`mt-0.5 text-label-md font-label-md ${
                selected ? "text-primary" : "text-outline"
              }`}
            >
              {tab.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
