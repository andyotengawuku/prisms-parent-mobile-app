import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
        contentStyle: { backgroundColor: "#f9f9fc" },
      }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="phone" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="pin" />
      <Stack.Screen name="biometric" />
    </Stack>
  );
}
