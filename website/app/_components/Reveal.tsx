"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Tiny IntersectionObserver-driven fade-in. CSS does the actual animation
 * (see .reveal in globals.css). Respects prefers-reduced-motion by
 * starting visible immediately.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Must start `false` on both server and client to avoid hydration mismatch:
  // `prefersReducedMotion()` returns `false` on the server (no window) but can
  // return `true` on the client, which would diverge the first client render
  // from the SSR HTML. The effect below resolves the real value post-mount.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    if (prefersReducedMotion()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Reduced-motion shortcut: cannot read matchMedia until after mount, must surface visibility post-render to keep SSR/CSR aligned.
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  const style = delay > 0 ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      data-visible={visible ? "true" : "false"}
      style={style}
    >
      {children}
    </div>
  );
}
