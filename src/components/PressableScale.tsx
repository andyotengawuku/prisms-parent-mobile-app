import React, { useEffect, useState } from "react";
import { AccessibilityInfo, Pressable, PressableProps } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  scaleTo?: number;
  children: React.ReactNode;
  className?: string;
};

export function PressableScale({
  scaleTo = 0.95,
  children,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduceMotion(v);
    });
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      style={[style, rest.style]}
      onPressIn={(e) => {
        if (!reduceMotion) {
          scale.value = withTiming(scaleTo, { duration: 180, easing: EASE });
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (!reduceMotion) {
          scale.value = withTiming(1, { duration: 200, easing: EASE });
        }
        onPressOut?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
