import React, { useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  AppBar,
  AttendanceChip,
  EmptyState,
  ErrorBanner,
  InvoiceCard,
  LunchWalletCard,
  MovementBadge,
  Screen,
  SegmentedControl,
  SkeletonBlock,
} from "../../src/components";
import { useHome } from "../../src/hooks/useHome";
import { useFees } from "../../src/hooks/useFees";
import { apiFetch } from "../../src/lib/api";

const SECTIONS = ["Overview", "Attendance", "Fees", "Pickup"] as const;

type ApiChildDetail = {
  id: string;
  firstName: string;
  lastName: string;
  isPickupAuthorized: boolean;
  enrollments: Array<{
    class: {
      name: string;
      stream?: string | null;
      academicYear?: { name: string } | null;
    };
  }>;
  pickupPersons: Array<{
    id: string;
    name: string;
    relationship?: string | null;
    phoneNumber?: string | null;
  }>;
};

type ApiAttendance = {
  attendances: Array<{
    id: string;
    date: string;
    status: string;
    createdAt: string;
  }>;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ChildDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [section, setSection] = useState<(typeof SECTIONS)[number]>("Overview");
  const home = useHome();
  const fees = useFees();

  const childQuery = useQuery({
    queryKey: ["child-detail", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await apiFetch<{ child: ApiChildDetail }>(
        `/parent/children/${encodeURIComponent(id)}`,
      );
      if (!res.data?.child) {
        throw new Error(res.error?.message ?? "Couldn't load child details");
      }
      return res.data.child;
    },
  });

  const attendance = useQuery({
    queryKey: ["child-attendance", id],
    enabled: Boolean(id) && section === "Attendance",
    queryFn: async () => {
      const res = await apiFetch<ApiAttendance>(
        `/parent/children/${encodeURIComponent(id)}/attendance?limit=30`,
      );
      if (!res.data) {
        throw new Error(res.error?.message ?? "Couldn't load attendance");
      }
      return res.data.attendances;
    },
  });

  const child = childQuery.data;
  const summary = home.data?.children.find((item) => item.id === id);
  const childIsInCurrentSchool = Boolean(summary);
  const childInvoices = fees.data?.filter((invoice) => invoice.studentId === id) ?? [];
  const enrollment = child?.enrollments[0]?.class;
  const className = [enrollment?.name, enrollment?.stream].filter(Boolean).join(" · ");
  const name = child ? `${child.firstName} ${child.lastName}` : "Child details";

  if ((childQuery.isLoading && !child) || (home.isLoading && !home.data)) {
    return (
      <Screen>
        <AppBar title="Child details" onBack={() => router.back()} />
        <SkeletonBlock />
        <SkeletonBlock />
      </Screen>
    );
  }

  if (home.isError) {
    return (
      <Screen>
        <AppBar title="Child details" onBack={() => router.back()} />
        <ErrorBanner
          message="Couldn't verify this child for the selected school."
          onRetry={() => void home.refetch()}
        />
      </Screen>
    );
  }

  if (!childIsInCurrentSchool || childQuery.isError || !child) {
    return (
      <Screen>
        <AppBar title="Child details" onBack={() => router.back()} />
        <ErrorBanner
          message="Couldn't load this child's information."
          onRetry={() => void childQuery.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <AppBar
        title={name}
        subtitle={className || enrollment?.academicYear?.name || "Student profile"}
        onBack={() => router.back()}
      />
      <SegmentedControl
        options={[...SECTIONS]}
        value={section}
        onChange={(value) => setSection(value as (typeof SECTIONS)[number])}
      />

      {section === "Overview" ? (
        <View className="gap-3">
          {summary ? (
            <View className="flex-row flex-wrap gap-2">
              <AttendanceChip
                status={summary.attendance.status}
                arrivedAt={summary.attendance.arrivedAt}
              />
              <MovementBadge status={summary.movement} />
            </View>
          ) : null}
          {summary?.hasLunchWallet ? (
            <LunchWalletCard
              balanceMinor={summary.lunchWalletMinor ?? 0}
              weeklyLimitMinor={null}
              childName={name}
            />
          ) : (
            <Text className="font-body-md text-body-md text-on-surface-variant">
              No lunch wallet is set up for this child.
            </Text>
          )}
        </View>
      ) : null}

      {section === "Attendance" ? (
        <View>
          {attendance.isLoading && !attendance.data ? <SkeletonBlock /> : null}
          {attendance.isError ? (
            <ErrorBanner
              message="Couldn't load attendance history."
              onRetry={() => void attendance.refetch()}
            />
          ) : null}
          {attendance.data?.length === 0 ? (
            <EmptyState
              title="No attendance records"
              description="Attendance history will appear here when the school records it."
              icon="calendar-blank-outline"
            />
          ) : null}
          {attendance.data?.map((record) => (
            <View
              key={record.id}
              accessibilityLabel={`${formatDate(record.date)}, ${record.status}`}
              className="mb-2 flex-row items-center justify-between rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-gutter-card"
            >
              <Text className="font-body-lg text-body-lg text-on-surface">
                {formatDate(record.date)}
              </Text>
              <Text className="font-label-md text-label-md text-secondary">
                {record.status}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {section === "Fees" ? (
        <View>
          {fees.isLoading && !fees.data ? <SkeletonBlock /> : null}
          {fees.isError ? (
            <ErrorBanner
              message="Couldn't load this child's invoices."
              onRetry={() => void fees.refetch()}
            />
          ) : null}
          {fees.data && childInvoices.length === 0 ? (
            <EmptyState
              title="No invoices"
              description="There are no invoices for this child yet."
              icon="script-text-outline"
            />
          ) : null}
          {childInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onPress={() => {
                if (invoice.status !== "paid") {
                  router.push(`/fees/pay-invoice/${invoice.id}`);
                }
              }}
            />
          ))}
        </View>
      ) : null}

      {section === "Pickup" ? (
        child.isPickupAuthorized ? (
          <View className="gap-3">
            <Text className="font-body-md text-body-md text-on-surface-variant">
              Authorized pickup persons for {child.firstName}
            </Text>
            {child.pickupPersons.length === 0 ? (
              <EmptyState
                title="No pickup persons listed"
                description="Ask the school office to update the authorized pickup list."
                icon="account-group-outline"
              />
            ) : null}
            {child.pickupPersons.map((person) => (
              <View
                key={person.id}
                className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-gutter-card"
              >
                <Text className="font-body-lg text-body-lg text-on-surface">
                  {person.name}
                </Text>
                {person.relationship || person.phoneNumber ? (
                  <Text className="font-body-md text-body-md text-on-surface-variant">
                    {[person.relationship, person.phoneNumber].filter(Boolean).join(" · ")}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            title="Pickup not authorized"
            description="This account isn't authorized to collect this child. Contact the school office if this is incorrect."
            icon="shield-lock-outline"
          />
        )
      ) : null}
    </Screen>
  );
}
