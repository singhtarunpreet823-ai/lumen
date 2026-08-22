import type { Metadata, Viewport } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme";
import { Toaster } from "@/components/ui/toaster";
import { CookieBanner } from "@/components/ui/cookie-banner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Lumen — Personal finance, with an AI copilot",
    template: "%s · Lumen",
  },
  description:
    "Lumen is a modern personal-finance dashboard. Track spending, set budgets and savings goals, and ask your AI copilot anything about your money.",
  keywords: ["personal finance", "budgeting", "savings goals", "AI finance", "expense tracker", "analytics"],
  metadataBase: new URL("https://lumen.app"),
  openGraph: {
    type: "website",
    title: "Lumen — Personal finance, with an AI copilot",
    description:
      "Track spending, hit budgets and savings goals, and ask your AI copilot anything about your money.",
  },
};

export const viewport: Viewport = {
  themeColor: "#07090e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${sora.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <a href="#main" className="skip-link no-print">
          Skip to content
        </a>
        <ThemeProvider>
          {children}
          <Toaster />
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}