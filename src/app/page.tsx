import { NavBar } from '@/components/sections/NavBar';
import { HeroSection } from '@/components/sections/HeroSection';
import { ConsoleSection } from '@/components/sections/ConsoleSection';
import { PartnersSection } from '@/components/sections/PartnersSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { BenefitsSection } from '@/components/sections/BenefitsSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { CommunitySection } from '@/components/sections/CommunitySection';
import { FinalCTASection } from '@/components/sections/FinalCTASection';
import { Footer } from '@/components/sections/Footer';

export default function Home() {
  return (
    <div className="winwin-root" id="top">
      <NavBar />
      <main>
        <HeroSection />
        <ConsoleSection />
        <CommunitySection />
        <PartnersSection />
        <HowItWorksSection />
        <BenefitsSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
