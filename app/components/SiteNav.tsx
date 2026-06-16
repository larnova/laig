"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, LogIn, LogOut } from "lucide-react";

type AuthState = { signedIn: boolean; isAdmin: boolean } | null;

export default function SiteNav() {
  const pathname = usePathname();
  const [auth, setAuth] = useState<AuthState>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (active) setAuth({ signedIn: !!d.signedIn, isAdmin: !!d.isAdmin });
      })
      .catch(() => active && setAuth({ signedIn: false, isAdmin: false }));
    return () => {
      active = false;
    };
    // Re-check when the route changes (e.g. after sign-in redirect).
  }, [pathname]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const onManage = pathname === "/manage" || pathname.startsWith("/manage/");
  const signedIn = auth?.signedIn === true;

  const linkBase =
    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500";
  const linkActive = "bg-violet-100 text-violet-700";
  const linkIdle = "text-slate-600 hover:bg-slate-100 hover:text-violet-700";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Larnova AI Group logo"
            width={32}
            height={32}
            priority
            className="h-8 w-8 rounded-full"
          />
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            Larnova <span className="text-slate-400">AI Group</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/events"
            aria-current={pathname === "/events" ? "page" : undefined}
            className={`${linkBase} ${pathname === "/events" ? linkActive : linkIdle}`}
          >
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Events</span>
          </Link>

          {signedIn ? (
            <>
              <Link
                href="/manage"
                aria-current={onManage ? "page" : undefined}
                className={`${linkBase} ${onManage ? linkActive : linkIdle}`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                className={`${linkBase} ${linkIdle}`}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/manage"
                aria-current={onManage ? "page" : undefined}
                className={`${linkBase} ${onManage ? linkActive : linkIdle}`}
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
              <Link
                href="/#apply"
                className="ml-1 inline-flex items-center rounded-lg bg-violet-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              >
                Apply
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
