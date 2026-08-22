import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Budgets",
  description: "Set monthly category budgets and see exactly where you stand at a glance.",
};

export default function BudgetsLayout({ children }: { children: React.ReactNode }) {
  return children;
}