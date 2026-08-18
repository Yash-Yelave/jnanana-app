import Image from "next/image";
import Link from "next/link";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link className="inline-flex items-center gap-3 shrink-0 py-1" href="/" aria-label="Jnanana Foundation home">
      <Image
        src="/assets/brand/logo-icon.png"
        alt="Jnanana Logo"
        width={77}
        height={123}
        className={`h-14 w-auto object-contain transition-transform ${
          inverse ? "brightness-0 invert" : ""
        }`}
        priority
      />
      <Image
        src="/assets/brand/logo-nameplate.png"
        alt="Jnanana Foundation"
        width={184}
        height={24}
        className={`h-7 w-auto object-contain ${
          inverse ? "brightness-0 invert" : ""
        }`}
        priority
      />
    </Link>
  );
}
