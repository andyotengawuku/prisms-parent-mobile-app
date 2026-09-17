import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "prisms_device_id";

function randomId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/** Stable per-install device identifier used for refresh-token binding. */
export async function getDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = randomId();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  return id;
}

export function getPlatform(): "ios" | "android" {
  return Platform.OS === "ios" ? "ios" : "android";
}
