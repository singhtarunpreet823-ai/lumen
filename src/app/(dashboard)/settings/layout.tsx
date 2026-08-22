import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Profile, appearance, export and data controls for your Lumen workspace.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}