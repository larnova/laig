import {
  Database,
  Cpu,
  Video,
  ArrowUpRight,
  Award,
  Route,
  Zap,
  GraduationCap,
} from "lucide-react";
import ApplicationForm from "./components/ApplicationForm";
import Photo from "./components/Photo";
import AvatarStack from "./components/AvatarStack";
import TopicsMarquee from "./components/TopicsMarquee";
import Reveal from "./components/Reveal";

// Photos are served locally from /public/images (downloaded from Unsplash, free
// license) so there's no runtime external dependency. The resilient <Photo>
// component still falls back to a branded gradient if an image can't load.
const photos = {
  heroMain: "/images/hero-main.jpg",
  gallery1: "/images/gallery-1.jpg",
  gallery2: "/images/gallery-2.jpg",
  gallery3: "/images/gallery-3.jpg",
};

// The three pillars, each told once as an image + text row. Unique links
// (data contribution, the weekly session calendar) live here in context.
const pillars = [
  {
    tag: "Data Engineering",
    icon: Database,
    title: "Train a model that speaks like home",
    body: "Pidgin, Yoruba, Hausa, Igbo, regional business logic: the nuances global models miss. Members curate and validate high-fidelity localized tokens that feed straight into Lokolm's training pipeline. No membership required to contribute.",
    img: photos.gallery2,
    alt: "A team reviewing AI training data together",
    link: {
      href: "https://lokolm.larnova.co/contribute",
      label: "Contribute at lokolm.larnova.co/contribute",
    },
  },
  {
    tag: "Agentic Benchmarking",
    icon: Cpu,
    title: "Push open models to their limits",
    body: "Members build advanced multi-agent workflows on top of open-source architectures and stress-test them against real-world African scenarios, surfacing exactly where today's models break.",
    img: photos.gallery1,
    alt: "Students building and testing AI systems together",
    link: null,
  },
  {
    tag: "Advanced Workshops",
    icon: Video,
    title: "Go deep, live, every single week",
    body: "We move past basic web development into real machine learning, with hands-on sessions on Google Meet every week. You build alongside engineers shipping real model work instead of watching from the sidelines.",
    img: photos.gallery3,
    alt: "Students in a lively workshop session",
    link: {
      href: "https://calendar.app.google/SzaFu1StNsQhLiNG6",
      label: "Book the weekly session",
    },
  },
];

const benefits = [
  {
    icon: Award,
    title: "The Lokolm Research Fellowship",
    body: "Top-performing engineers are selected for a paid, multi-month remote research fellowship with Interstellar Innovations.",
  },
  {
    icon: Route,
    title: "Direct Talent Pipeline",
    body: "Skip the resume pile. Outstanding LAIG members get fast-tracked for internships and full-time engineering roles.",
  },
  {
    icon: Zap,
    title: "Day-1 Compute Access",
    body: "LAIG chapters receive priority beta access and free API compute credits when Lokolm goes live.",
  },
  {
    icon: GraduationCap,
    title: "Academic Backing",
    body: "Run in direct partnership with university departments across disciplines, from computer science and engineering to linguistics, the sciences, and beyond, providing credible final-year project alignment for every member.",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
        {/* ── Hero ─────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* friendly color blooms */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-violet-300/40 blur-[130px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full bg-amber-200/50 blur-[120px]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-16 sm:pt-20 lg:grid-cols-2 lg:gap-10">
            {/* Left: copy */}
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                A student wing of Interstellar Innovations
              </span>
              <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Engineering Africa&apos;s Foundational{" "}
                <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                  AI Infrastructure
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 lg:mx-0">
                Interstellar Innovations is building{" "}
                <span className="font-semibold text-slate-900">Lokolm</span>, a
                next-generation foundational language model tailored for the
                African context. LAIG is the department-backed student research
                network driving localized data curation and agentic development
                across Nigerian universities.
              </p>
              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <a
                  href="#apply"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition-all hover:bg-violet-700 hover:shadow-violet-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:w-auto"
                >
                  Join Your Chapter
                </a>
                <a
                  href="#apply"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:w-auto"
                >
                  Become a Campus Ambassador
                </a>
              </div>
              <div className="mt-8 flex justify-center lg:justify-start">
                <AvatarStack />
              </div>
            </div>

            {/* Right: single strong hero image + floating stat card */}
            <Reveal
              from="right"
              className="relative mx-auto w-full max-w-md lg:max-w-none"
            >
              <Photo
                src={photos.heroMain}
                alt="Students collaborating on laptops"
                priority
                className="aspect-[4/5] rounded-3xl shadow-xl shadow-violet-200/60 ring-1 ring-slate-200"
              />
              {/* floating stat card, pinned inside the main image */}
              <div className="absolute bottom-4 left-4 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
                <p className="text-2xl font-extrabold text-violet-600">Weekly</p>
                <p className="text-xs font-medium text-slate-500">
                  live AI sessions
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── The Work (pillars as image + text rows) ─ */}
        <section className="mx-auto max-w-6xl overflow-x-clip px-6 py-16">
          <SectionHeading
            eyebrow="What we do"
            title="The Work We Do Together"
            subtitle="Three pillars drive the LAIG research network, and your work feeds directly into Lokolm."
          />
          <div className="mt-16 space-y-20 lg:space-y-28">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              const reverse = i % 2 === 1;
              return (
                <div
                  key={p.title}
                  className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
                >
                  <Reveal
                    from={reverse ? "right" : "left"}
                    className={reverse ? "lg:order-2" : ""}
                  >
                    <Photo
                      src={p.img}
                      alt={p.alt}
                      zoom
                      className="aspect-[4/3] rounded-3xl shadow-xl shadow-slate-200/70 ring-1 ring-slate-200"
                    />
                  </Reveal>
                  <Reveal
                    from={reverse ? "left" : "right"}
                    delay={120}
                    className={reverse ? "lg:order-1" : ""}
                  >
                    <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700">
                      <Icon className="h-3.5 w-3.5" />
                      {p.tag}
                    </span>
                    <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {p.title}
                    </h3>
                    <p className="mt-4 text-pretty leading-relaxed text-slate-600">
                      {p.body}
                    </p>
                    {p.link && (
                      <a
                        href={p.link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group mt-5 inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 mb-1"
                      >
                        {p.link.label}
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    )}
                  </Reveal>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── What we work on (animated topics) ────── */}
        <section className="overflow-hidden border-y border-slate-200 bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="The curriculum"
              title="What We Dig Into"
              subtitle="The topics and tools members explore together, from first principles to shipping real systems."
            />
          </div>
          <div className="mt-12">
            <TopicsMarquee />
          </div>
        </section>

        {/* ── Ecosystem Value (benefits) ───────────── */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading
            eyebrow="Why it's worth it"
            title="What You Get Out of It"
            subtitle="Tangible incentives for the students who join the community."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {benefits.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} from="up" delay={(i % 2) * 120} className="h-full">
                <div className="flex h-full gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Application Widget ───────────────────── */}
        <section
          id="apply"
          className="scroll-mt-20 border-t border-slate-200 bg-gradient-to-b from-violet-50/60 to-white"
        >
          <div className="mx-auto max-w-2xl px-6 py-20">
            <SectionHeading
              eyebrow="Get involved"
              title="Apply to LAIG"
              subtitle="Choose your path and tell us a little about yourself. Every application is reviewed by our team."
            />
            <div className="mt-10">
              <ApplicationForm />
            </div>
          </div>
        </section>
      </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-pretty text-slate-600">{subtitle}</p>
    </div>
  );
}
