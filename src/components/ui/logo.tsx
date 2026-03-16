import Image from "next/image";

const LOGO_SHADOW = "drop-shadow(0 0 10px rgba(184,151,90,0.35))";

export function LogoIcon({
  className = "h-9 w-auto",
}: {
  className?: string;
}) {
  return (
    <Image
      src="/logo.png"
      alt="RPM Recruit"
      width={36}
      height={36}
      className={className}
      style={{ filter: LOGO_SHADOW }}
      priority
    />
  );
}

export function LogoFull({
  className = "h-12 w-auto",
}: {
  className?: string;
}) {
  return (
    <Image
      src="/full.png"
      alt="RPM Recruit"
      width={240}
      height={48}
      className={className}
      style={{ filter: LOGO_SHADOW }}
      priority
    />
  );
}

export function Logo({ size = "default" }: { size?: "default" | "large" }) {
  return (
    <div className="flex items-center gap-3">
      <LogoIcon
        className={size === "large" ? "h-12 w-auto" : "h-9 w-auto"}
      />
      <span
        className={`font-display ${
          size === "large" ? "text-3xl" : "text-xl"
        } font-bold text-bone`}
      >
        <em className="text-gold not-italic">RPM</em> Recruit
      </span>
    </div>
  );
}
