import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PressableScale } from "./PressableScale";

type Satellite = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  tint: { bg: string; fg: string };
  onPress: () => void;
};

type Props = {
  centerLabel?: string;
  onCenterPress: () => void;
  satellites: Satellite[];
};

const SIZE = 340;
const CENTER = SIZE / 2;
const RADIUS = 112;
const SATELLITE_SIZE = 56;
const CENTER_SIZE = 108;

/**
 * Radial hub: a big central action with satellite features arranged on a ring,
 * SmartSapp-style. Satellites are positioned with absolute layout maths.
 */
export function HubNav({ centerLabel = "Gate pass", onCenterPress, satellites }: Props) {
  const angleFor = (index: number) =>
    (-90 + index * (360 / Math.max(satellites.length, 1))) * (Math.PI / 180);

  return (
    <View style={{ width: SIZE, height: SIZE }} className="self-center">
      {/* orbit ring */}
      <View
        className="absolute rounded-full border border-dashed border-outline-variant/50"
        style={{
          width: RADIUS * 2,
          height: RADIUS * 2,
          left: CENTER - RADIUS,
          top: CENTER - RADIUS,
        }}
      />

      {/* center action */}
      <PressableScale
        onPress={onCenterPress}
        accessibilityRole="button"
        accessibilityLabel={centerLabel}
        style={{
          position: "absolute",
          left: CENTER - CENTER_SIZE / 2,
          top: CENTER - CENTER_SIZE / 2,
          width: CENTER_SIZE,
          height: CENTER_SIZE,
        }}
        className="items-center justify-center rounded-full bg-primary"
      >
        <MaterialCommunityIcons name="qrcode" size={36} color="#ffffff" />
        <Text className="mt-1 font-label-md text-label-md text-on-primary">
          {centerLabel}
        </Text>
      </PressableScale>

      {/* satellites */}
      {satellites.map((item, index) => {
        const angle = angleFor(index);
        const x = CENTER + RADIUS * Math.cos(angle);
        const y = CENTER + RADIUS * Math.sin(angle);
        return (
          <View
            key={item.key}
            style={{
              position: "absolute",
              left: x - 38,
              top: y - 30,
              width: 76,
              alignItems: "center",
            }}
          >
            <PressableScale
              onPress={item.onPress}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={{
                width: SATELLITE_SIZE,
                height: SATELLITE_SIZE,
                backgroundColor: item.tint.bg,
              }}
              className="items-center justify-center rounded-full"
            >
              <MaterialCommunityIcons name={item.icon} size={24} color={item.tint.fg} />
            </PressableScale>
            <Text
              className="mt-1 text-center font-label-md text-label-md text-on-surface-variant"
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
