import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { InteractiveDemo } from "@/components/landing/interactive";
import { CopilotSection } from "@/components/landing/copilot";
import { Security } from "@/components/landing/security";
import { Pricing } from "@/components/landing/pricing";
import { CTA, Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <InteractiveDemo />
      <CopilotSection />
      <Security />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}