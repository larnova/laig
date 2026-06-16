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

    // If it's already in (or above) the viewport at mount — e.g. on reload with
    // restored scroll, or just below the hero — reveal right away so it never
    // stays stuck hidden.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
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
      { threshold: 0.01, rootMargin: "0px 0px -10% 0px" }
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
