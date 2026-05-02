import Image from "next/image";

type AppShotProps = {
  src: string;
  alt: string;
  aspect?: "portrait" | "tall";
  tone?: "sand" | "gold";
  crop?: "full" | "top";
  priority?: boolean;
};

const ASPECT: Record<NonNullable<AppShotProps["aspect"]>, string> = {
  portrait: "aspect-[4/5]",
  tall: "aspect-[9/16]",
};

export default function AppShot({
  src,
  alt,
  aspect = "portrait",
  tone = "sand",
  crop = "full",
  priority = false,
}: AppShotProps) {
  const fit = crop === "top" ? "object-cover object-top" : "object-contain";
  return (
    <div
      className={[
        "relative overflow-hidden rounded-3xl border",
        tone === "gold" ? "border-gold-100 bg-gold-50" : "border-sand-200 bg-sand-100",
        ASPECT[aspect],
      ].join(" ")}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 420px, (min-width: 640px) 60vw, 92vw"
        priority={priority}
        className={[
          "drop-shadow-[0_18px_40px_rgba(31,28,20,0.18)]",
          fit,
          crop === "full" ? "p-6 sm:p-8" : "",
        ].join(" ")}
      />
    </div>
  );
}
