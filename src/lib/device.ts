import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "prisms_device_id";

let deviceIdInitialization: Promise<string> | null = null;

/** Stable per-install device identifier used for refresh-token binding. */
export async function getDeviceId(): Promise<string> {
  if (!deviceIdInitialization) {
    deviceIdInitialization = (async () => {
      const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
      if (existing) return existing;
      const id = Crypto.randomUUID();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
      return id;
    })().finally(() => {
      deviceIdInitialization = null;
    });
  }
  return deviceIdInitialization;
}

export function getPlatform(): "ios" | "android" {
  return Platform.OS === "ios" ? "ios" : "android";
}
