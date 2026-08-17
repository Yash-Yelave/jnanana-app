import Image from "next/image";
import Link from "next/link";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link className="inline-flex items-center gap-2.5" href="/" aria-label="Upskillink home">
      <Image
        src="/assets/landing/brand-mark.png"
        alt=""
        width={39}
        height={42}
        className="h-8 w-auto"
        priority
      />
      <span
        className={`font-sans text-[22px] tracking-[-0.03em] ${inverse ? "text-white" : "text-black"}`}
      >
        upskillink
      </span>
    </Link>
  );
}
