import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import type { AlertItem, FeeStatus, Invoice } from "../lib/models";

/** Invoices/alerts freshness: 1–5 minutes */
const STALE_FEES_MS = 3 * 60 * 1000;

type ApiInvoice = {
  id: string;
  invoiceNumber: string;
  totalAmount: number | string;
  balance: number | string;
  status: string;
  dueDate: string;
  issuedAt?: string;
  feeStructure?: { name?: string | null } | null;
  student?: { id?: string; firstName?: string | null; lastName?: string | null } | null;
  academicYear?: { name?: string | null } | null;
};

function toMinor(amount: number | string | null | undefined): number {
  const parsed = Number(amount ?? 0);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}
function toFeeStatus(status: string, dueDate: string): FeeStatus {
  if (status === "paid") return "paid";
  const overdue =
    (status === "pending" || status === "partially_paid" || status === "overdue") &&
    new Date(dueDate) < new Date();
  return overdue ? "overdue" : "pending";
}

function mapInvoice(inv: ApiInvoice): Invoice {
  const amountMinor = Math.max(0, toMinor(inv.totalAmount));
  const paidMinor = Math.min(
    amountMinor,
    Math.max(0, amountMinor - toMinor(inv.balance)),
  );
  const term =
    inv.academicYear?.name ??
    inv.feeStructure?.name ??
    inv.invoiceNumber;
  return {
    id: inv.id,
    studentId: inv.student?.id ?? "",
    title: inv.feeStructure?.name ?? inv.invoiceNumber,
    childName: [inv.student?.firstName, inv.student?.lastName]
      .filter(Boolean)
      .join(" "),
    amountMinor,
    paidMinor: Math.max(0, paidMinor),
    status: toFeeStatus(inv.status, inv.dueDate),
    dueDate: inv.dueDate,
    term,
  };
}

/**
 * Fees list — served by the web parent API (/api/parent/fees), which already
 * returns bearer-compatible, parent-scoped data in a { data, meta } envelope.
 */
export function useFees() {
  return useQuery({
    queryKey: ["fees", "invoices"],
    queryFn: async (): Promise<Invoice[]> => {
      const res = await apiFetch<ApiInvoice[]>("/parent/fees");
      if (!res.data) {
        throw new Error(res.error?.message ?? "Failed to load fees");
      }
      return res.data
        .filter((invoice) =>
          ["paid", "pending", "partially_paid", "overdue"].includes(invoice.status),
        )
        .map(mapInvoice);
    },
    staleTime: STALE_FEES_MS,
  });
}

type ApiNotification = {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
};

function mapAlertCategory(type: string): AlertItem["category"] {
  const value = type.toLowerCase();
  if (value.includes("attendance")) return "attendance";
  if (value.includes("fee") || value.includes("payment") || value.includes("invoice")) return "fees";
  if (value.includes("pickup")) return "pickup";
  if (value.includes("academic") || value.includes("grade") || value.includes("result")) return "academic";
  return "announcement";
}

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async (): Promise<AlertItem[]> => {
      const res = await apiFetch<{ notifications: ApiNotification[] }>("/notifications");
      if (!res.data) {
        throw new Error(res.error?.message ?? "Failed to load alerts");
      }
      return (res.data.notifications ?? []).map((notification) => ({
        id: notification.id,
        category: mapAlertCategory(notification.type),
        title: notification.title,
        body: notification.content,
        createdAt: notification.createdAt,
        unread: !notification.isRead,
      }));
    },
    staleTime: STALE_FEES_MS,
  });
}
