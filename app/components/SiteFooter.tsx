import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row">
        <p>© {2026} Larnova AI Group — a wing of Interstellar Innovations.</p>
        <div className="flex items-center gap-5">
          <Link href="/events" className="transition-colors hover:text-violet-700">
            Events
          </Link>
          <Link href="/manage" className="transition-colors hover:text-violet-700">
            Sign in
          </Link>
          <a
            href="https://larnova.co"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-violet-700"
          >
            larnova.co
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
