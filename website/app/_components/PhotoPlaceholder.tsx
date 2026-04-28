// [REVIEW] photo placeholders — needs real shots.
type PhotoPlaceholderProps = {
  alt: string;
  caption: string;
  className?: string;
  aspect?: "square" | "portrait" | "landscape" | "wide";
  tone?: "sand" | "gold";
};

const ASPECT: Record<NonNullable<PhotoPlaceholderProps["aspect"]>, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/10]",
};

export default function PhotoPlaceholder({
  alt,
  caption,
  className = "",
  aspect = "landscape",
  tone = "sand",
}: PhotoPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={[
        "photo-placeholder relative overflow-hidden rounded-2xl border",
        tone === "gold"
          ? "border-gold-100 bg-gold-50"
          : "border-sand-200",
        ASPECT[aspect],
        className,
      ].join(" ")}
    >
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-sand-900/30 via-sand-900/0 to-transparent px-4 py-3">
        <span
          aria-hidden="true"
          className="h-1 w-1 rounded-full bg-sand-50"
        />
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-sand-50">
          Photo placeholder
        </p>
      </div>
      <div className="absolute left-4 top-4 max-w-[80%] rounded-md bg-sand-50/85 px-2.5 py-1.5 text-[11px] leading-snug text-sand-700 backdrop-blur-sm">
        {caption}
      </div>
    </div>
  );
}
