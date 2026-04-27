export type LeadStatus =
  | "חדש"
  | "נוצר קשר"
  | "מתעניין"
  | "מעקב"
  | "נקבעה פגישה"
  | "נסגר"
  | "אבוד";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  source: string;
  status: LeadStatus;
  value: string;
};

export type CallRecord = {
  id: string;
  leadName: string;
  status: "ממתינה" | "בתהליך" | "הושלמה";
  summary: string;
  createdAt: string;
};

export type CalendarSlot = {
  id: string;
  title: string;
  window: string;
  status: "פנוי" | "שמור" | "הושלם";
  owner: string;
};

export type Product = {
  id: string;
  name: string;
  price: string;
  stock: number;
  tag: string;
};

export const dashboardStats = [
  { label: "לידים חדשים השבוע", value: "24", change: "+12%" },
  { label: "שיחות AI שבוצעו", value: "17", change: "+5" },
  { label: "פגישות שנקבעו", value: "6", change: "+2" },
  { label: "יחס סגירה משוער", value: "31%", change: "+4%" }
];

export const leads: Lead[] = [
  {
    id: "lead-1",
    name: "נועה כהן",
    phone: "050-123-4567",
    source: "פייסבוק",
    status: "חדש",
    value: "9,500 ₪"
  },
  {
    id: "lead-2",
    name: "אורי לוי",
    phone: "052-987-6543",
    source: "אתר",
    status: "מעקב",
    value: "14,200 ₪"
  },
  {
    id: "lead-3",
    name: "חן ישראלי",
    phone: "054-444-8899",
    source: "WhatsApp",
    status: "נקבעה פגישה",
    value: "6,800 ₪"
  }
];

export const calls: CallRecord[] = [
  {
    id: "call-1",
    leadName: "נועה כהן",
    status: "הושלמה",
    summary: "הלקוחה ביקשה לקבל דוגמאות ולהמשיך לשיחת מעקב מחר.",
    createdAt: "היום, 10:20"
  },
  {
    id: "call-2",
    leadName: "אורי לוי",
    status: "בתהליך",
    summary: "ממתין לאישור סלוט התקנה מתאים ליום חמישי.",
    createdAt: "היום, 09:10"
  }
];

export const slots: CalendarSlot[] = [
  {
    id: "slot-1",
    title: "התקנה בתל אביב",
    window: "יום ג', 09:00-11:00",
    status: "שמור",
    owner: "נועה כהן"
  },
  {
    id: "slot-2",
    title: "אספקה בפתח תקווה",
    window: "יום ד', 12:00-14:00",
    status: "פנוי",
    owner: "צוות לוגיסטיקה"
  },
  {
    id: "slot-3",
    title: "מדידה בבית הלקוח",
    window: "יום ה', 17:00-18:00",
    status: "הושלם",
    owner: "אורי לוי"
  }
];

export const products: Product[] = [
  {
    id: "product-1",
    name: "ארון הזזה דגם כרמל",
    price: "3,490 ₪",
    stock: 8,
    tag: "הנמכר ביותר"
  },
  {
    id: "product-2",
    name: "מזנון אלון טבעי",
    price: "2,190 ₪",
    stock: 3,
    tag: "במלאי מוגבל"
  },
  {
    id: "product-3",
    name: "שולחן אוכל נפתח",
    price: "4,850 ₪",
    stock: 5,
    tag: "חדש"
  }
];
