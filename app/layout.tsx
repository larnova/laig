import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";
import RouteTransition from "./components/RouteTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Larnova AI Group (LAIG) — Engineering Africa's Foundational AI",
  description:
    "LAIG is Interstellar Innovations' elite, department-backed student research network driving localized data curation and agentic development for Lokolm across Nigerian universities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-white text-slate-800"
      >
        <SiteNav />
        <RouteTransition>{children}</RouteTransition>
        <SiteFooter />
      </body>
    </html>
  );
}
