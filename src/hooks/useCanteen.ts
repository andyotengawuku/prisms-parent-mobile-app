import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import type { CanteenMenuDay, CanteenWallet, NoticeItem } from "../lib/models";

/** Canteen wallet freshness: 30–60s while the screen is open. */
const STALE_WALLET_MS = 30 * 1000;
const STALE_MENU_MS = 5 * 60 * 1000;

export function useCanteenWallet(studentId: string | undefined) {
  return useQuery({
    queryKey: ["canteen", "wallet", studentId],
    staleTime: STALE_WALLET_MS,
    enabled: Boolean(studentId),
    queryFn: async (): Promise<CanteenWallet> => {
      const res = await apiFetch<CanteenWallet>(
        `/v1/mobile/canteen/wallet?studentId=${encodeURIComponent(studentId ?? "")}`,
      );
      if (!res.data) {
        throw new Error(res.error?.message ?? "Failed to load wallet");
      }
      return res.data;
    },
  });
}

export function useCanteenMenu(week?: string) {
  return useQuery({
    queryKey: ["canteen", "menu", week ?? "current"],
    staleTime: STALE_MENU_MS,
    queryFn: async (): Promise<{
      weekStart: string;
      source: string;
      hasMenu: boolean;
      days: CanteenMenuDay[];
    }> => {
      const suffix = week ? `?week=${encodeURIComponent(week)}` : "";
      const res = await apiFetch<{
        weekStart: string;
        source: string;
        hasMenu: boolean;
        days: CanteenMenuDay[];
      }>(`/v1/mobile/canteen/menu${suffix}`);
      if (!res.data) {
        throw new Error(res.error?.message ?? "Failed to load menu");
      }
      return res.data;
    },
  });
}

export function useNotices() {
  return useQuery({
    queryKey: ["notices"],
    staleTime: 60 * 1000,
    queryFn: async (): Promise<NoticeItem[]> => {
      const res = await apiFetch<{ notices: NoticeItem[] }>("/v1/mobile/notices");
      if (!res.data) {
        throw new Error(res.error?.message ?? "Failed to load notices");
      }
      return res.data.notices ?? [];
    },
  });
}
