import React, { useRef } from "react";
import { TextInput, View } from "react-native";

type Props = {
  value: string;
  onChange: (code: string) => void;
  length?: number;
};

export function OTPInput({ value, onChange, length = 6 }: Props) {
  const refs = useRef<(TextInput | null)[]>([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  const setAt = (index: number, char: string) => {
    const next = digits.map((d, i) => (i === index ? char : d === " " ? "" : d));
    const joined = next.join("").replace(/\s/g, "").slice(0, length);
    onChange(joined);
    if (char && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  return (
    <View
      accessibilityLabel={`One-time code, ${value.length} of ${length} digits entered`}
      className="mb-stack-md flex-row justify-between gap-2"
    >
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digits[i]?.trim() ?? ""}
          onChangeText={(t) => {
            const entered = t.replace(/\D/g, "").slice(0, length);
            if (entered.length > 1) {
              const prefix = digits
                .slice(0, i)
                .filter((digit) => digit !== " ")
                .join("");
              const next = `${prefix}${entered}`.slice(0, length);
              onChange(next);
              refs.current[Math.min(next.length, length - 1)]?.focus();
              return;
            }
            const digit = entered.slice(-1);
            setAt(i, digit);
          }}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === "Backspace" && !digits[i]?.trim() && i > 0) {
              refs.current[i - 1]?.focus();
            }
          }}
          keyboardType="number-pad"
          selectTextOnFocus
          allowFontScaling={false}
          accessibilityLabel={`OTP digit ${i + 1}`}
          className="h-14 w-12 rounded-md border border-outline-variant bg-surface-container-lowest text-center font-headline-md text-headline-md text-on-surface"
        />
      ))}
    </View>
  );
}
