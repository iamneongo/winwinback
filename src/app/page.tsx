import { MarketingLayout } from '@/components/sections/MarketingLayout';
import { HeroSection } from '@/components/sections/HeroSection';
import { WalletGrowthSection } from '@/components/sections/WalletGrowthSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { CommunitySection } from '@/components/sections/CommunitySection';
import { FinalCTASection } from '@/components/sections/FinalCTASection';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <MarketingLayout className="landing-page" id="top">
      <main>
        <HeroSection />
        <HowItWorksSection />
        <WalletGrowthSection />
        <CommunitySection />
        <FAQSection />
        <FinalCTASection />
      </main>
    </MarketingLayout>
  );
}
