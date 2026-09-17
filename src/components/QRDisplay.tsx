import React, { useMemo } from "react";
import { Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

type Props = {
  token: string;
  size?: number;
  caption?: string;
};

/** Lightweight deterministic QR-like matrix from pass token (local only — never fetched). */
function matrixFromToken(token: string, modules = 21): boolean[][] {
  const grid: boolean[][] = Array.from({ length: modules }, () =>
    Array.from({ length: modules }, () => false),
  );

  // Finder patterns
  const paintFinder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const center = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        grid[oy + y]![ox + x] = edge || center;
      }
    }
  };
  paintFinder(0, 0);
  paintFinder(modules - 7, 0);
  paintFinder(0, modules - 7);

  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
  }
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      if (grid[y]![x]) continue;
      if (x < 8 && y < 8) continue;
      if (x >= modules - 8 && y < 8) continue;
      if (x < 8 && y >= modules - 8) continue;
      hash = (hash * 1664525 + 1013904223) >>> 0;
      grid[y]![x] = (hash & 1) === 1;
    }
  }
  return grid;
}

export function QRDisplay({
  token,
  size = 220,
  caption = "Valid today only",
}: Props) {
  const modules = 21;
  const cell = size / modules;
  const grid = useMemo(() => matrixFromToken(token, modules), [token]);

  return (
    <View className="items-center">
      <View
        accessibilityRole="image"
        accessibilityLabel={`Gate pass QR, ${caption.toLowerCase()}`}
        className="rounded-lg bg-surface-container-lowest p-4 border border-outline-variant/40"
      >
        <Svg width={size} height={size}>
          {grid.map((row, y) =>
            row.map((on, x) =>
              on ? (
                <Rect
                  key={`${x}-${y}`}
                  x={x * cell}
                  y={y * cell}
                  width={cell}
                  height={cell}
                  fill="#1a1c1e"
                />
              ) : null,
            ),
          )}
        </Svg>
      </View>
      <Text className="mt-3 font-label-md text-label-md text-on-surface-variant">
        {caption}
      </Text>
    </View>
  );
}
