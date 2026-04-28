import { CircleAlert } from "lucide-react";

export default function DraftBanner() {
  return (
    <div
      role="status"
      className="inline-flex items-center gap-2 rounded-full border border-gold-300 bg-gold-50 px-3.5 py-1.5 text-[12px] font-medium tracking-tight text-gold-900"
    >
      <CircleAlert
        aria-hidden="true"
        strokeWidth={1.75}
        className="h-3.5 w-3.5"
      />
      Utkast — under juridisk gjennomgang
    </div>
  );
}
