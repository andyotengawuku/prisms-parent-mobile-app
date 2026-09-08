import React from "react";
import { ScrollView, View, ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = ViewProps & {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  className?: string;
  edges?: ("top" | "bottom" | "left" | "right")[];
};

export function Screen({
  children,
  scroll = false,
  padded = true,
  className = "",
  edges = ["top", "left", "right"],
  ...rest
}: Props) {
  const pad = padded ? "px-margin-page" : "";
  const body = scroll ? (
    <ScrollView
      className={`flex-1 ${pad}`}
      contentContainerClassName="pb-8"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${pad}`} {...rest}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={edges}
      className={`flex-1 bg-background ${className}`}
    >
      {body}
    </SafeAreaView>
  );
}
