import React, { useEffect } from "react";
import { AccessibilityInfo, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

type Props = {
  height?: number;
  className?: string;
};

export function Skeleton({ height = 16, className = "" }: Props) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!mounted || reduce) return;
      opacity.value = withRepeat(
        withTiming(1, { duration: 800, easing: EASE }),
        -1,
        true,
      );
    });
    return () => {
      mounted = false;
    };
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[{ height }, style]}
      className={`w-full rounded-md bg-surface-container-high ${className}`}
    />
  );
}

export function SkeletonBlock() {
  return (
    <View className="mb-3 gap-2 rounded-lg bg-surface-container-lowest p-gutter-card">
      <Skeleton height={18} className="w-2/3" />
      <Skeleton height={14} className="w-1/2" />
      <Skeleton height={24} className="w-1/3 mt-2" />
    </View>
  );
}
