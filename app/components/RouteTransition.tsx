"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Shows a top loading bar and dims the page to 40% while a client-side route
 * change is in flight. Dependency-free: detects navigation start from internal
 * link clicks + back/forward, and completion when the pathname changes.
 */
export default function RouteTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const activeRef = useRef(false);
  const tickRef = useRef<number | null>(null);
  const hideRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    setActive(true);
    setProgress(8);
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = window.setInterval(() => {
      // ease toward 90% while we wait for the new page
      setProgress((p) => (p < 90 ? p + (90 - p) * 0.1 : p));
    }, 200);
  }, []);

  const finish = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setProgress(100);
    if (hideRef.current) window.clearTimeout(hideRef.current);
    hideRef.current = window.setTimeout(() => {
      setActive(false);
      setProgress(0);
    }, 350);
  }, []);

  // Start on internal link clicks and on back/forward.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const a = (e.target as HTMLElement)?.closest?.("a");
      if (!a) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // same page (hash or query only) — no route change
      if (url.pathname === window.location.pathname) return;
      start();
    }
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", start);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", start);
    };
  }, [start]);

  // Finish when the path actually changes.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    finish();
  }, [pathname, finish]);

  // Safety net: never leave the page stuck dimmed if a nav stalls/cancels.
  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(finish, 8000);
    return () => window.clearTimeout(t);
  }, [active, finish]);

  return (
    <>
      <div
        aria-hidden
        className={`fixed left-0 top-0 z-[100] h-[3px] bg-violet-600 transition-[width,opacity] duration-200 ease-out ${
          active ? "opacity-100" : "opacity-0"
        }`}
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 10px rgba(124,58,237,0.7)",
        }}
      />
      <div
        className={`flex flex-1 flex-col transition-opacity duration-200 ${
          active ? "pointer-events-none opacity-40" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </>
  );
}
