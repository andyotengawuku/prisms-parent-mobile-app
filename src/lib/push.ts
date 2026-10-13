import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { apiFetch, getAccessToken } from "./api";
import { getDeviceId, getPlatform } from "./device";

const EXPO_PUSH_TOKEN_KEY = "prisms_expo_push_token";

/**
 * Registers the device for push notifications with the backend.
 * Best-effort: skips when permission or project configuration is unavailable.
 */
export async function registerPushIfAvailable(
  requestPermission = true,
): Promise<void> {
  try {
    if (!(await getAccessToken())) return;

    if (getPlatform() === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "School updates",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#76023a",
      });
    }

    const settings = await Notifications.getPermissionsAsync();
    let granted = settings.granted;
    if (!granted && requestPermission && settings.canAskAgain) {
      const request = await Notifications.requestPermissionsAsync();
      granted = request.granted;
    }
    if (!granted) return;

    // Expo push service token — this is what the backend's /devices endpoint
    // stores and what Expo's servers use to deliver.
    const token = await Notifications.getExpoPushTokenAsync({
      projectId:
        Constants.easConfig?.projectId ??
        Constants.expoConfig?.extra?.eas?.projectId ??
        process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    });
    const expoPushToken = token.data;
    if (!expoPushToken) return;

    const response = await apiFetch("/v1/mobile/devices", {
      method: "POST",
      body: JSON.stringify({
        expoPushToken,
        platform: getPlatform(),
        deviceId: await getDeviceId(),
      }),
    });
    if (!response.error) {
      await SecureStore.setItemAsync(EXPO_PUSH_TOKEN_KEY, expoPushToken);
    }
  } catch {
    // Push is an enhancement, never a blocker.
  }
}

/** Revoke this installation's push registration before ending the session. */
export async function unregisterPush(): Promise<void> {
  const expoPushToken = await SecureStore.getItemAsync(EXPO_PUSH_TOKEN_KEY);
  if (!expoPushToken) return;

  try {
    const response = await apiFetch("/v1/mobile/devices", {
      method: "DELETE",
      body: JSON.stringify({ expoPushToken }),
    });
    if (!response.error || response.error.code === "HTTP_404") {
      await SecureStore.deleteItemAsync(EXPO_PUSH_TOKEN_KEY);
    }
  } catch {
    // Keep the token so a later authenticated session can retry revocation.
  }
}
