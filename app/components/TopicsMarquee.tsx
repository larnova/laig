import {
  Cpu,
  Binary,
  Workflow,
  Database,
  Gauge,
  FileText,
  SlidersHorizontal,
  MessageSquare,
  Boxes,
  Bot,
  type LucideIcon,
} from "lucide-react";

type Topic = {
  icon: LucideIcon;
  title: string;
  blurb: string;
};

// Factual — these are the topics and tools the community actually works on,
// drawn from the program's pillars. No invented people or quotes.
const topics: Topic[] = [
  {
    icon: Cpu,
    title: "Transformer Architectures",
    blurb: "Attention, embeddings, and the full stack from first principles.",
  },
  {
    icon: Binary,
    title: "Tokenization Strategies",
    blurb: "How models read low-resource African languages.",
  },
  {
    icon: Workflow,
    title: "Multi-Agent Systems",
    blurb: "Orchestrating tools and agents into real workflows.",
  },
  {
    icon: Database,
    title: "Data Curation",
    blurb: "Cleaning and validating localized tokens for Lokolm.",
  },
  {
    icon: Gauge,
    title: "Benchmarking",
    blurb: "Stress-testing models against real African scenarios.",
  },
  {
    icon: SlidersHorizontal,
    title: "Fine-Tuning",
    blurb: "Adapting open-source models to local context.",
  },
  {
    icon: FileText,
    title: "RAG Pipelines",
    blurb: "Retrieval over localized corpora and documents.",
  },
  {
    icon: MessageSquare,
    title: "Prompt Engineering",
    blurb: "Structured prompting and reliable tool use.",
  },
  {
    icon: Boxes,
    title: "Vector Embeddings",
    blurb: "The foundations of semantic search.",
  },
  {
    icon: Bot,
    title: "Agentic Workflows",
    blurb: "Building autonomous, evaluable pipelines.",
  },
];

function Card({ t }: { t: Topic }) {
  const Icon = t.icon;
  return (
    <div className="flex w-72 shrink-0 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{t.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{t.blurb}</p>
      </div>
    </div>
  );
}

/** Two rows of topic cards scrolling in opposite directions. */
export default function TopicsMarquee() {
  const rowA = topics;
  const rowB = [...topics].reverse();
  return (
    <div className="space-y-5">
      <MarqueeRow items={rowA} duration="48s" />
      <MarqueeRow items={rowB} duration="60s" reverse />
    </div>
  );
}

function MarqueeRow({
  items,
  duration,
  reverse = false,
}: {
  items: Topic[];
  duration: string;
  reverse?: boolean;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="laig-marquee-row group relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
      <div
        className="laig-marquee flex w-max gap-5"
        style={
          {
            "--marquee-duration": duration,
            animationDirection: reverse ? "reverse" : "normal",
          } as React.CSSProperties
        }
      >
        {doubled.map((t, i) => (
          <Card key={i} t={t} />
        ))}
      </div>
    </div>
  );
}
