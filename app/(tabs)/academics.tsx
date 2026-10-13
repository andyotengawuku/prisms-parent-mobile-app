import React, { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import {
  AppBar,
  EmptyState,
  ErrorBanner,
  FilterChip,
  Screen,
  SectionHeader,
  SkeletonBlock,
} from "../../src/components";
import { useHome } from "../../src/hooks/useHome";
import { apiFetch } from "../../src/lib/api";

type ApiGrade = {
  id: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
  remarks?: string | null;
  assessmentName?: string | null;
  subject: { name: string };
  term?: { name: string } | null;
};

type GradesResponse = {
  grades: ApiGrade[];
  summary?: { average?: number | null };
};

export default function AcademicsScreen() {
  const home = useHome();
  const children = home.data?.children ?? [];
  const [selectedChildId, setSelectedChildId] = useState<string>();
  const [selectedTerm, setSelectedTerm] = useState("All terms");
  const childId = children.some((child) => child.id === selectedChildId)
    ? selectedChildId
    : children[0]?.id;
  const child = children.find((item) => item.id === childId);

  const gradesQuery = useQuery({
    queryKey: ["child-grades", childId],
    enabled: Boolean(childId),
    queryFn: async () => {
      const res = await apiFetch<GradesResponse>(
        `/parent/children/${encodeURIComponent(childId!)}/grades`,
      );
      if (!res.data) {
        throw new Error(res.error?.message ?? "Couldn't load grades");
      }
      return res.data;
    },
  });

  const termOptions = useMemo(() => {
    const terms = new Set(
      (gradesQuery.data?.grades ?? [])
        .map((grade) => grade.term?.name)
        .filter((term): term is string => Boolean(term)),
    );
    return ["All terms", ...terms];
  }, [gradesQuery.data]);
  const visibleGrades = (gradesQuery.data?.grades ?? []).filter(
    (grade) => selectedTerm === "All terms" || grade.term?.name === selectedTerm,
  );

  return (
    <Screen scroll>
      <AppBar
        title="Academics"
        subtitle={child ? `${child.firstName} ${child.lastName}` : "Published grades"}
      />

      {home.isLoading && !home.data ? <SkeletonBlock /> : null}
      {home.isError ? (
        <ErrorBanner message="Couldn't load your children." onRetry={() => void home.refetch()} />
      ) : null}
      {children.length === 0 && home.data ? (
        <EmptyState
          title="No children linked"
          description="Ask the school office to link your account to your child."
          icon="account-child-outline"
        />
      ) : null}

      {children.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-stack-md max-h-12">
          {children.map((item) => (
            <FilterChip
              key={item.id}
              label={`${item.firstName} ${item.lastName}`}
              selected={item.id === childId}
              onPress={() => {
                setSelectedChildId(item.id);
                setSelectedTerm("All terms");
              }}
            />
          ))}
        </ScrollView>
      ) : null}

      {gradesQuery.isLoading && !gradesQuery.data ? <SkeletonBlock /> : null}
      {gradesQuery.isError ? (
        <ErrorBanner
          message="Couldn't load published grades."
          onRetry={() => void gradesQuery.refetch()}
        />
      ) : null}

      {gradesQuery.data ? (
        <>
          <View className="mb-stack-md rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-gutter-card">
            <Text className="font-label-md text-label-md text-on-surface-variant">
              Published results · {child?.className ?? "Current class"}
            </Text>
            <Text className="font-display-lg text-[24px] text-on-surface">
              {typeof gradesQuery.data.summary?.average === "number"
                ? `${gradesQuery.data.summary.average.toFixed(1)}% average`
                : "Results"}
            </Text>
            <Text className="font-body-md text-body-md text-on-surface-variant">
              Only grades released by the school are shown.
            </Text>
          </View>

          {termOptions.length > 2 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-stack-md max-h-12">
              {termOptions.map((term) => (
                <FilterChip
                  key={term}
                  label={term}
                  selected={selectedTerm === term}
                  onPress={() => setSelectedTerm(term)}
                />
              ))}
            </ScrollView>
          ) : null}

          <SectionHeader title="Results" />
          {visibleGrades.length === 0 ? (
            <EmptyState
              title="No published grades"
              description="Results will appear here after the school releases them."
              icon="school-outline"
            />
          ) : null}
          {visibleGrades.map((grade) => {
            const score = grade.totalMarks > 0
              ? Math.round((grade.marksObtained / grade.totalMarks) * 100)
              : null;
            return (
              <View
                key={grade.id}
                accessibilityLabel={`${grade.subject.name}, ${score === null ? "score unavailable" : `${score}%`}, grade ${grade.grade}`}
                className="mb-2 flex-row items-center justify-between rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-gutter-card"
              >
                <View className="flex-1 pr-3">
                  <Text className="font-headline-sm text-body-lg text-on-surface">
                    {grade.subject.name}
                  </Text>
                  <Text className="font-body-md text-body-md text-on-surface-variant">
                    {[grade.assessmentName, grade.term?.name, grade.remarks]
                      .filter(Boolean)
                      .join(" · ") || "Published assessment"}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-headline-sm text-headline-sm text-primary">
                    {grade.grade}
                  </Text>
                  <Text className="font-label-md text-label-md text-on-surface-variant">
                    {score === null ? "—" : `${score}%`}
                  </Text>
                </View>
              </View>
            );
          })}
        </>
      ) : null}
    </Screen>
  );
}
