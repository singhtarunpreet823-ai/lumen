import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Spending trends, month-over-month comparisons and projections across all your categories.",
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}