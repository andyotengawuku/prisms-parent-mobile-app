import * as Notifications from "expo-notifications";
import { apiFetch, getAccessToken } from "./api";
import { getDeviceId, getPlatform } from "./device";

/**
 * Registers the device for push notifications with the backend.
 * Best-effort: silently skips on simulators or when permission is denied —
 * the app works fully without push.
 */
export async function registerPushIfAvailable(): Promise<void> {
  try {
    if (!(await getAccessToken())) return;

    const settings = await Notifications.getPermissionsAsync();
    let granted = settings.granted;
    if (!granted && settings.canAskAgain) {
      const request = await Notifications.requestPermissionsAsync();
      granted = request.granted;
    }
    if (!granted) return;

    // Expo push service token — this is what the backend's /devices endpoint
    // stores and what Expo's servers use to deliver.
    const token = await Notifications.getExpoPushTokenAsync();
    const expoPushToken = token.data;
    if (!expoPushToken) return;

    await apiFetch("/v1/mobile/devices", {
      method: "POST",
      body: JSON.stringify({
        expoPushToken,
        platform: getPlatform(),
        deviceId: await getDeviceId(),
      }),
    });
  } catch {
    // Push is an enhancement, never a blocker.
  }
}
