import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Lumen workspace, or explore the live demo with a fully seeded account.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}