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
