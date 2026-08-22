import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { NavBar } from '@/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/NavBar';
import { Footer } from '@/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/Footer';

export default function NotFound() {
  return (
    <div className="winwin-root" id="top">
      <NavBar />
      <main className="min-h-screen bg-[#082b4b] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p
            className="font-black text-[#b7e961] leading-none tracking-tight mb-6"
            style={{ fontSize: 'clamp(80px, 20vw, 160px)' }}
          >
            404
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
            Trang này không tồn tại.
          </h1>
          <p className="text-white/60 text-base mb-10 leading-relaxed">
            Link bạn truy cập có thể đã bị xóa hoặc nhập sai địa chỉ.
          </p>
          <Link
            href="/"
            className="relative inline-flex items-center gap-2 font-semibold px-6 py-3.5 rounded-full text-[#14334c] transition-all duration-200 hover:brightness-105"
            style={{
              background: 'linear-gradient(135deg, #d4f57a 0%, #b7e961 50%, #9fd94e 100%)',
              boxShadow: '0 1px 0 0 rgba(255,255,255,0.55) inset, 0 -2px 0 0 rgba(0,0,0,0.12) inset, 0 4px 12px rgba(183,233,97,0.45), 0 1px 3px rgba(0,0,0,0.15)',
            }}
          >
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)' }}
              aria-hidden="true"
            />
            <span className="relative flex items-center gap-2">
              Về trang chủ <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
