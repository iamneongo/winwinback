import { NavBar } from '@/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/NavBar';
import { HeroSection } from '@/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/HeroSection';
import { ConsoleSection } from '@/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/ConsoleSection';
import { PartnersSection } from '@/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/PartnersSection';
import { HowItWorksSection } from '@/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/HowItWorksSection';
import { BenefitsSection } from '@/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/BenefitsSection';
import { FAQSection } from '@/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/FAQSection';
import { FinalCTASection } from '@/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/FinalCTASection';
import { Footer } from '@/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/Footer';

export default function Home() {
  return (
    <div className="winwin-root" id="top">
      <NavBar />
      <main>
        <HeroSection />
        <ConsoleSection />
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
