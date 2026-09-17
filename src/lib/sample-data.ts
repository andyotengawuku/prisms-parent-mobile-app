export type AttendanceStatus = "present" | "not_yet" | "absent";
export type MovementStatus = "at_school" | "at_home" | "in_transit";
export type FeeStatus = "overdue" | "paid" | "pending";
export type AlertCategory = "attendance" | "fees" | "pickup" | "academic" | "announcement";

export type Child = {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  house: string;
  photoUrl?: string;
  attendance: {
    status: AttendanceStatus;
    arrivedAt?: string;
  };
  movement: MovementStatus;
};

export type Invoice = {
  id: string;
  title: string;
  childName: string;
  amountMinor: number;
  paidMinor: number;
  status: FeeStatus;
  dueDate: string;
  term: string;
};

export type HomeData = {
  parentName: string;
  greeting: string;
  children: Child[];
  outstandingMinor: number;
  outstandingInvoiceId: string | null;
  alertsUnread: number;
  lunchWalletMinor: number;
  lunchWeeklyLimitMinor: number | null;
};

export type AlertItem = {
  id: string;
  category: AlertCategory;
  title: string;
  body: string;
  createdAt: string;
  unread: boolean;
};

export const SAMPLE_CHILDREN: Child[] = [
  {
    id: "child-kwame",
    firstName: "Kwame",
    lastName: "Mensah",
    className: "JHS 2A",
    house: "Blue House",
    attendance: { status: "present", arrivedAt: "2026-09-03T07:52:00+00:00" },
    movement: "at_school",
  },
  {
    id: "child-ama",
    firstName: "Ama",
    lastName: "Owusu",
    className: "Primary 5B",
    house: "Gold House",
    attendance: { status: "not_yet" },
    movement: "at_home",
  },
];

export const SAMPLE_INVOICES: Invoice[] = [
  {
    id: "inv-2026-term3-tuition",
    title: "Tuition — Term 3",
    childName: "Kwame Mensah",
    amountMinor: 250000,
    paidMinor: 125000,
    status: "overdue",
    dueDate: "2026-10-15",
    term: "Term 3 2026",
  },
  {
    id: "inv-2026-term3-transport",
    title: "Transport — Term 3",
    childName: "Ama Owusu",
    amountMinor: 45000,
    paidMinor: 0,
    status: "pending",
    dueDate: "2026-10-30",
    term: "Term 3 2026",
  },
  {
    id: "inv-2026-term2-tuition",
    title: "Tuition — Term 2",
    childName: "Kwame Mensah",
    amountMinor: 240000,
    paidMinor: 240000,
    status: "paid",
    dueDate: "2026-06-15",
    term: "Term 2 2026",
  },
];

export const SAMPLE_HOME: HomeData = {
  parentName: "Akosua Mensah",
  greeting: "Good morning",
  children: SAMPLE_CHILDREN,
  outstandingMinor: 170000,
  outstandingInvoiceId: "inv-2026-term3-tuition",
  alertsUnread: 3,
  lunchWalletMinor: 8500,
  lunchWeeklyLimitMinor: 15000,
};

export const SAMPLE_ALERTS: AlertItem[] = [
  {
    id: "alert-1",
    category: "attendance",
    title: "Kwame marked present",
    body: "Arrived at school gate at 7:52 AM",
    createdAt: "2026-09-03T07:53:00+00:00",
    unread: true,
  },
  {
    id: "alert-2",
    category: "fees",
    title: "Invoice overdue",
    body: "Tuition Term 3 — ₵1,250.00 remaining",
    createdAt: "2026-09-02T09:00:00+00:00",
    unread: true,
  },
  {
    id: "alert-3",
    category: "pickup",
    title: "Pickup pass used",
    body: "Ama Owusu was picked up by Auntie Efua at 3:42 PM",
    createdAt: "2026-09-01T15:42:00+00:00",
    unread: false,
  },
];
