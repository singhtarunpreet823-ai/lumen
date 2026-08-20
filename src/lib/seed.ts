import { addDays, addMonths, format, startOfMonth } from "date-fns";
import { uid, mulberry32 } from "@/lib/utils";
import type { Budget, Goal, Profile, Transaction, UserData } from "@/lib/types";
import { formatMonthKey } from "@/lib/format";

interface SeedOptions {
  profileName?: string;
  email?: string;
}

const MERCHANTS: Record<string, string[]> = {
  "food-dining": [
    "Starbucks", "Chipotle", "Uber Eats", "Blue Hill Cafe", "Sushi Kaito", "Pizza Roma",
    "Doordash", "The Grilled Cheese Co", "Matcha Bar", "Burger King",
  ],
  groceries: [
    "Whole Foods", "Trader Joe's", "Safeway", "Costco", "Kroger", "Trader Joe's",
  ],
  transport: ["Uber", "Lyft", "Shell Gas", "Chevron", "Metro Transit", "Parking Garage"],
  housing: ["Maple Grove Apartments", "Property Management Co"],
  utilities: ["Comcast Xfinity", "Con Edison", "Verizon Wireless", "PG&E Utility", "City Water"],
  subscriptions: ["Netflix", "Spotify", "iCloud", "Notion", "Figma", "Adobe CC", "Crunch Fitness", "YouTube Premium"],
  shopping: ["Amazon", "Zara", "Nike", "Best Buy", "Uniqlo", "H&M", "Apple Store"],
  entertainment: ["AMC Theatres", "Ticketmaster", "Steam", "AMC Theatres", "Concert Hall"],
  health: ["CVS Pharmacy", "Walgreens", "City Dental", "Zocdoc", "Pharmacy Plus"],
  travel: ["Delta Airlines", "Airbnb", "Marriott", "Expedia", "Southwest"],
  education: ["Udemy", "Coursera", "Audible", "Barnes & Noble", "Skillshare"],
  personal: ["Barber Co", "Sephora", "Spa Day", "Great Clips"],
  "bills-other": ["Geico Insurance", "State Tax", "Apple Care", "Renters Insurance"],
};

const SALARY_MERCHANTS = ["Acme Corp Payroll", "Acme Corp Payroll", "Acme Corp Bonus"];
const FREELANCE_MERCHANTS = ["Freelance — Design Sprint", "Freelance — Web Consult", "Upwork Payout", "Invoice #2210"];
const INVEST_MERCHANTS = ["Vanguard Dividends", "Robinhood Interest", "Fidelity Div", "HYSA Interest"];
const GIFT_MERCHANTS = ["Refund — Amazon", "Cashback Rewards", "Birthday Gift", "Tax Refund"];

