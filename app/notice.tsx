import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  AppBar,
  EmptyState,
  ErrorBanner,
  FilterChip,
  PrimaryButton,
  Screen,
  SectionHeader,
  SkeletonBlock,
} from "../src/components";
import { useHome } from "../src/hooks/useHome";
import { useNotices } from "../src/hooks/useCanteen";
import { apiFetch } from "../src/lib/api";
import type { NoticeItem } from "../src/lib/models";

const EXPECTED_TIMES = ["07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30"];

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dayOptions(): Array<{ value: string; label: string }> {
  const today = new Date();
  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    const weekday = date.toLocaleDateString("en-GH", { weekday: "short" });
    return {
      value: isoDate(date),
      label: offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : `${weekday} ${date.getDate()}`,
    };
  });
}

function NoticeRow({ notice }: { notice: NoticeItem }) {
  const tone =
    notice.status === "pending" ? "text-primary" : notice.status === "dismissed" ? "text-error" : "text-secondary";
  return (
    <View className="border-b border-outline-variant/20 py-3">
      <View className="flex-row items-center justify-between">
        <Text className="font-body-md text-body-md text-on-surface">
          {notice.type === "absence" ? "Absence" : "Lateness"} · {notice.studentName}
        </Text>
        <Text className={`font-label-md text-label-md uppercase ${tone}`}>{notice.status}</Text>
      </View>
      <Text className="font-label-md text-label-md text-on-surface-variant" numberOfLines={2}>
        {notice.startDate}
        {notice.endDate ? ` → ${notice.endDate}` : ""}
        {notice.expectedTime ? ` · expected ${notice.expectedTime}` : ""} — {notice.reason}
      </Text>
    </View>
  );
}

export default function NoticeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const home = useHome();
  const children = home.data?.children ?? [];
  const notices = useNotices();
  const params = useLocalSearchParams<{ type?: string }>();

  const [selectedChildId, setSelectedChildId] = useState<string>();
  const selectedChild = children.find((child) => child.id === selectedChildId) ?? children[0];

  const [type, setType] = useState<"absence" | "lateness">(
    params.type === "lateness" ? "lateness" : "absence",
  );
  const [startDate, setStartDate] = useState(() => isoDate(new Date()));
  const [endDate, setEndDate] = useState<string | null>(null);
  const [expectedTime, setExpectedTime] = useState("08:30");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  const days = dayOptions();

  const submit = async () => {
    if (!selectedChild || submitting) return;
    setSubmitting(true);
    setError(undefined);
    setSuccess(undefined);
    try {
      const res = await apiFetch("/v1/mobile/notices", {
        method: "POST",
        body: JSON.stringify({
          studentId: selectedChild.id,
          type,
          startDate,
          endDate: type === "absence" ? endDate : null,
          expectedTime: type === "lateness" ? expectedTime : null,
          reason: reason.trim(),
        }),
      });
      if (!res.data) {
        setError(res.error?.message ?? "Could not send the notice.");
        return;
      }
      setSuccess("Notice sent — the school has been notified.");
      setReason("");
      setEndDate(null);
      void queryClient.invalidateQueries({ queryKey: ["notices"] });
    } catch {
      setError("Network problem — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (home.isLoading && !home.data) {
    return (
      <Screen>
        <AppBar title="Notify school" onBack={() => router.back()} />
        <SkeletonBlock />
      </Screen>
    );
  }

  if (home.isError || !home.data) {
    return (
      <Screen>
        <AppBar title="Notify school" onBack={() => router.back()} />
        <ErrorBanner message="Couldn't load your children." onRetry={() => void home.refetch()} />
      </Screen>
    );
  }

  if (children.length === 0) {
    return (
      <Screen>
        <AppBar title="Notify school" onBack={() => router.back()} />
        <EmptyState
          title="No children linked"
          description="Ask the school office to link your account to your child."
          icon="account-child-outline"
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <AppBar
        title="Notify school"
        subtitle="Tell the school about an absence or lateness ahead of time"
        onBack={() => router.back()}
      />

      {children.length > 1 ? (
        <View className="mb-4 flex-row flex-wrap">
          {children.map((child) => (
            <FilterChip
              key={child.id}
              label={`${child.firstName} ${child.lastName}`}
              selected={child.id === selectedChild?.id}
              onPress={() => setSelectedChildId(child.id)}
            />
          ))}
        </View>
      ) : null}

      <View className="mb-4 flex-row gap-3">
        {(["absence", "lateness"] as const).map((option) => (
          <FilterChip
            key={option}
            label={option === "absence" ? "Will be absent" : "Will be late"}
            selected={type === option}
            onPress={() => setType(option)}
          />
        ))}
      </View>

      <SectionHeader title={type === "absence" ? "First day absent" : "Day arriving late"} />
      <View className="mb-4 flex-row flex-wrap">
        {days.map((day) => (
          <FilterChip
            key={day.value}
            label={day.label}
            selected={startDate === day.value}
            onPress={() => {
              setStartDate(day.value);
              if (endDate && endDate < day.value) setEndDate(null);
            }}
          />
        ))}
      </View>

      {type === "absence" ? (
        <>
          <SectionHeader title="Last day (optional)" />
          <View className="mb-4 flex-row flex-wrap">
            <FilterChip
              label="Single day"
              selected={endDate === null}
              onPress={() => setEndDate(null)}
            />
            {days
              .filter((day) => day.value > startDate)
              .slice(0, 5)
              .map((day) => (
                <FilterChip
                  key={day.value}
                  label={day.label}
                  selected={endDate === day.value}
                  onPress={() => setEndDate(day.value)}
                />
              ))}
          </View>
        </>
      ) : (
        <>
          <SectionHeader title="Expected arrival" />
          <View className="mb-4 flex-row flex-wrap">
            {EXPECTED_TIMES.map((time) => (
              <FilterChip
                key={time}
                label={time}
                selected={expectedTime === time}
                onPress={() => setExpectedTime(time)}
              />
            ))}
          </View>
        </>
      )}

      <Text className="mb-2 font-label-md text-label-md text-on-surface-variant">Reason</Text>
      <TextInput
        value={reason}
        onChangeText={setReason}
        multiline
        placeholder="e.g. Medical appointment"
        accessibilityLabel="Reason for the notice"
        className="mb-4 min-h-24 rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-4 font-body-md text-body-md text-on-surface"
      />

      {success ? (
        <Text accessibilityLiveRegion="polite" className="mb-3 text-center font-body-md text-body-md text-secondary">
          {success}
        </Text>
      ) : null}
      {error ? (
        <Text accessibilityLiveRegion="polite" className="mb-3 text-center font-body-md text-body-md text-error">
          {error}
        </Text>
      ) : null}

      <PrimaryButton
        label={submitting ? "Sending…" : "Send notice"}
        loading={submitting}
        disabled={reason.trim().length < 3}
        onPress={() => void submit()}
      />

      <View className="mt-stack-lg">
        <SectionHeader title="Your recent notices" />
        {notices.isLoading && !notices.data ? (
          <SkeletonBlock />
        ) : notices.data && notices.data.length > 0 ? (
          notices.data.map((notice) => <NoticeRow key={notice.id} notice={notice} />)
        ) : (
          <Text className="font-body-md text-body-md text-on-surface-variant">
            No notices in the last 30 days.
          </Text>
        )}
      </View>
    </Screen>
  );
}
