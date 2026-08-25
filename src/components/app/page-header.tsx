export function PageHeader({
  eyebrow,
  title,
  subtitle,
  bgText,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  bgText?: string;
}) {
  return (
    <div className="bg-ink px-gutter lg:px-gutter-lg pt-5 pb-4 lg:pt-6 lg:pb-5 border-b border-gold/[0.16] relative overflow-hidden">
      {bgText && (
        <span className="absolute -right-1 -bottom-3.5 font-display text-[56px] sm:text-[88px] font-bold text-white/[0.025] leading-none tracking-tight pointer-events-none select-none">
          {bgText}
        </span>
      )}
      {eyebrow && (
        <div className="font-condensed text-[10px] font-bold tracking-[0.22em] uppercase text-gold mb-1 relative">
          {eyebrow}
        </div>
      )}
      <h1 className="font-display text-[24px] sm:text-[29px] font-bold text-bone leading-tight tracking-tight relative text-balance">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[12.5px] text-slate mt-1 max-w-[560px] leading-relaxed relative text-pretty">
          {subtitle}
        </p>
      )}
    </div>
  );
}
