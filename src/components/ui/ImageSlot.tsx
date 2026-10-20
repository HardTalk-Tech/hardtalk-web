import Image from "next/image";

type ImageSlotProps = {
  /** Image path (e.g. under /public). When omitted a labelled placeholder is shown. */
  src?: string;
  alt: string;
  placeholder: string;
  sizes?: string;
  className?: string;
};

/**
 * Fills its positioned parent with an image, or with a captioned placeholder
 * frame for photography that hasn't been supplied yet.
 */
export default function ImageSlot({ src, alt, placeholder, sizes = "100vw", className }: ImageSlotProps) {
  if (src) {
    return <Image src={src} alt={alt} fill sizes={sizes} className={["image-slot__img", className].filter(Boolean).join(" ")} />;
  }

  return (
    <div className={["image-slot", className].filter(Boolean).join(" ")} role="img" aria-label={alt}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="m21 16-5-5-9 9" />
      </svg>
      <span className="image-slot__caption">{placeholder}</span>
    </div>
  );
}
