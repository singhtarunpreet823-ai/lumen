import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { InteractiveDemo } from "@/components/landing/interactive";
import { CopilotSection } from "@/components/landing/copilot";
import { Security } from "@/components/landing/security";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { CTA, Footer } from "@/components/landing/footer";
import { ScrollProgress, ScrollTopButton } from "@/components/landing/floating-ui";

export default function LandingPage() {
  return (
    <div id="main" className="min-h-screen overflow-x-hidden">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <Features />
      <InteractiveDemo />
      <CopilotSection />
      <Security />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
      <ScrollTopButton />
    </div>
  );
}
