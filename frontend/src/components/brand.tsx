import Image from "next/image";
import Link from "next/link";

export function Brand({ inverse = false, href = "/dashboard" }: { inverse?: boolean; href?: string }) {
  return (
    <Link className="inline-flex items-center gap-4 shrink-0 py-1" href={href} aria-label="Jnanana Foundation home">
      <Image
        src="/assets/brand/logo-icon.png"
        alt="Jnanana Logo"
        width={100}
        height={160}
        className="h-16 w-auto object-contain transition-transform hover:scale-105"
        priority
      />
      <div className="flex flex-col justify-center">
        <span
          className="font-sans text-[26px] font-extrabold tracking-tight leading-tight"
          style={{
            background: "linear-gradient(135deg, #FFE066 0%, #D4AF37 50%, #B38728 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 2px 8px rgba(212, 175, 55, 0.25))",
          }}
        >
          Jnanana Foundation
        </span>
      </div>
    </Link>
  );
}
