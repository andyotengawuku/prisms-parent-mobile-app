import React, { useState } from "react";
import { Text, View } from "react-native";
import {
  AppBar,
  Screen,
  SegmentedControl,
  SectionHeader,
} from "../../src/components";

const SUBJECTS = [
  { name: "English Language", score: 82, grade: "A", remark: "Excellent essays" },
  { name: "Mathematics", score: 74, grade: "B+", remark: "Strong problem-solving" },
  { name: "Integrated Science", score: 68, grade: "B", remark: "Good lab work" },
  { name: "Social Studies", score: 79, grade: "A-", remark: "Participates well" },
  { name: "French", score: 71, grade: "B+", remark: "Improving oral" },
];

export default function AcademicsScreen() {
  const [term, setTerm] = useState("Term 3");

  return (
    <Screen scroll>
      <AppBar title="Academics" subtitle="Kwame Mensah · JHS 2A" />
      <SegmentedControl
        options={["Term 1", "Term 2", "Term 3"]}
        value={term}
        onChange={setTerm}
      />
      <View className="mb-stack-md rounded-lg bg-surface-container-lowest p-gutter-card border border-outline-variant/30">
        <Text className="font-label-md text-label-md text-on-surface-variant">
          Overall · {term} 2026
        </Text>
        <Text className="font-display-lg text-[24px] text-on-surface">
          GPA 3.4
        </Text>
        <Text className="font-body-md text-body-md text-on-surface-variant">
          Rank 8 of 42 · Published 28 Jul 2026
        </Text>
      </View>
      <SectionHeader title="Subjects" />
      {SUBJECTS.map((s) => (
        <View
          key={s.name}
          accessibilityLabel={`${s.name}, ${s.score} percent, grade ${s.grade}. ${s.remark}`}
          className="mb-2 flex-row items-center justify-between rounded-lg bg-surface-container-lowest p-gutter-card border border-outline-variant/30"
        >
          <View className="flex-1 pr-3">
            <Text className="font-headline-sm text-body-lg text-on-surface">
              {s.name}
            </Text>
            <Text className="font-body-md text-body-md text-on-surface-variant">
              {s.remark}
            </Text>
          </View>
          <View className="items-end">
            <Text className="font-headline-sm text-headline-sm text-primary">
              {s.grade}
            </Text>
            <Text className="font-label-md text-label-md text-on-surface-variant">
              {s.score}%
            </Text>
          </View>
        </View>
      ))}
      <View className="mt-4 rounded-lg bg-surface-container-low p-gutter-card">
        <Text className="mb-1 font-label-md text-label-md text-on-surface-variant">
          Class teacher's remarks
        </Text>
        <Text className="font-body-md text-body-md text-on-surface">
          Kwame is diligent and respectful. Encourage more reading at home
          ahead of BECE prep.
        </Text>
      </View>
    </Screen>
  );
}
