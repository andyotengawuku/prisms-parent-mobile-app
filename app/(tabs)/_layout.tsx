import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHome } from "../../src/hooks/useHome";

/** Active-tab pill behind the icon, matching the Stitch design. */
function TabIcon({
  name,
  focused,
  color,
}: {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  focused: boolean;
  color: string;
}) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: 56,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? "#cfe5ff" : "transparent",
      }}
    >
      <MaterialCommunityIcons name={name} size={22} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { data } = useHome();
  const unread = data?.alertsUnread ?? 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#00629e",
        tabBarInactiveTintColor: "#6f7883",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#bec7d4",
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: "InterMedium",
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarAccessibilityLabel: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "home" : "home-outline"} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="children"
        options={{
          title: "Children",
          tabBarAccessibilityLabel: "Children",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "account-group" : "account-group-outline"}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="academics"
        options={{
          title: "Academics",
          tabBarAccessibilityLabel: "Academics",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "book-open-page-variant" : "book-open-page-variant-outline"}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          title: "Fees",
          tabBarAccessibilityLabel: "Fees",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "cash-multiple" : "cash-multiple"}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarAccessibilityLabel: "Alerts",
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarBadgeStyle: { backgroundColor: "#b4271d", color: "#ffffff" },
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "bell" : "bell-outline"} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
