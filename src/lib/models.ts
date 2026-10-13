export type AttendanceStatus =
  | "present"
  | "not_yet"
  | "absent"
  | "excused"
  | "unknown";

export type MovementStatus = "at_school" | "at_home" | "in_transit" | "unknown";
export type FeeStatus = "overdue" | "paid" | "pending";
export type AlertCategory =
  | "attendance"
  | "fees"
  | "pickup"
  | "academic"
  | "announcement";

export type Child = {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  photoUrl?: string;
  attendance: {
    status: AttendanceStatus;
    arrivedAt?: string;
  };
  movement: MovementStatus;
  lunchWalletMinor?: number;
  hasLunchWallet?: boolean;
  outstandingMinor?: number;
  usualDropoffTime?: string | null;
  usualPickupTime?: string | null;
};

export type WalletTransaction = {
  id: string;
  type: "topup" | "purchase" | "refund" | "adjustment" | string;
  amountMinor: number;
  description?: string | null;
  mealDate: string;
};

export type CanteenWallet = {
  hasWallet: boolean;
  balanceMinor: number;
  dailyLimitMinor: number | null;
  spentTodayMinor: number;
  spentMonthMinor: number;
  isActive: boolean;
  transactions: WalletTransaction[];
  topups: Array<{ id: string; amountMinor: number; status: string; paymentMethod: string; createdAt: string }>;
  settings: { enabled: boolean; minTopUpMinor: number; maxTopUpMinor: number };
};

export type CanteenMenuDay = {
  dayOfWeek: number;
  services: Array<{
    mealService: string;
    title?: string | null;
    items: Array<{ name: string; priceMinor?: number | null; notes?: string | null }>;
    fromDatedWeek: boolean;
  }>;
};

export type NoticeItem = {
  id: string;
  type: "absence" | "lateness" | string;
  status: "pending" | "acknowledged" | "dismissed" | string;
  studentId: string;
  studentName: string;
  startDate: string;
  endDate: string | null;
  expectedTime: string | null;
  reason: string;
  createdAt: string;
};

export type Invoice = {
  id: string;
  studentId: string;
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
  alertsUnread: number;
  lunchWalletMinor: number;
  lunchWalletAvailable: boolean;
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
