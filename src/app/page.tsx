import type { Metadata } from 'next';
import { MarketingLayout } from '@/components/sections/MarketingLayout';
import { HeroSection } from '@/components/sections/HeroSection';
import { WalletGrowthSection } from '@/components/sections/WalletGrowthSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { CommunitySection } from '@/components/sections/CommunitySection';
import { FinalCTASection } from '@/components/sections/FinalCTASection';
import { LandingLuckyDrawPromo } from '@/components/sections/LandingLuckyDrawPromo';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://winwinback.com').replace(/\/$/, '');

export const metadata: Metadata = {
  alternates: { canonical: siteUrl },
};

const brandStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: 'Win-Win Back',
      alternateName: ['Win Win Back', 'WinWinBack'],
      inLanguage: 'vi-VN',
      publisher: { '@id': `${siteUrl}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Win-Win Back',
      url: `${siteUrl}/`,
      sameAs: ['https://www.facebook.com/winwinbackvn/'],
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandStructuredData).replace(/</g, '\\u003c') }} />
      <MarketingLayout className="landing-page" id="top">
        <main>
          <HeroSection />
          <HowItWorksSection />
          <WalletGrowthSection />
          <CommunitySection />
          <FAQSection />
          <FinalCTASection />
        </main>
        <LandingLuckyDrawPromo />
      </MarketingLayout>
    </>
  );
}
