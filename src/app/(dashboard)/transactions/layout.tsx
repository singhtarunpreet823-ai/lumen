import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions",
  description: "Search, filter and manage every transaction with auto-categorization.",
};

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}