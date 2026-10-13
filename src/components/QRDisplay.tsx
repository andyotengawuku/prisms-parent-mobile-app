import React from "react";
import { Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

type Props = {
  token: string;
  size?: number;
  caption?: string;
};

export function QRDisplay({
  token,
  size = 220,
  caption = "Valid today only",
}: Props) {
  return (
    <View className="items-center">
      <View
        accessibilityRole="image"
        accessibilityLabel={`Gate pass QR code, ${caption.toLowerCase()}`}
        className="rounded-lg bg-surface-container-lowest p-4 border border-outline-variant/40"
      >
        <QRCode value={token} size={size} color="#1a1c1e" backgroundColor="#ffffff" />
      </View>
      <Text className="mt-3 font-label-md text-label-md text-on-surface-variant">
        {caption}
      </Text>
    </View>
  );
}
