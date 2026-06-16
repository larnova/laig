"use client";

import { useEffect, useRef, useState } from "react";
import { NeuralDecor } from "./illustrations";

/**
 * A resilient image. The photo is layered over a branded gradient + neural
 * decoration. If the photo fails to load, the gradient placeholder remains so
 * the layout still looks intentional.
 */
export default function Photo({
  src,
  alt,
  className = "",
  imgClassName = "",
  priority = false,
  zoom = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  zoom?: boolean;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // A cached image can finish loading before React attaches onLoad, so the
  // event never fires. Check `complete` on mount to cover that case.
  useEffect(() => {
    const img = ref.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth === 0) setFailed(true);
    else setLoaded(true);
  }, []);

  return (
    <div
      className={`group relative overflow-hidden bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-600 ${className}`}
    >
      {/* Always-present decorative layer (visible while loading or on failure) */}
      <NeuralDecor className="absolute -right-6 -top-6 h-40 w-40 text-white/30" />
      <NeuralDecor className="absolute -bottom-8 -left-8 h-32 w-32 text-white/20" />

      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${zoom ? "group-hover:scale-105" : ""} ${imgClassName}`}
        />
      )}
    </div>
  );
}
