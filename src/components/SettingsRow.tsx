import React from "react";
import { Switch, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PressableScale } from "./PressableScale";

type Props = {
  label: string;
  subtitle?: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  onPress?: () => void;
  switchValue?: boolean;
  onSwitchChange?: (v: boolean) => void;
};

export function SettingsRow({
  label,
  subtitle,
  icon,
  onPress,
  switchValue,
  onSwitchChange,
}: Props) {
  const isSwitch = typeof switchValue === "boolean";
  const body = (
    <>
      {icon ? (
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-surface-container-high">
          <MaterialCommunityIcons name={icon} size={20} color="#76023a" />
        </View>
      ) : null}
      <View className="flex-1">
        <Text className="font-body-lg text-body-lg text-on-surface">{label}</Text>
        {subtitle ? (
          <Text className="font-body-md text-body-md text-on-surface-variant">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          accessibilityLabel={label}
          trackColor={{ false: "#d5c2c6", true: "#ffc904" }}
          thumbColor="#ffffff"
        />
      ) : (
        <MaterialCommunityIcons name="chevron-right" size={22} color="#837377" />
      )}
    </>
  );

  if (isSwitch) {
    return (
      <View className="min-h-touch-target-min flex-row items-center border-b border-outline-variant/30 py-3">
        {body}
      </View>
    );
  }

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="min-h-touch-target-min flex-row items-center border-b border-outline-variant/30 py-3"
    >
      {body}
    </PressableScale>
  );
}
