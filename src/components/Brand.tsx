import type { ReactNode } from "react";

type BrandProps = {
  compact?: boolean;
  className?: string;
};

export function CelebraLogo({ compact = false, className = "" }: BrandProps) {
  return (
    <div className={`select-none text-center ${className}`}>
      <div
        className={`logo-stack inline-grid place-items-center ${
          compact ? "scale-75" : ""
        }`}
      >
        <span className="logo-word logo-word-pink">CELEBRA</span>
        <span className="logo-word logo-word-blue">TEEN</span>
        <span className="logo-year">2026</span>
      </div>
    </div>
  );
}

export function DecorativeStage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={`stage-bg relative min-h-dvh overflow-hidden ${className}`}>
      <div className="shape shape-pink-left" />
      <div className="shape shape-pink-right" />
      <div className="shape shape-yellow-left" />
      <div className="shape shape-yellow-right" />
      <div className="shape shape-blue-left" />
      <div className="shape shape-orange-bottom" />
      <div className="squiggle squiggle-one">~</div>
      <div className="squiggle squiggle-two">~</div>
      <div className="squiggle squiggle-three">~</div>
      <div className="relative z-10">{children}</div>
    </main>
  );
}
