import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Savings goals",
  description: "Create savings goals, track progress and project completion dates.",
};

export default function SavingsgoalsLayout({ children }: { children: React.ReactNode }) {
  return children;
}