import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import type {
  AttendanceStatus,
  Child,
  HomeData,
  MovementStatus,
} from "../lib/sample-data";

/** Home freshness: 30–60s */
const STALE_HOME_MS = 45 * 1000;

type ApiChild = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  isActive: boolean;
  class: { id: string; name: string; stream?: string | null } | null;
  todayAttendance: { status: string; arrivalTime: string } | null;
  movementStatus: "at_school" | "at_home";
  lunchWallet: { balanceMinor: number; hasWallet: boolean };
  outstandingFees: { amountMinor: number };
};

type ApiHome = {
  greeting: string;
  firstName: string;
  children: ApiChild[];
  stats: {
    totalOutstandingFees: { amountMinor: number };
    unreadAlerts: number;
  };
};

function toAttendanceStatus(status: string): AttendanceStatus {
  if (status === "present" || status === "late") return "present";
  if (status === "absent") return "absent";
  return "not_yet";
}

function mapChild(child: ApiChild): Child {
  const className = [child.class?.name, child.class?.stream]
    .filter(Boolean)
    .join(" · ");
  return {
    id: child.id,
    firstName: child.firstName,
    lastName: child.lastName,
    className: className || "No class assigned",
    // "House" (e.g. Blue House) is not yet returned by the API — documented gap.
    house: "",
    photoUrl: child.photoUrl ?? undefined,
    attendance: child.todayAttendance
      ? {
          status: toAttendanceStatus(child.todayAttendance.status),
          arrivedAt: child.todayAttendance.arrivalTime,
        }
      : { status: "not_yet" },
    movement: child.movementStatus as MovementStatus,
  };
}

export function useHome() {
  return useQuery({
    queryKey: ["home"],
    staleTime: STALE_HOME_MS,
    queryFn: async (): Promise<HomeData> => {
      const res = await apiFetch<ApiHome>("/v1/mobile/home");
      if (!res.data) {
        throw new Error(res.error?.message ?? "Failed to load home");
      }
      const home = res.data;
      const children = home.children.map(mapChild);
      const primaryWallet = home.children[0]?.lunchWallet;

      return {
        parentName: home.firstName,
        greeting: home.greeting,
        children,
        outstandingMinor: home.stats.totalOutstandingFees.amountMinor,
        // Invoice selection for the Pay banner lands with the fees wiring.
        outstandingInvoiceId: null,
        alertsUnread: home.stats.unreadAlerts,
        lunchWalletMinor: primaryWallet?.balanceMinor ?? 0,
        // Backend models a dailyLimit, not weekly — screen hides this when null.
        lunchWeeklyLimitMinor: null,
      };
    },
  });
}
