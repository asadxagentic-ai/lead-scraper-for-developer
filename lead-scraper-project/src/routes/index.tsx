import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

interface FormData {
  "WHAT BUSINESS YOU WANT TO SEARCH": string;
  "WHERE YOU WANT TO SEARCH": string;
}

type ResultValue = string | number | boolean | null | undefined;
type ResultData = Record<string, ResultValue>;

const WEBHOOK_URL =
  "https://asadullah-95e.app.n8n.cloud/webhook/lead-scraper";

const SUCCESS_KEYS = new Set(["status", "state", "result"]);

const FIELDS = [
  {
    label: "Business type",
    name: "WHAT BUSINESS YOU WANT TO SEARCH" as const,
    placeholder: "Boutique coffee roasters",
    hint: "Category, niche, or keyword",
    step: "01",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 21V9l9-6 9 6v12" />
        <path d="M9 21v-8h6v8" />
      </svg>
    ),
  },
  {
    label: "Location",
    name: "WHERE YOU WANT TO SEARCH" as const,
    placeholder: "Brooklyn, NY",
    hint: "City, region, or country",
    step: "02",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

function Index() {
  const [formData, setFormData] = useState<FormData>({
    "WHAT BUSINESS YOU WANT TO SEARCH": "",
    "WHERE YOU WANT TO SEARCH": "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [resultInView, setResultInView] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result || error) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [result, error]);

  useEffect(() => {
    const node = resultRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setResultInView(true);
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const validate = useCallback(() => {
    const next: Partial<Record<keyof FormData, string>> = {};
    for (const f of FIELDS) {
      if (!formData[f.name].trim()) next[f.name] = `${f.label} is required`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [formData]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setResult(null);
    if (!validate()) return;
    setIsLoading(true);
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const text = await response.text();
      if (!response.ok) {
        setError({ message: text || `Request failed with status ${response.status}.`, status: response.status });
        return;
      }
      let data: unknown;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setError({ message: "The response was not valid JSON." });
        return;
      }
      if (typeof data !== "object" || data === null || Array.isArray(data)) {
        setError({ message: "The response was not a valid object." });
        return;
      }
      setResult(data as ResultData);
    } catch {
      setError({ message: "Network error. Please check your connection and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ "WHAT BUSINESS YOU WANT TO SEARCH": "", "WHERE YOU WANT TO SEARCH": "" });
    setErrors({});
    setResult(null);
    setError(null);
  };

  const resultEntries = result ? Object.entries(result) : [];
  const isSuccess = useMemo(() => {
    if (!result) return false;
    for (const [k, v] of Object.entries(result)) {
      if (SUCCESS_KEYS.has(k.toLowerCase()) && typeof v === "string") {
        return /success|ok|done|complete/i.test(v);
      }
    }
    return true;
  }, [result]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-8 lg:px-12">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo lockup */}
            <div className="flex items-center gap-2.5 select-none">
              <div className="relative flex h-8 w-8 items-center justify-center text-primary">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-full w-full"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" className="opacity-20" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                  <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
                </svg>
              </div>
              <span className="font-italic-serif text-2xl tracking-tight leading-none text-primary">
                Prospect
              </span>
            </div>

          </div>
        </header>

        {/* Hero */}
        <section className="animate-fade-up mt-20 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--color-amber-dot)" }}
              aria-hidden="true"
            />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              Automated outreach workflow
            </span>
          </div>
          <h1 className="mt-8 font-display text-[3.25rem] leading-[1.02] tracking-tight sm:text-[4.5rem] lg:text-[5.5rem]">
            Find the businesses{" "}
            <em className="font-italic-serif" style={{ color: "var(--color-primary)" }}>
              nobody is emailing
            </em>
            , in one search.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Give us a business type and a place. Our workflow scrapes Google Business,
            filters for the ones without a website, and drafts collaboration emails
            the moment leads land.
          </p>
        </section>

        {/* Grid */}
        <section className="animate-fade-up-delay-1 mt-16 grid gap-6 md:grid-cols-5 md:gap-8">
          {/* Left: Form card */}
          <div className="md:col-span-3">
            <div className="rounded-3xl border border-border bg-surface p-7 shadow-[0_1px_0_oklch(1_0_0/60%)_inset,0_10px_40px_-20px_oklch(0.22_0.02_150/15%)] transition-shadow duration-500 hover:shadow-[0_1px_0_oklch(1_0_0/60%)_inset,0_16px_48px_-20px_oklch(0.22_0.02_150/22%)] sm:p-9">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground">
                    COMPOSE
                  </div>
                  <h2 className="mt-2 font-display text-3xl">Brief the workflow</h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {FIELDS.map((f) => {
                  const hasError = !!errors[f.name];
                  return (
                    <div key={f.name} className="space-y-2.5">
                      <div className="flex items-baseline justify-between">
                        <label htmlFor={f.name} className="flex items-center gap-2 text-sm font-medium">
                          <span className="font-mono text-[10.5px] tracking-[0.18em] text-muted-foreground">
                            {f.step}
                          </span>
                          <span>{f.label}</span>
                          <span style={{ color: "var(--color-amber-dot)" }} aria-hidden="true">*</span>
                        </label>
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                          {f.hint}
                        </span>
                      </div>
                      <div
                        className={`group flex items-center rounded-2xl border bg-background transition-all focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10 ${
                          hasError ? "border-destructive/60" : "border-border"
                        }`}
                      >
                        <span className="pointer-events-none flex h-12 w-12 items-center justify-center text-muted-foreground group-focus-within:text-primary">
                          <span className="block h-4 w-4">{f.icon}</span>
                        </span>
                        <input
                          id={f.name}
                          name={f.name}
                          type="text"
                          placeholder={f.placeholder}
                          autoComplete="off"
                          value={formData[f.name]}
                          onChange={(e) => setFormData((p) => ({ ...p, [f.name]: e.target.value }))}
                          className="w-full bg-transparent py-3.5 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                        />
                      </div>
                      {hasError && (
                        <p className="font-mono text-[11px] text-destructive">→ {errors[f.name]}</p>
                      )}
                    </div>
                  );
                })}

                <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                  <p className="text-xs text-muted-foreground">
                    Your results will appear beside this form.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="rounded-full border border-border bg-background px-4 py-2.5 text-sm transition-colors hover:bg-accent"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-70"
                      style={{
                        background: "var(--color-ink)",
                        color: "var(--color-ink-foreground)",
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Spinner />
                          <span>Running…</span>
                        </>
                      ) : (
                        <>
                          <span>Run lead search</span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">
                            <path d="M7 17L17 7M9 7h8v8" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Pipeline note strip */}
            <ul className="animate-fade-up-delay-2 mt-4 space-y-2 rounded-2xl border border-border bg-surface/60 px-6 py-5 text-sm text-muted-foreground">
              {[
                "Scrapes Google Business via Apify for the exact query.",
                "Filters out any business that already has a website.",
                "Enriches leads with verified emails and social handles.",
                "Sends a collaboration email and confirms once queued.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span
                    className="mt-2 h-1 w-1 flex-shrink-0 rounded-full"
                    style={{ background: "var(--color-amber-dot)" }}
                    aria-hidden="true"
                  />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Result */}
          <div
            ref={resultRef}
            className={`transition-all duration-500 md:col-span-2 md:sticky md:top-8 md:self-start will-change-transform ${
              resultInView ? "animate-slide-up-reveal" : "opacity-0 translate-y-4"
            }`}
          >
            <div
              className="rounded-3xl p-7 shadow-2xl shadow-primary/10 transition-shadow duration-500 sm:p-8"
              style={{
                background: "var(--color-ink)",
                color: "var(--color-ink-foreground)",
              }}
            >
              <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] opacity-70">
                02RESULT
              </div>
              <h2 className="mt-2 font-display text-3xl">Workflow output</h2>

              <div className="mt-6">
                {isLoading ? (
                  <LoadingState />
                ) : error ? (
                  <ErrorState error={error} onRetry={() => handleSubmit()} />
                ) : result ? (
                  <ResultState
                    entries={resultEntries}
                    isSuccess={isSuccess}
                    onReset={handleReset}
                  />
                ) : (
                  <IdleState />
                )}
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function IdleState() {
  return (
    <div className="animate-fade-up rounded-2xl border border-white/12 bg-white/5 p-6">
      <div className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full pulse-soft"
          style={{ background: "var(--color-amber-dot)" }}
          aria-hidden="true"
        />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] opacity-80">
          Waiting for your brief
        </span>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed opacity-85">
        Fill in a business type and a location, then hit{" "}
        <span className="font-italic-serif">Run lead search</span>. The response
        from the n8n workflow will appear here.
      </p>
    </div>
  );
}

function LoadingState() {
  const rows = ["Contacting webhook", "Scraping Google Business", "Enriching contacts", "Queuing outreach"];
  return (
    <div className="animate-fade-up rounded-2xl border border-white/12 bg-white/5 p-6">
      <div className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full pulse-soft"
          style={{ background: "var(--color-amber-dot)" }}
          aria-hidden="true"
        />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] opacity-80">
          Workflow running
        </span>
      </div>
      <ul className="mt-5 space-y-3">
        {rows.map((r) => (
          <li key={r} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs opacity-85">
              <span>{r}</span>
              <span className="font-mono opacity-60">…</span>
            </div>
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="absolute inset-y-0 w-1/3 rounded-full shimmer-bar"
                style={{ background: "oklch(0.78 0.14 75 / 70%)" }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: { message: string; status?: number };
  onRetry: () => void;
}) {
  return (
    <div className="animate-fade-up rounded-2xl border border-white/12 bg-white/5 p-6">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "oklch(0.78 0.2 25)" }} aria-hidden="true" />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] opacity-80">
          Request failed{error.status !== undefined ? ` · ${error.status}` : ""}
        </span>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed opacity-90">{error.message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm transition-colors hover:bg-white/15"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1015-6.7L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
        Retry
      </button>
    </div>
  );
}

function ResultState({
  entries,
  isSuccess,
  onReset,
}: {
  entries: [string, ResultValue][];
  isSuccess: boolean;
  onReset: () => void;
}) {
  return (
    <div className="animate-fade-up rounded-2xl border border-white/12 bg-white/5 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: isSuccess ? "var(--color-amber-dot)" : "oklch(0.75 0.15 60)" }}
            aria-hidden="true"
          />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] opacity-80">
            Response · 200 OK
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/5 px-3 py-1.5 text-xs transition-colors hover:bg-white/10"
        >
          Run again
        </button>
      </div>
      <h3 className="mt-3 font-display text-2xl">
        {entries.length === 0
          ? "No data returned"
          : isSuccess
            ? "Leads saved & outreach queued"
            : "Response received"}
      </h3>

      {entries.length === 0 ? (
        <p className="mt-3 text-sm opacity-70">The webhook returned an empty object.</p>
      ) : (
        <dl className="mt-5 divide-y divide-white/10">
          {entries.map(([key, value], i) => (
            <div key={key} className="grid gap-1 py-3.5 sm:grid-cols-[110px_1fr] sm:gap-4">
              <dt className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] opacity-60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] opacity-75">
                  {key}
                </span>
              </dt>
              <dd className="min-w-0 break-words text-[15px] leading-relaxed">
                {value === null || value === undefined || value === "" ? (
                  <span className="opacity-50">—</span>
                ) : (
                  String(value)
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
