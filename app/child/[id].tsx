import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AppBar,
  AttendanceChip,
  LunchWalletCard,
  MovementBadge,
  Screen,
  SegmentedControl,
} from "../../src/components";
import { SAMPLE_CHILDREN, SAMPLE_HOME } from "../../src/lib/sample-data";

const SECTIONS = ["Overview", "Attendance", "Fees", "Pickup"] as const;

export default function ChildDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [section, setSection] = useState<(typeof SECTIONS)[number]>("Overview");

  const child = useMemo(
    () => SAMPLE_CHILDREN.find((c) => c.id === id) ?? SAMPLE_CHILDREN[0]!,
    [id],
  );
  const name = `${child.firstName} ${child.lastName}`;

  return (
    <Screen scroll>
      <AppBar
        title={name}
        subtitle={`${child.className} · ${child.house}`}
        onBack={() => router.back()}
      />
      <SegmentedControl
        options={[...SECTIONS]}
        value={section}
        onChange={(v) => setSection(v as (typeof SECTIONS)[number])}
      />

      {section === "Overview" ? (
        <View className="gap-3">
          <View className="flex-row flex-wrap gap-2">
            <AttendanceChip
              status={child.attendance.status}
              arrivedAt={child.attendance.arrivedAt}
            />
            <MovementBadge status={child.movement} />
          </View>
          <LunchWalletCard
            balanceMinor={SAMPLE_HOME.lunchWalletMinor}
            weeklyLimitMinor={SAMPLE_HOME.lunchWeeklyLimitMinor}
            childName={name}
          />
          <View className="rounded-lg bg-surface-container-low p-gutter-card">
            <Text className="font-body-md text-body-md text-on-surface">
              Parent contact on file: Akosua Mensah · +233 24 123 4567
            </Text>
          </View>
        </View>
      ) : null}

      {section === "Attendance" ? (
        <View className="gap-2">
          {[
            { day: "Wed 3 Sep", status: "Present", time: "7:52 AM" },
            { day: "Tue 2 Sep", status: "Present", time: "7:48 AM" },
            { day: "Mon 1 Sep", status: "Late", time: "8:12 AM" },
          ].map((row) => (
            <View
              key={row.day}
              accessibilityLabel={`${row.day}, ${row.status}, arrived ${row.time}`}
              className="flex-row items-center justify-between rounded-lg bg-surface-container-lowest p-gutter-card border border-outline-variant/30"
            >
              <Text className="font-body-lg text-body-lg text-on-surface">
                {row.day}
              </Text>
              <Text className="font-label-md text-label-md text-secondary">
                {row.status} · {row.time}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {section === "Fees" ? (
        <View className="rounded-lg bg-surface-container-lowest p-gutter-card border border-outline-variant/30">
          <Text className="font-headline-sm text-body-lg text-on-surface">
            Tuition — Term 3
          </Text>
          <Text
            accessibilityLabel="Overdue, ₵1,250.00, due 15 Oct"
            className="mt-1 font-currency-display text-currency-display text-tertiary"
          >
            ₵1,250.00
          </Text>
          <Text className="font-label-md text-label-md text-on-surface-variant">
            Overdue · due 15 Oct
          </Text>
        </View>
      ) : null}

      {section === "Pickup" ? (
        <View className="gap-3">
          <Text className="font-body-md text-body-md text-on-surface-variant">
            Authorized pickup persons for {child.firstName}
          </Text>
          {["Akosua Mensah (Mother)", "Kwesi Owusu (Uncle)"].map((p) => (
            <View
              key={p}
              className="rounded-lg bg-surface-container-lowest p-gutter-card border border-outline-variant/30"
            >
              <Text className="font-body-lg text-body-lg text-on-surface">
                {p}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
