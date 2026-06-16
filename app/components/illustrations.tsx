import type { SVGProps } from "react";

/**
 * Local, dependency-free SVG illustrations. These always render (no external
 * host, no licensing concerns) and are used alongside the Unsplash photos to
 * add flair and represent people on-brand.
 */

const AVATAR_THEMES = [
  { from: "#a78bfa", to: "#7c3aed", glyph: "#ede9fe" }, // violet
  { from: "#fbbf24", to: "#f59e0b", glyph: "#fffbeb" }, // amber
  { from: "#34d399", to: "#10b981", glyph: "#ecfdf5" }, // emerald
  { from: "#60a5fa", to: "#2563eb", glyph: "#eff6ff" }, // blue
  { from: "#f472b6", to: "#db2777", glyph: "#fdf2f8" }, // pink
  { from: "#fb923c", to: "#ea580c", glyph: "#fff7ed" }, // orange
];

/** A friendly person-avatar illustration (head + shoulders) on a gradient. */
export function PersonAvatar({
  seed,
  className,
}: {
  seed: number;
  className?: string;
}) {
  const t = AVATAR_THEMES[seed % AVATAR_THEMES.length];
  const id = `av-${seed}`;
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.from} />
          <stop offset="100%" stopColor={t.to} />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill={`url(#${id})`} />
      {/* shoulders */}
      <path
        d="M10 44c0-7.7 6.3-13 14-13s14 5.3 14 13"
        fill={t.glyph}
        opacity="0.95"
      />
      {/* head */}
      <circle cx="24" cy="19" r="7.5" fill={t.glyph} />
    </svg>
  );
}

/** Decorative abstract "neural network" graphic for empty corners. */
export function NeuralDecor(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden {...props}>
      <g stroke="currentColor" strokeWidth="1.5" opacity="0.5">
        <path d="M30 40 L100 30 L170 60" />
        <path d="M30 40 L90 100 L170 60" />
        <path d="M30 40 L40 140 L90 100" />
        <path d="M90 100 L160 150 L170 60" />
        <path d="M40 140 L120 170 L160 150" />
      </g>
      <g fill="currentColor">
        <circle cx="30" cy="40" r="5" />
        <circle cx="100" cy="30" r="5" />
        <circle cx="170" cy="60" r="5" />
        <circle cx="90" cy="100" r="6" />
        <circle cx="40" cy="140" r="5" />
        <circle cx="160" cy="150" r="5" />
        <circle cx="120" cy="170" r="5" />
      </g>
    </svg>
  );
}
