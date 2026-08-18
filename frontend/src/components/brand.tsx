import Image from "next/image";
import Link from "next/link";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link className="inline-flex items-center gap-3.5 shrink-0 py-1" href="/" aria-label="Jnanana Foundation home">
      <Image
        src="/assets/brand/logo-icon.png"
        alt="Jnanana Logo"
        width={60}
        height={60}
        className={`h-12 w-auto object-contain transition-transform ${
          inverse ? "brightness-0 invert" : ""
        }`}
        priority
      />
      <Image
        src="/assets/brand/logo-nameplate.png"
        alt="Jnanana Foundation"
        width={200}
        height={60}
        className={`h-10 w-auto object-contain ${
          inverse ? "brightness-0 invert" : ""
        }`}
        priority
      />
    </Link>
  );
}
