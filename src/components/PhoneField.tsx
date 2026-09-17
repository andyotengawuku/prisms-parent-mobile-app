import React from "react";
import { Text, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  label?: string;
  error?: string;
};

export function PhoneField({
  value,
  onChangeText,
  label = "Mobile number",
  error,
}: Props) {
  return (
    <View className="mb-stack-md">
      <Text className="mb-2 font-label-md text-label-md text-on-surface-variant">
        {label}
      </Text>
      <View
        className={`h-touch-target-min min-h-touch-target-min flex-row items-center overflow-hidden rounded-md border ${
          error ? "border-error" : "border-outline-variant"
        } bg-surface-container-lowest`}
      >
        <View className="h-full items-center justify-center border-r border-outline-variant bg-surface-container-low px-3">
          <Text className="font-body-lg text-body-lg text-on-surface">+233</Text>
        </View>
        <TextInput
          value={value}
          onChangeText={(t) => onChangeText(t.replace(/\D/g, "").slice(0, 9))}
          keyboardType="phone-pad"
          placeholder="24 123 4567"
          placeholderTextColor="#6f7883"
          accessibilityLabel="Ghana mobile number"
          className="flex-1 px-3 font-body-lg text-body-lg text-on-surface"
          allowFontScaling
        />
      </View>
      {error ? (
        <Text className="mt-1 font-label-md text-label-md text-error">{error}</Text>
      ) : null}
    </View>
  );
}
