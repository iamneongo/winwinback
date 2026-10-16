import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronRight, FileText, HelpCircle, ShieldCheck } from "lucide-react";
import { MarketingLayout } from "@/components/sections/MarketingLayout";
import type { PublicPolicySection } from "./content";
import styles from "./PublicPolicyShell.module.css";

type PolicyFaq = { question: string; answer: string };

function PolicyTocLinks({ sections }: { sections: PublicPolicySection[] }) {
  return (
    <>
      <ol className="space-y-1">
        {sections.map((section, index) => (
          <li key={section.id}>
            <a href={`#${section.id}`} className={`${styles.tocLink} flex min-h-11 items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold leading-5 text-[#526f8e] hover:bg-[#edf8e9] hover:text-[#218e38] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#5fae3b]`}>
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#e9eef0] text-[11px] font-extrabold text-[#637c8e]">{index + 1}</span>
              <span>{section.heading}</span>
            </a>
          </li>
        ))}
      </ol>
      <a href="#cau-hoi-thuong-gap" className="mt-3 flex min-h-11 items-center gap-2.5 border-t border-[#e4ece5] px-2.5 pt-3 text-[13px] font-semibold text-[#526f8e] hover:text-[#218e38] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#5fae3b]"><HelpCircle className="size-5" aria-hidden="true" />Câu hỏi thường gặp</a>
    </>
  );
}

