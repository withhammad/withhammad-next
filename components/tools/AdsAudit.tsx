"use client";

import { useState } from "react";
import Reveal from "@/components/tools/Reveal";
import CopyButton from "@/components/tools/CopyButton";

const PLATFORMS = ["Google Ads", "Meta Ads", "Both"] as const;

const FIELD =
  "h-11 w-full rounded-xl border border-white/10 bg-[var(--bg)] px-3.5 text-sm text-[var(--text)] placeholder:text-white/30 focus:border-[var(--accent-indigo)] focus:outline-none";

const TEXTAREA =
  "min-h-[180px] w-full rounded-xl border border-white/10 bg-[var(--bg)] px-3.5 py-3 text-sm text-[var(--text)] placeholder:text-white/30 focus:border-[var(--accent-indigo)] focus:outline-none";

type Status = "idle" | "streaming" | "done" | "error";

export default function AdsAudit() {
  const [platform, setPlatform] = useState<string>(PLATFORMS[0]);
  const [industry, setIndustry] = useState("");
  const [monthlySpend, setMonthlySpend] = useState("");
  const [accountData, setAccountData] = useState("");

  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const busy = status === "streaming";

  const run = async () => {
    if (busy || !accountData.trim()) return;
    setOutput("");
    setError("");
    setStatus("streaming");
    try {
      const res = await fetch("/api/ads-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          industry,
          monthlySpend,
          accountData,
        }),
      });

      if (res.status === 429 || res.status === 422) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Please try again.");
        setStatus("error");
        return;
      }
      if (!res.ok || !res.body) throw new Error("no stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        const text = chunk.value
          ? decoder.decode(chunk.value, { stream: true })
          : "";
        if (text) setOutput((prev) => prev + text);
      }
      setStatus("done");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <Reveal className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      {/* Controls */}
      <div className="rounded-2xl border border-white/10 bg-[var(--panel)] p-5 sm:p-6">
        <div className="mb-5">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
            Platform
          </span>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors " +
                  (platform === p
                    ? "bg-[var(--accent-indigo)] text-white"
                    : "border border-white/12 text-[var(--muted)] hover:border-white/30 hover:text-[var(--text)]")
                }
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                Industry
              </span>
              <input
                className={FIELD}
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. E-commerce, B2B SaaS, Real Estate"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                Monthly ad spend
              </span>
              <input
                className={FIELD}
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(e.target.value)}
                placeholder="e.g. AED 25,000 or $5,000"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Account data <span className="text-white/40">(required)</span>
            </span>
            <textarea
              className={TEXTAREA}
              value={accountData}
              onChange={(e) => setAccountData(e.target.value)}
              placeholder={`Paste anything diagnostic — the more, the better:

• Campaign names + status + monthly spend per campaign
• Top 10–20 search terms (Google) or ad sets (Meta) with CTR / CPC / CPA / ROAS
• Conversion tracking setup (events, goals)
• Recent changes (last 30–60 days)
• What's broken vs what's working

The model audits whatever you give it. Don't paste anything confidential.`}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={run}
          disabled={busy || !accountData.trim()}
          className={
            "mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors " +
            (busy
              ? "bg-white/10 text-white/60"
              : "bg-[var(--accent-indigo)] text-white hover:opacity-90 disabled:opacity-40")
          }
        >
          {busy ? "Auditing…" : "Run audit"}
        </button>

        {error ? (
          <p className="mt-3 text-sm text-amber-400">{error}</p>
        ) : (
          <p className="mt-3 text-xs text-[var(--muted)]">
            Free, no login. Limited to 6 runs/hour per IP. Nothing you paste is
            stored.
          </p>
        )}
      </div>

      {/* Output */}
      <div className="relative rounded-2xl border border-white/10 bg-[var(--panel)] p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
            Audit result
          </span>
          {output ? <CopyButton value={output} /> : null}
        </div>
        {output ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--text)]">
            {output}
          </pre>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            Your audit will appear here — Health Score, critical issues, quick
            wins, and strategic recommendations.
          </p>
        )}
      </div>
    </Reveal>
  );
}
