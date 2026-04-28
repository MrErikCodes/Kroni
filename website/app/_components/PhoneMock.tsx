// [REVIEW] copy generated; native review needed.
import type { ReactNode } from "react";

type ChoreCardProps = {
  title: string;
  meta: string;
  reward: string;
  done?: boolean;
};

function ChoreCard({ title, meta, reward, done = false }: ChoreCardProps) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-2xl border px-3.5 py-3.5 transition-colors",
        done
          ? "border-sand-200 bg-sand-50"
          : "border-sand-200 bg-white",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className={[
          "grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border-[1.5px]",
          done
            ? "border-gold-500 bg-gold-500"
            : "border-sand-300 bg-transparent",
        ].join(" ")}
      >
        {done ? (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="h-3.5 w-3.5"
          >
            <path
              d="M3 8.5L6.5 12L13 5"
              stroke="#1F1C14"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={[
            "truncate text-[13.5px] font-semibold tracking-tight",
            done ? "text-sand-500 line-through" : "text-sand-900",
          ].join(" ")}
        >
          {title}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-sand-500">{meta}</p>
      </div>
      <span
        className={[
          "flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums tracking-tight",
          done
            ? "bg-sand-100 text-sand-500"
            : "bg-gold-100 text-gold-700",
        ].join(" ")}
      >
        {reward}
      </span>
    </div>
  );
}

type PhoneMockProps = {
  className?: string;
  children?: ReactNode;
  variant?: "nb" | "en";
};

export default function PhoneMock({
  className = "",
  variant = "nb",
}: PhoneMockProps) {
  const t =
    variant === "en"
      ? {
          greeting: "Hi, Mira",
          today: "Today, Monday",
          balance: "Balance",
          remaining: "left to earn",
          chores: [
            { title: "Empty the dishwasher", meta: "Before dinner", reward: "10 kr", done: true },
            { title: "Tidy the room", meta: "Before bedtime", reward: "20 kr", done: false },
            { title: "Take out the trash", meta: "Tuesday", reward: "10 kr", done: false },
          ],
        }
      : {
          greeting: "Hei, Mira",
          today: "I dag, mandag",
          balance: "Saldo",
          remaining: "igjen å tjene",
          chores: [
            { title: "Tøm oppvaskmaskinen", meta: "Før middag", reward: "10 kr", done: true },
            { title: "Rydd rommet", meta: "Før leggetid", reward: "20 kr", done: false },
            { title: "Ta ut søppel", meta: "Tirsdag", reward: "10 kr", done: false },
          ],
        };

  return (
    <div
      className={`phone-frame mx-auto w-[300px] sm:w-[330px] ${className}`}
      role="img"
      aria-label={
        variant === "en"
          ? "Illustration of the Kroni kid app showing today's chores."
          : "Illustrasjon av Kroni-appen som viser dagens oppgaver."
      }
    >
      <div className="phone-screen aspect-[9/19.5]">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2 text-[10px] font-semibold tabular-nums text-sand-900">
          <span>09:24</span>
          <div className="flex items-center gap-1">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-sand-900/80"
            />
            <span
              aria-hidden="true"
              className="h-2.5 w-3.5 rounded-[3px] border border-sand-900/70"
            />
          </div>
        </div>

        {/* Greeting */}
        <div className="px-5 pt-2">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-sand-500">
            {t.today}
          </p>
          <h3 className="mt-1 font-display text-[22px] font-semibold leading-tight tracking-tight text-sand-900">
            {t.greeting}
          </h3>
        </div>

        {/* Balance card */}
        <div className="mx-5 mt-3 rounded-2xl bg-sand-900 p-4 text-sand-50">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-sand-50/60">
            {t.balance}
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-[32px] font-semibold tabular-nums tracking-tight text-sand-50">
              247
            </span>
            <span className="text-[15px] font-medium text-sand-50/70">kr</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-1 w-1 rounded-full bg-gold-500"
            />
            <p className="text-[10.5px] font-medium text-sand-50/70">
              {variant === "en" ? "53 kr" : "53 kr"} {t.remaining}
            </p>
          </div>
        </div>

        {/* Chores list */}
        <div className="mt-4 space-y-2 px-5">
          {t.chores.map((chore) => (
            <ChoreCard
              key={chore.title}
              title={chore.title}
              meta={chore.meta}
              reward={chore.reward}
              done={chore.done}
            />
          ))}
        </div>

        {/* Tab bar */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-around rounded-2xl border border-sand-200 bg-white px-2 py-2.5">
          <span
            aria-hidden="true"
            className="grid h-6 w-6 place-items-center rounded-full bg-gold-500"
          >
            <span className="h-2 w-2 rounded-full bg-sand-900" />
          </span>
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-sand-200"
          />
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-sand-200"
          />
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-sand-200"
          />
        </div>
      </div>
    </div>
  );
}
