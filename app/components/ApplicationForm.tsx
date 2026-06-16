"use client";

import { useEffect, useState } from "react";
import {
  Code2,
  Briefcase,
  GraduationCap,
  Mail,
  User,
  Building2,
  CheckCircle2,
  Loader2,
  Sparkles,
  Users,
  School,
  AlertCircle,
  Compass,
} from "lucide-react";

type Path = "ambassador" | "member";

type ChapterSummary = { id: string; university: string };

type FormState = {
  fullName: string;
  email: string;
  university: string; // ambassador: the chapter they want to found
  chapterId: string; // member: the chapter they join
  department: string;
  level: string;
  github: string;
  linkedin: string;
  motivation: string;
  graduationYear: string; // ambassador: expected graduation year
};

type Errors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = {
  fullName: "",
  email: "",
  university: "",
  chapterId: "",
  department: "",
  level: "",
  github: "",
  linkedin: "",
  motivation: "",
  graduationYear: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Selectable graduation years: this year through +6.
const GRAD_YEARS = Array.from({ length: 7 }, (_, i) => 2026 + i);

/** Capitalize the first letter of each word (e.g. "university of lagos"). */
function titleCase(value: string): string {
  return value.replace(/(^|\s)(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
}

export default function ApplicationForm() {
  const [path, setPath] = useState<Path>("member");
  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle"
  );

  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(true);

  const isAmbassador = path === "ambassador";

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/chapters");
        const data = await res.json();
        if (active) setChapters(data.chapters ?? []);
      } catch {
        if (active) setChapters([]);
      } finally {
        if (active) setChaptersLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const noChapters = !chaptersLoading && chapters.length === 0;

  function switchPath(next: Path) {
    if (next === path) return;
    setPath(next);
    setErrors({});
    setServerError(null);
  }

  function update(field: keyof FormState, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setServerError(null);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validate(): Errors {
    const next: Errors = {};

    if (!values.fullName.trim()) next.fullName = "Please enter your full name.";

    if (!values.email.trim()) {
      next.email = "An email address is required.";
    } else if (!EMAIL_RE.test(values.email.trim())) {
      next.email = "Enter a valid email address.";
    }

    if (isAmbassador) {
      if (!values.university.trim()) {
        next.university = "Name the university for your new chapter.";
      }
      if (!values.graduationYear) {
        next.graduationYear = "Select your expected graduation year.";
      }
      if (!values.github.trim()) {
        next.github = "A GitHub profile is required for ambassadors.";
      } else if (!/github\.com\//i.test(values.github.trim())) {
        next.github = "Enter a full github.com profile URL.";
      }
      if (!values.linkedin.trim()) {
        next.linkedin = "A LinkedIn profile is required for ambassadors.";
      } else if (!/linkedin\.com\//i.test(values.linkedin.trim())) {
        next.linkedin = "Enter a full linkedin.com profile URL.";
      }
      if (!values.motivation.trim()) {
        next.motivation = "Share a brief motivation statement.";
      } else if (values.motivation.trim().length < 40) {
        next.motivation = "Give us a little more — at least 40 characters.";
      }
    } else {
      if (!values.chapterId) next.chapterId = "Select the chapter you want to join.";
      if (!values.department.trim())
        next.department = "Enter your course or department.";
      if (!values.level.trim()) next.level = "Select your level of study.";
    }

    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, ...values }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        // Map a field-level code back onto the form when possible.
        if (data.code && data.code in EMPTY) {
          setErrors({ [data.code as keyof FormState]: data.error });
        }
        setServerError(data.error ?? "Submission failed. Please try again.");
        setStatus("idle");
        return;
      }

      // A new chapter just appeared — keep the local list current.
      if (path === "ambassador" && data.chapter) {
        setChapters((prev) =>
          prev.some((c) => c.id === data.chapter.id)
            ? prev
            : [...prev, data.chapter]
        );
      }
      setStatus("success");
    } catch {
      setServerError("Network error. Please check your connection and retry.");
      setStatus("idle");
    }
  }

  function reset() {
    setValues(EMPTY);
    setErrors({});
    setServerError(null);
    setStatus("idle");
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-violet-200 bg-white p-10 text-center shadow-lg shadow-violet-100">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
          <CheckCircle2 className="h-8 w-8 text-violet-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">
          {isAmbassador ? "Chapter request received 🎉" : "You're on the list 🎉"}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          Thanks, {values.fullName.split(" ")[0] || "there"}.{" "}
          {isAmbassador
            ? `Your request to start the ${values.university} chapter is in. LAIG HQ reviews every chapter before it goes live — once approved you can sign in and set it up.`
            : "Your chapter membership application is in."}{" "}
          Keep an eye on <span className="font-medium text-slate-900">{values.email}</span>.
        </p>
        <button
          onClick={reset}
          className="mt-8 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60 sm:p-8">
      {/* Path toggle */}
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1.5">
        <PathButton
          active={!isAmbassador}
          onClick={() => switchPath("member")}
          icon={<Users className="h-4 w-4" />}
          label="Join a Chapter"
        />
        <PathButton
          active={isAmbassador}
          onClick={() => switchPath("ambassador")}
          icon={<Sparkles className="h-4 w-4" />}
          label="Campus Ambassador"
        />
      </div>

      <p className="mt-4 text-sm text-slate-600">
        {isAmbassador
          ? "Found and lead the chapter at your university. Each university has exactly one Campus Ambassador — you'll drive recruitment, run workshops, and earn first consideration for the Lokolm Research Fellowship."
          : "Join the active LAIG chapter at your university to access workshops, compute credits, and the talent pipeline."}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Full name"
            error={errors.fullName}
            icon={<User className="h-4 w-4" />}
            id="fullName"
          >
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={values.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Ada Lovelace"
              className={inputClass(!!errors.fullName)}
            />
          </Field>

          <Field
            label="Email address"
            error={errors.email}
            icon={<Mail className="h-4 w-4" />}
            id="email"
          >
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@university.edu.ng"
              className={inputClass(!!errors.email)}
            />
          </Field>
        </div>

        {/* ── Member: pick an existing chapter ─────────────── */}
        {!isAmbassador && (
          <>
            <Field
              label="Your chapter"
              error={errors.chapterId}
              icon={<School className="h-4 w-4" />}
              id="chapterId"
            >
              <select
                id="chapterId"
                value={values.chapterId}
                onChange={(e) => update("chapterId", e.target.value)}
                disabled={chaptersLoading || noChapters}
                className={selectClass(
                  !!errors.chapterId,
                  values.chapterId === ""
                )}
              >
                <option value="" disabled>
                  {chaptersLoading
                    ? "Loading chapters…"
                    : noChapters
                    ? "No chapters available yet"
                    : "Select your university chapter"}
                </option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.university}
                  </option>
                ))}
              </select>
            </Field>

            {/* No chapter at their university → route them to found one */}
            <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
              <Compass className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
              <div className="text-sm">
                <p className="font-semibold text-slate-900">
                  {noChapters
                    ? "No chapters exist yet — be the first!"
                    : "Don't see your university?"}
                </p>
                <p className="mt-0.5 text-slate-600">
                  Chapters are created by Campus Ambassadors. If yours isn&apos;t
                  listed,{" "}
                  <button
                    type="button"
                    onClick={() => switchPath("ambassador")}
                    className="font-semibold text-violet-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                  >
                    become its Campus Ambassador
                  </button>{" "}
                  and create it.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Course / department"
                error={errors.department}
                icon={<GraduationCap className="h-4 w-4" />}
                id="department"
              >
                <input
                  id="department"
                  type="text"
                  value={values.department}
                  onChange={(e) => update("department", e.target.value)}
                  placeholder="Computer Science"
                  className={inputClass(!!errors.department)}
                />
              </Field>

              <Field label="Level of study" error={errors.level} id="level">
                <select
                  id="level"
                  value={values.level}
                  onChange={(e) => update("level", e.target.value)}
                  className={selectClass(!!errors.level, values.level === "")}
                >
                  <option value="" disabled>
                    Select your level
                  </option>
                  <option value="100">100 Level</option>
                  <option value="200">200 Level</option>
                  <option value="300">300 Level</option>
                  <option value="400">400 Level</option>
                  <option value="500">500 Level</option>
                  <option value="postgraduate">Postgraduate</option>
                </select>
              </Field>
            </div>
          </>
        )}

        {/* ── Ambassador: found a new chapter ──────────────── */}
        {isAmbassador && (
          <>
            <Field
              label="University (your new chapter)"
              error={errors.university}
              icon={<Building2 className="h-4 w-4" />}
              id="university"
            >
              <input
                id="university"
                type="text"
                value={values.university}
                onChange={(e) => update("university", titleCase(e.target.value))}
                placeholder="University of Lagos"
                className={inputClass(!!errors.university)}
              />
            </Field>

            <Field
              label="Expected graduation year"
              error={errors.graduationYear}
              icon={<GraduationCap className="h-4 w-4" />}
              id="graduationYear"
            >
              <select
                id="graduationYear"
                value={values.graduationYear}
                onChange={(e) => update("graduationYear", e.target.value)}
                className={selectClass(
                  !!errors.graduationYear,
                  values.graduationYear === ""
                )}
              >
                <option value="" disabled>
                  Select your graduation year
                </option>
                {GRAD_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="GitHub profile"
                error={errors.github}
                icon={<Code2 className="h-4 w-4" />}
                id="github"
              >
                <input
                  id="github"
                  type="url"
                  inputMode="url"
                  value={values.github}
                  onChange={(e) => update("github", e.target.value)}
                  placeholder="https://github.com/username"
                  className={inputClass(!!errors.github)}
                />
              </Field>

              <Field
                label="LinkedIn profile"
                error={errors.linkedin}
                icon={<Briefcase className="h-4 w-4" />}
                id="linkedin"
              >
                <input
                  id="linkedin"
                  type="url"
                  inputMode="url"
                  value={values.linkedin}
                  onChange={(e) => update("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className={inputClass(!!errors.linkedin)}
                />
              </Field>
            </div>

            <Field
              label="Why do you want to lead a LAIG chapter?"
              error={errors.motivation}
              id="motivation"
            >
              <textarea
                id="motivation"
                rows={4}
                value={values.motivation}
                onChange={(e) => update("motivation", e.target.value)}
                placeholder="Tell us about your engineering background and what you'd build with localized AI on your campus..."
                className={`${inputClass(!!errors.motivation)} resize-none`}
              />
            </Field>
          </>
        )}

        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting" || (!isAmbassador && noChapters)}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition-all hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : isAmbassador ? (
            "Create my chapter"
          ) : (
            "Join this chapter"
          )}
        </button>

        <p className="text-center text-xs text-slate-400">
          By applying you agree to be contacted by Interstellar Innovations
          about the LAIG program.
        </p>
      </form>
    </div>
  );
}

function PathButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
        active
          ? "bg-white text-violet-700 shadow-sm ring-1 ring-slate-200"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

function Field({
  label,
  error,
  icon,
  id,
  children,
}: {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"
      >
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
    hasError
      ? "border-red-300 focus-visible:ring-red-500"
      : "border-slate-300 focus:border-violet-400 focus-visible:ring-violet-500"
  }`;
}

function selectClass(hasError: boolean, isPlaceholder: boolean) {
  return `${inputClass(hasError)} appearance-none ${
    isPlaceholder ? "text-slate-400" : "text-slate-900"
  }`;
}
