import React, { useEffect } from "react";
import {
  Modal,
  Pressable,
  View,
  AccessibilityInfo,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SheetHandle } from "./SheetHandle";

const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function BottomSheet({ visible, onClose, children }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(400);
  const scrim = useSharedValue(0);

  useEffect(() => {
    let reduce = false;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      reduce = v;
      const dur = reduce ? 0 : 260;
      if (visible) {
        translateY.value = withTiming(0, { duration: dur, easing: EASE });
        scrim.value = withTiming(1, { duration: dur, easing: EASE });
      } else {
        translateY.value = withTiming(400, { duration: dur, easing: EASE });
        scrim.value = withTiming(0, { duration: dur, easing: EASE });
      }
    });
  }, [visible, translateY, scrim]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: scrim.value * 0.4,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View className="flex-1 justify-end">
        <Animated.View
          style={scrimStyle}
          className="absolute inset-0 bg-black"
        >
          <Pressable
            className="flex-1"
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          />
        </Animated.View>
        <Animated.View
          style={[sheetStyle, { paddingBottom: Math.max(insets.bottom, 16) }]}
          className="rounded-t-xl bg-surface-container-lowest px-margin-page pt-1"
        >
          <SheetHandle />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
