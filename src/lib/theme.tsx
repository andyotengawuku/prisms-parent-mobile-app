import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";

type ThemeContextValue = {
  colorScheme: "light" | "dark";
  setColorScheme: (scheme: "light" | "dark" | "system") => void;
  preference: "light" | "dark" | "system";
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveScheme(
  preference: "light" | "dark" | "system",
  system: ColorSchemeName,
): "light" | "dark" {
  if (preference === "system") {
    return system === "dark" ? "dark" : "light";
  }
  return preference;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<"light" | "dark" | "system">(
    "system",
  );
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );
  const { setColorScheme: setNwScheme } = useNativeWindColorScheme();

  const colorScheme = resolveScheme(preference, systemScheme);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme: next }) => {
      setSystemScheme(next);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    setNwScheme(colorScheme);
  }, [colorScheme, setNwScheme]);

  const setColorScheme = useCallback(
    (scheme: "light" | "dark" | "system") => {
      setPreference(scheme);
    },
    [],
  );

  const value = useMemo(
    () => ({ colorScheme, setColorScheme, preference }),
    [colorScheme, setColorScheme, preference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
