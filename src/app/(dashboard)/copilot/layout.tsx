import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Copilot",
  description: "Ask anything about your money and get answers backed by charts from your real data.",
};

export default function AICopilotLayout({ children }: { children: React.ReactNode }) {
  return children;
}