export function generateSeedData(opts: SeedOptions = {}): UserData {
  const rng = mulberry32(20240817);
  const rand = (min: number, max: number) => min + rng() * (max - min);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
  const within = (mean: number, spread: number) => Math.max(1, Math.round(mean + (rng() * 2 - 1) * spread));

  const profile: Profile = {
    name: opts.profileName ?? "Ava Chen",
    email: opts.email ?? "ava@lumen.app",
    currency: "USD",
    monthlyIncome: 6800,
    onboarded: true,
    demo: true,
  };

  const transactions: Transaction[] = [];
  const budgets: Budget[] = [];
  const goals: Goal[] = [];

  const now = new Date();
  const thisMonth = formatMonthKey(now);

  // ---- Budgets: last 3 months + current ----
  const budgetDefs: Array<{ cat: string; amount: number }> = [
    { cat: "food-dining", amount: 640 },
    { cat: "groceries", amount: 480 },
    { cat: "transport", amount: 320 },
    { cat: "shopping", amount: 500 },
    { cat: "entertainment", amount: 220 },
    { cat: "subscriptions", amount: 120 },
    { cat: "health", amount: 180 },
    { cat: "travel", amount: 350 },
    { cat: "overall", amount: 4200 },
  ];
  for (let m = 2; m >= 0; m--) {
    const key = formatMonthKey(addMonths(now, -m));
    for (const d of budgetDefs) {
      budgets.push({ id: uid("budget"), month: key, categoryId: d.cat, amount: d.amount });
    }
  }

  // ---- Goals ----
  goals.push(
    { id: uid("goal"), name: "Emergency Fund", target: 15000, saved: 12400, color: "#10b981", icon: "shield" },
    { id: uid("goal"), name: "Japan Trip 2026", target: 6000, saved: 3420, deadline: format(addMonths(now, 6), "yyyy-MM-dd"), color: "#f472b6", icon: "plane" },
    { id: uid("goal"), name: "New MacBook Pro", target: 3200, saved: 1850, color: "#818cf8", icon: "laptop" },
  );

  // ---- Monthly recurring income ----
  for (let m = 8; m >= 0; m--) {
    const monthDate = addMonths(startOfMonth(now), -m);
    const payday = addDays(monthDate, m === 0 ? 1 : 1 + Math.floor(rng() * 3));
    transactions.push({
      id: uid("tx"), type: "income", amount: profile.monthlyIncome, categoryId: "salary",
      merchant: "Acme Corp Payroll",
      date: format(payday, "yyyy-MM-dd"), createdAt: payday.toISOString(),
    });
    if (m === 0 && rng() > 0.6) {
      transactions.push({
        id: uid("tx"), type: "income", amount: 450, categoryId: "salary",
        merchant: "Acme Corp Bonus",
        date: format(addDays(payday, 10), "yyyy-MM-dd"), createdAt: addDays(payday, 10).toISOString(),
      });
    }
  }

  // ---- Variable freelance income ----
  for (let m = 8; m >= 0; m--) {
    const monthDate = addMonths(startOfMonth(now), -m);
    const jobs = Math.floor(rng() * 2) + (m <= 2 ? 1 : 0);
    for (let j = 0; j < jobs; j++) {
      const day = addDays(monthDate, Math.floor(rng() * 26) + 1);
      const amt = within(650, 420);
      transactions.push({
        id: uid("tx"), type: "income", amount: amt, categoryId: "freelance",
        merchant: pick(FREELANCE_MERCHANTS),
        date: format(day, "yyyy-MM-dd"), createdAt: day.toISOString(),
      });
    }
  }

  // ---- Investment income every quarter ----
  for (let m = 8; m >= 0; m -= 3) {
    const monthDate = addMonths(startOfMonth(now), -m);
    const day = addDays(monthDate, 12);
    transactions.push({
      id: uid("tx"), type: "income", amount: within(140, 60), categoryId: "investments",
      merchant: pick(INVEST_MERCHANTS),
      date: format(day, "yyyy-MM-dd"), createdAt: day.toISOString(),
    });
  }

  // ---- Expenses ----
  const seasonalMultiplier: Record<string, (m: number) => number> = {
    "food-dining": () => 1 + rng() * 0.35,
    groceries: () => 1 + rng() * 0.25,
    transport: () => 1 + rng() * 0.4,
    shopping: (m) => (m === 0 ? 1.6 : m === -1 ? 1.2 : 1) + rng() * 0.3,
    entertainment: () => 1 + rng() * 0.5,
    subscriptions: () => 1,
    health: () => 0.5 + rng() * 1.4,
    travel: (m) => (m === 0 || m === -3 ? 1.8 : 0.3 + rng() * 0.9),
    "bills-other": () => 1,
    personal: () => 0.6 + rng() * 1.1,
    housing: () => 1,
    utilities: () => 1,
    education: () => 0.4 + rng() * 0.8,
  };

  // recent months get slightly higher spend (drives "why higher this month" insight)
  const recentBias = (m: number) => (m === 0 ? 1.18 : m === -1 ? 1.05 : 1);

  for (let m = 8; m >= 0; m--) {
    const monthDate = addMonths(startOfMonth(now), -m);
    const key = formatMonthKey(monthDate);
    const days = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

    const shuffle = <T,>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    for (const [cat, merchantPool] of Object.entries(MERCHANTS)) {
      const isFixed = cat === "housing";
      const isRecurring = cat === "subscriptions" || cat === "utilities" || cat === "bills-other";
      const mult = seasonalMultiplier[cat](m) * recentBias(m);
      const n =
        cat === "housing" || cat === "travel"
          ? 1
          : isRecurring
            ? cat === "subscriptions"
              ? 3
              : cat === "utilities"
                ? 2
                : 1
            : 1 + Math.floor(rng() * 2);
      const pool = isRecurring ? shuffle(merchantPool) : merchantPool;

      for (let i = 0; i < n; i++) {
        const merchant = isRecurring ? pool[i] : pick(merchantPool);
        const base: Record<string, number> = {
          "food-dining": 24, groceries: 55, transport: 28, housing: 2150, utilities: 165,
          subscriptions: 12, shopping: 95, entertainment: 48, health: 60, travel: 180,
          education: 45, personal: 55, "bills-other": 120,
        };
        const amount = isFixed
          ? 2150
          : Math.round((base[cat] ?? 40) * mult * rand(0.55, 1.25));
        const day = addDays(monthDate, Math.floor(rng() * days) + 1);
        transactions.push({
          id: uid("tx"), type: "expense", amount, categoryId: cat, merchant,
          date: format(day, "yyyy-MM-dd"), createdAt: day.toISOString(),
          recurring: isRecurring,
        });
      }
    }

    // Sprinkle in education + personal occasionally
    if (rng() > 0.5) {
      const day = addDays(monthDate, Math.floor(rng() * days) + 1);
      transactions.push({
        id: uid("tx"), type: "expense", amount: within(60, 40), categoryId: "education",
        merchant: pick(MERCHANTS.education),
        date: format(day, "yyyy-MM-dd"), createdAt: day.toISOString(),
      });
    }
    if (rng() > 0.55) {
      const day = addDays(monthDate, Math.floor(rng() * days) + 1);
      transactions.push({
        id: uid("tx"), type: "expense", amount: within(70, 45), categoryId: "personal",
        merchant: pick(MERCHANTS.personal),
        date: format(day, "yyyy-MM-dd"), createdAt: day.toISOString(),
      });
    }

    void key;
  }

  // Ensure the current month already has meaningful spend (today is ~the 20th)
  const today = now.getDate();
  if (today < 12) {
    const day = addDays(startOfMonth(now), 8);
    transactions.push({
      id: uid("tx"), type: "expense", amount: 86, categoryId: "food-dining",
      merchant: "Uber Eats", date: format(day, "yyyy-MM-dd"), createdAt: day.toISOString(),
    });
  }

  transactions.sort((a, b) => (a.date < b.date ? 1 : -1));
  void thisMonth;

  return {
    version: 2,
    profile,
    transactions,
    budgets,
    goals,
  };
}

export function freshDemoData(opts?: SeedOptions): UserData {
  return generateSeedData(opts);
}