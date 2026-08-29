type BrandLogoProps = {
  className?: string;
  light?: boolean;
  showName?: boolean;
};

export function BrandLogo({
  className = "",
  light = false,
  showName = true,
}: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 48 48" className="h-8 w-8 shrink-0" aria-hidden="true">
        <path d="M6 36.5 17.5 23l7.4 6.7L37.8 11" fill="none" stroke="#9AD336" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.5" />
        <path d="M29.2 11h8.6v8.6" fill="none" stroke="#EABF39" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.5" />
      </svg>
      {showName && <span className={`text-lg font-bold ${light ? "text-white" : "text-[#0d315d]"}`}>Win-Win Back</span>}
    </span>
  );
}
