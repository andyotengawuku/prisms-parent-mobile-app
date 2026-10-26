import React, { useState } from "react";
import { Image, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import {
  FilterChip,
  PinKeypad,
  PINInput,
  PrimaryButton,
  Screen,
} from "../../src/components";
import { apiFetch, setTokens } from "../../src/lib/api";
import { getDeviceId, getPlatform } from "../../src/lib/device";
import { registerPushIfAvailable } from "../../src/lib/push";

/** Sign in with the Parent ID and PIN issued by the school. */
export default function LoginScreen() {
  const router = useRouter();
  const [parentId, setParentId] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [schoolId, setSchoolId] = useState<string>();

  const onDigit = (d: string) => {
    if (busy || pin.length >= 4) return;
    setError(undefined);
    setPin(pin + d);
  };
  const onDelete = () => {
    if (!busy) setPin(pin.slice(0, -1));
  };

  const onSignIn = async () => {
    if (busy || pin.length < 4 || !parentId.trim()) return;
    if (schools.length > 0 && !schoolId) {
      setError("Choose a school to continue.");
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const res = await apiFetch<{
        accessToken: string;
        refreshToken: string;
      }>("/v1/mobile/auth/login", {
        method: "POST",
        body: JSON.stringify({
          systemId: parentId.trim(),
          pin,
          deviceId: await getDeviceId(),
          platform: getPlatform(),
          ...(schoolId ? { schoolId } : {}),
        }),
      });
      if (!res.data) {
        const availableSchools = res.error?.details?.schools;
        if (res.error?.code === "SCHOOL_SELECTION_REQUIRED" && Array.isArray(availableSchools)) {
          const choices = availableSchools.filter(
            (school): school is { id: string; name: string } =>
              Boolean(school) &&
              typeof school === "object" &&
              typeof (school as { id?: unknown }).id === "string" &&
              typeof (school as { name?: unknown }).name === "string",
          );
          setSchools(choices);
          setSchoolId(undefined);
          setError("Choose the school you want to access.");
          return;
        }
        setError(res.error?.message ?? "Sign-in failed. Try again.");
        setPin("");
        return;
      }
      await setTokens(res.data.accessToken, res.data.refreshToken);
      void registerPushIfAvailable();
      router.replace("/(tabs)/home");
    } catch {
      setError("Network problem — check your connection.");
      setPin("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View className="mb-4 items-center">
        <Image
          source={require("../../assets/school-logo.png")}
          style={{ width: 88, height: 88 }}
          accessibilityLabel="School logo"
        />
        <Text className="mt-3 font-label-md text-label-md uppercase tracking-widest text-primary">
          PRIS Parents
        </Text>
        <Text className="font-display-lg text-display-lg text-on-surface">
          Welcome back
        </Text>
        <Text className="text-center font-body-md text-body-md text-on-surface-variant">
          Sign in with your Parent ID and PIN
        </Text>
      </View>
      <Text className="mb-2 font-label-md text-label-md text-on-surface-variant">
        Parent ID
      </Text>
      <TextInput
        accessibilityLabel="Parent ID"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!busy}
        onChangeText={(value) => {
          setParentId(value);
          setSchools([]);
          setSchoolId(undefined);
          setError(undefined);
        }}
        placeholder="e.g. PR-2026-0142"
        placeholderTextColor="#6f7883"
        value={parentId}
        className="mb-4 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 font-body-md text-body-md text-on-surface"
      />
      {schools.length > 0 ? (
        <View className="mb-4">
          <Text className="mb-2 font-label-md text-label-md text-on-surface-variant">
            Choose school
          </Text>
          <View className="flex-row flex-wrap">
            {schools.map((school) => (
              <FilterChip
                key={school.id}
                label={school.name}
                selected={school.id === schoolId}
                onPress={() => {
                  setSchoolId(school.id);
                  setError(undefined);
                }}
              />
            ))}
          </View>
        </View>
      ) : null}
      <Text className="mb-2 font-label-md text-label-md text-on-surface-variant">
        PIN
      </Text>
      <PINInput filled={pin.length} />
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mb-3 mt-2 text-center font-label-md text-label-md text-error"
        >
          {error}
        </Text>
      ) : null}
      <View className="h-2" />
      <PinKeypad onDigit={onDigit} onDelete={onDelete} />
      <PrimaryButton
        label={busy ? "Signing in…" : "Sign in"}
        disabled={busy || pin.length < 4 || !parentId.trim() || (schools.length > 0 && !schoolId)}
        onPress={onSignIn}
      />
    </Screen>
  );
}