/** Public legal pages share the marketing shell; dashboard policy cards remain unchanged. */
export function PublicPolicyShell({
  title,
  subtitle,
  sections,
  faqs,
  kind,
}: {
  title: string;
  subtitle: string;
  sections: PublicPolicySection[];
  faqs: PolicyFaq[];
  kind: "privacy" | "terms";
}) {
  const isPrivacy = kind === "privacy";

  return (
    <MarketingLayout className="flex min-h-screen flex-col">
      <main className="flex-1 bg-white text-[#12365a]">
        <section className={`${styles.hero} relative isolate overflow-hidden`} aria-labelledby="policy-title">
          <Image src="/images/landing-sky-v2.webp" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-bottom" aria-hidden="true" />
          <div className={`${styles.heroWash} absolute inset-0 -z-10`} aria-hidden="true" />
          <div className="marketing-container relative flex min-h-[460px] items-center pb-12 pt-28 sm:min-h-[420px] sm:pb-14 sm:pt-24 lg:min-h-[415px]">
            <div className="relative z-10 max-w-[570px] pb-16 sm:pb-0">
              <nav aria-label="Đường dẫn" className="flex items-center gap-2 text-xs font-medium text-[#456984] sm:text-sm">
                <Link href="/" className="rounded-sm hover:text-[#168d36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168d36]">Trang chủ</Link>
                <ChevronRight className="size-3.5" aria-hidden="true" />
                <span aria-current="page">{title}</span>
              </nav>
              <h1 id="policy-title" className="marketing-page-title mt-5 max-w-[12ch] text-[#0b3153]">{title}</h1>
              <p className="mt-4 max-w-[48ch] text-pretty text-[15px] leading-7 text-[#315674] sm:text-base">{subtitle}</p>
            </div>
            <div className="pointer-events-none absolute bottom-0 right-[-5%] z-0 w-[52%] max-w-[500px] sm:right-[2%] sm:w-[46%] lg:right-[4%] lg:max-w-[500px]" aria-hidden="true">
              <Image src="/images/landing-hero-mascot-v1.webp" alt="" width={1536} height={1024} priority sizes="(max-width: 639px) 60vw, (max-width: 1023px) 46vw, 560px" className="h-auto w-full drop-shadow-[0_10px_10px_rgba(25,99,59,0.13)]" />
              <span className={`${styles.heroEmblem} absolute right-[10%] top-[16%] grid size-12 place-items-center rounded-2xl bg-white/90 text-[#168d36] shadow-md sm:size-16`}>
                {isPrivacy ? <ShieldCheck className="size-7 sm:size-9" /> : <FileText className="size-7 sm:size-9" />}
              </span>
            </div>
          </div>
        </section>

        <div className="marketing-container grid gap-8 py-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12 lg:py-14">
          <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
            <details className={`${styles.mobileToc} group rounded-xl border border-[#dfebdf] bg-[#fcfefb] lg:hidden`}>
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-extrabold text-[#12365a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5fae3b] [&::-webkit-details-marker]:hidden">
                <span>Nội dung chính</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#526f8e]">{sections.length} mục <ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" /></span>
              </summary>
              <nav aria-label="Nội dung chính" className="border-t border-[#e4ece5] px-3 pb-3 pt-2">
                <PolicyTocLinks sections={sections} />
              </nav>
            </details>
            <nav aria-label="Nội dung chính" className="hidden rounded-xl border border-[#dfebdf] bg-[#fcfefb] p-4 lg:block">
              <h2 className="px-2 py-2 text-sm font-extrabold text-[#12365a]">Nội dung chính</h2>
              <div className="mt-1"><PolicyTocLinks sections={sections} /></div>
            </nav>
          </aside>

          <article className="min-w-0 max-w-[850px]" aria-label={title}>
            <div className="space-y-10 sm:space-y-12">
              {sections.map((section, index) => (
                <section key={section.id} id={section.id} className="scroll-mt-8">
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-[#d8f4d0] text-base font-black text-[#16662c]" aria-hidden="true">{index + 1}</span>
                    <div className="min-w-0">
                      <h2 className="text-balance text-[21px] font-black leading-tight tracking-[-0.02em] text-[#12365a] sm:text-2xl">{section.heading}</h2>
                      <p className="mt-2.5 max-w-[74ch] text-pretty text-[15px] leading-7 text-[#4b6683] sm:text-base sm:leading-7">{section.body}</p>
                    </div>
                  </div>
                </section>
              ))}
            </div>
            <p className="mt-12 border-t border-[#e4ece8] pt-5 text-sm leading-6 text-[#627b91]">Nội dung mang tính tham khảo và cần được rà soát pháp lý trước khi áp dụng chính thức.</p>
          </article>
        </div>

        <section id="cau-hoi-thuong-gap" className="scroll-mt-6 bg-[#f2faef] py-12 sm:py-16" aria-labelledby="policy-faq-title">
          <div className="marketing-container grid items-start gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
            <div className="flex items-start gap-4">
              <Image src="/images/landing-faq-illustration-v1.png" alt="" width={112} height={112} sizes="112px" className="size-20 shrink-0 object-contain sm:size-24" aria-hidden="true" />
              <div>
                <p className="inline-flex rounded-full bg-[#e0f3d8] px-3 py-1 text-[11px] font-extrabold text-[#27813c]">CÂU HỎI THƯỜNG GẶP</p>
                <h2 id="policy-faq-title" className="mt-3 max-w-[18ch] text-balance text-2xl font-black leading-[1.1] tracking-[-0.025em] text-[#12365a] sm:text-3xl">Một số câu hỏi thường gặp</h2>
                <p className="mt-3 max-w-[42ch] text-sm leading-6 text-[#526f8e]">Tìm hiểu thêm về {isPrivacy ? "cách Win-Win Back xử lý thông tin của bạn" : "cách sử dụng dịch vụ và nhận hoàn tiền"}.</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {faqs.map((faq) => (
                <details key={faq.question} className={`${styles.faqItem} group rounded-xl bg-white px-4 py-3.5 sm:px-5`}>
                  <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#12365a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5fae3b] [&::-webkit-details-marker]:hidden">
                    {faq.question}<ChevronRight className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-90" aria-hidden="true" />
                  </summary>
                  <p className="mt-3 border-t border-[#edf2ec] pt-3 text-sm leading-6 text-[#526f8e]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </MarketingLayout>
  );
}
