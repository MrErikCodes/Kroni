// [REVIEW] copy generated; native review needed.
import type { ReactNode } from "react";
import DraftBanner from "./DraftBanner";

type Section = {
  id: string;
  number: string;
  title: string;
};

type PolicyShellProps = {
  eyebrow: string;
  title: string;
  intro?: string;
  updated: string;
  sections: Section[];
  children: ReactNode;
};

export default function PolicyShell({
  eyebrow,
  title,
  intro,
  updated,
  sections,
  children,
}: PolicyShellProps) {
  return (
    <article className="mx-auto max-w-6xl px-5 pb-24 pt-14 sm:px-8 sm:pb-32 sm:pt-20">
      {/* Header */}
      <header className="border-b border-sand-200 pb-12">
        <div className="flex flex-wrap items-center gap-3">
          <DraftBanner />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-sand-50 px-3 py-1 text-[11.5px] font-medium tracking-tight text-sand-700">
            <span
              aria-hidden="true"
              className="h-1 w-1 rounded-full bg-sand-500"
            />
            Sist oppdatert {updated}
          </span>
        </div>
        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-700">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-[44px] font-semibold leading-[1.05] tracking-tight text-sand-900 sm:text-[56px]">
          {title}
        </h1>
        {intro ? (
          <p className="mt-5 max-w-2xl text-[16px] leading-[1.6] text-sand-500">
            {intro}
          </p>
        ) : null}
      </header>

      <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-12 lg:gap-x-16">
        {/* Sidebar */}
        <aside
          aria-label="Innhold"
          className="lg:col-span-3"
        >
          <div className="lg:sticky lg:top-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sand-500">
              Innhold
            </p>
            <ol className="mt-5 space-y-2.5 text-[13.5px]">
              {sections.map((s) => (
                <li
                  key={s.id}
                  className="flex items-baseline gap-3"
                >
                  <span className="font-display tabular-nums text-sand-300">
                    {s.number}
                  </span>
                  <a
                    href={`#${s.id}`}
                    className="text-sand-700 hover:text-gold-700 hover:underline underline-offset-4"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        {/* Body */}
        <div className="lg:col-span-9">{children}</div>
      </div>
    </article>
  );
}

type PolicySectionProps = {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
};

export function PolicySection({
  id,
  number,
  title,
  children,
}: PolicySectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-sand-200 py-10 first:border-t-0 first:pt-0"
    >
      <div className="flex items-baseline gap-4">
        <span className="font-display text-[15px] font-medium tabular-nums text-gold-700">
          {number}
        </span>
        <h2 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-sand-900 sm:text-[28px]">
          {title}
        </h2>
      </div>
      <div className="mt-5 space-y-4 text-[15.5px] leading-[1.7] text-sand-700 [&_a]:text-gold-700 [&_a:hover]:underline [&_strong]:font-semibold [&_strong]:text-sand-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2.5 [&_li]:pl-1">
        {children}
      </div>
    </section>
  );
}
