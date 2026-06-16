"use client";

import { useState } from "react";
import { NeuralDecor } from "./illustrations";

/**
 * A resilient image. The photo paints over a branded gradient + neural
 * decoration. We do NOT gate visibility on a JS load event — iOS Safari can
 * skip `onLoad` for lazy images, which left them stuck invisible. The browser
 * paints the image natively over the gradient; on error we keep the gradient.
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
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-600 ${className}`}
    >
      {/* Branded placeholder, visible while the image loads or if it fails. */}
      <NeuralDecor className="absolute -right-6 -top-6 h-40 w-40 text-white/30" />
      <NeuralDecor className="absolute -bottom-8 -left-8 h-32 w-32 text-white/20" />

      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${
            zoom ? "group-hover:scale-105" : ""
          } ${imgClassName}`}
        />
      )}
    </div>
  );
}
