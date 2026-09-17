import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { SAMPLE_ALERTS, SAMPLE_INVOICES } from "../lib/sample-data";
import type { FeeStatus, Invoice } from "../lib/sample-data";

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
  student?: { firstName?: string | null; lastName?: string | null } | null;
  academicYear?: { name?: string | null } | null;
};

function toMinor(amount: number | string | null | undefined): number {
  return Math.round(Number(amount ?? 0) * 100);
}

function toFeeStatus(status: string, dueDate: string): FeeStatus {
  if (status === "paid") return "paid";
  const overdue =
    (status === "pending" || status === "partially_paid" || status === "overdue") &&
    new Date(dueDate) < new Date();
  return overdue ? "overdue" : "pending";
}

function mapInvoice(inv: ApiInvoice): Invoice {
  const amountMinor = toMinor(inv.totalAmount);
  const paidMinor = amountMinor - toMinor(inv.balance);
  const term =
    inv.academicYear?.name ??
    inv.feeStructure?.name ??
    inv.invoiceNumber;
  return {
    id: inv.id,
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
      return res.data.map(mapInvoice);
    },
    staleTime: STALE_FEES_MS,
  });
}

/**
 * Alerts — the backend inbox endpoint exists (/api/notifications) but its
 * payload/categories differ from the designed AlertItem; wired in the alerts
 * phase. Until then the sample feed keeps the UI honest for review.
 */
export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async () => SAMPLE_ALERTS,
    staleTime: STALE_FEES_MS,
  });
}

// Keep the sample set referenced for storybook-style previews.
void SAMPLE_INVOICES;
