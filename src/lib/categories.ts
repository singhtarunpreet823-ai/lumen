import type { Category, TxType } from "@/lib/types";

export const CATEGORIES: Category[] = [
  {
    id: "salary",
    name: "Salary",
    type: "income",
    icon: "briefcase",
    color: "#10b981",
    keywords: ["payroll", "salary", "wage", "acme", "stipend", "payslip"],
  },
  {
    id: "freelance",
    name: "Freelance",
    type: "income",
    icon: "laptop",
    color: "#22d3ee",
    keywords: ["freelance", "contract", "consulting", "invoice", "upwork", "fiverr", "design sprint"],
  },
  {
    id: "investments",
    name: "Investments",
    type: "income",
    icon: "trending-up",
    color: "#818cf8",
    keywords: ["dividend", "interest", "robinhood", "vanguard", "fidelity", "capital gains"],
  },
  {
    id: "gifts",
    name: "Gifts & Other",
    type: "income",
    icon: "gift",
    color: "#f472b6",
    keywords: ["gift", "refund", "rebate", "cashback", "bonus"],
  },
  {
    id: "food-dining",
    name: "Food & Dining",
    type: "expense",
    icon: "utensils",
    color: "#f59e0b",
    keywords: ["starbucks", "chipotle", "restaurant", "cafe", "coffee", "sushi", "pizza", "mcdonald", "uber eats", "doordash", "grubhub", "deli", "bakery", "ramen"],
  },
  {
    id: "groceries",
    name: "Groceries",
    type: "expense",
    icon: "shopping-cart",
    color: "#84cc16",
    keywords: ["whole foods", "trader joe", "safeway", "walmart", "kroger", "costco", "aldi", "grocery", "supermarket", "target"],
  },
  {
    id: "transport",
    name: "Transport",
    type: "expense",
    icon: "car",
    color: "#38bdf8",
    keywords: ["uber", "lyft", "gas", "shell", "chevron", "exxon", "metro", "transit", "toll", "parking", "lyft", "toyota", "honda", "gas station"],
  },
  {
    id: "housing",
    name: "Housing",
    type: "expense",
    icon: "home",
    color: "#8b5cf6",
    keywords: ["rent", "mortgage", "zillow", "apartment", "lease", "property"],
  },
  {
    id: "utilities",
    name: "Utilities",
    type: "expense",
    icon: "zap",
    color: "#facc15",
    keywords: ["electric", "water bill", "utility", "comcast", "xfinity", "verizon", "at&t", "internet", "wifi", "gas bill", "con ed"],
  },
  {
    id: "subscriptions",
    name: "Subscriptions",
    type: "expense",
    icon: "repeat",
    color: "#fb7185",
    keywords: ["netflix", "spotify", "hulu", "disney+", "hbo", "max", "adobe", "notion", "figma", "iCloud", "icloud", "apple music", "youtube premium", "gym", "membership"],
  },
  {
    id: "shopping",
    name: "Shopping",
    type: "expense",
    icon: "shopping-bag",
    color: "#e879f9",
    keywords: ["amazon", "zara", "h&m", "nike", "uniqlo", "apple store", "best buy", "etsy", "target", "clothing", "shein", "ebay"],
  },
  {
    id: "entertainment",
    name: "Entertainment",
    type: "expense",
    icon: "clapperboard",
    color: "#c084fc",
    keywords: ["cinemark", "amc", "movie", "concert", "ticketmaster", "steam", "xbox", "playstation", "spotify", "twitch"],
  },
  {
    id: "health",
    name: "Health",
    type: "expense",
    icon: "heart-pulse",
    color: "#f43f5e",
    keywords: ["pharmacy", "cvs", "walgreens", "doctor", "dental", "therapy", "fitness", "hospital", "zocdoc", "vitamin"],
  },
  {
    id: "travel",
    name: "Travel",
    type: "expense",
    icon: "plane",
    color: "#2dd4bf",
    keywords: ["airline", "delta", "united", "southwest", "airbnb", "hotel", "marriott", "expedia", "booking", "lyft", "flight"],
  },
  {
    id: "education",
    name: "Education",
    type: "expense",
    icon: "graduation-cap",
    color: "#60a5fa",
    keywords: ["udemy", "coursera", "book", "audible", "course", "tuition", "kindle"],
  },
  {
    id: "personal",
    name: "Personal Care",
    type: "expense",
    icon: "sparkles",
    color: "#fda4af",
    keywords: ["barber", "salon", "spa", "makeup", "sephora", "ult beauty", "grooming"],
  },
  {
    id: "bills-other",
    name: "Bills & Other",
    type: "expense",
    icon: "receipt",
    color: "#94a3b8",
    keywords: ["insurance", "tax", "fee", "subscription", "charge", "bill"],
  },
];

export const INCOME_CATEGORIES = CATEGORIES.filter((c) => c.type === "income");
export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.type === "expense");

const CATEGORY_INDEX = new Map(CATEGORIES.map((c) => [c.id, c]));

export function getCategory(id: string): Category {
  return CATEGORY_INDEX.get(id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function categoryIcon(name: string): string {
  return name;
}

const DISCRETIONARY = new Set(["food-dining", "shopping", "entertainment", "personal", "travel", "subscriptions"]);

export function isDiscretionary(categoryId: string): boolean {
  return DISCRETIONARY.has(categoryId);
}

/** Simple keyword-based auto-categorization for an expense merchant string. */
export function autoCategorize(merchant: string, type: TxType = "expense"): string {
  const text = merchant.toLowerCase();
  const pool = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  for (const cat of pool) {
    for (const kw of cat.keywords) {
      if (text.includes(kw)) return cat.id;
    }
  }
  return type === "income" ? "gifts" : "bills-other";
}