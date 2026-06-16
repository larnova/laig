"use client";

import { useEffect, useRef, useState } from "react";

type Direction = "up" | "left" | "right";

/**
 * Reveals its children with a slide + fade the first time they scroll into
 * view. Dependency-free (IntersectionObserver) and disabled automatically when
 * the user prefers reduced motion.
 */
export default function Reveal({
  children,
  className = "",
  from = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  from?: Direction;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden =
    from === "left"
      ? "opacity-0 -translate-x-10"
      : from === "right"
      ? "opacity-0 translate-x-10"
      : "opacity-0 translate-y-8";

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-transform ${
        shown ? "translate-x-0 translate-y-0 opacity-100" : hidden
      } ${className}`}
    >
      {children}
    </div>
  );
}
