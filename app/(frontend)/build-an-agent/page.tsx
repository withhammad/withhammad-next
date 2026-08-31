import type { Metadata } from "next";
import BuildAgentForm from "@/components/agents/BuildAgentForm";

// Commercial conversion page (AMOS Phase 8 §84 staged improvement):
// the company-buyer journey — Understand → Intake → Discovery → Proposal.
// Intake posts to the AMOS AI Receptionist, which classifies, acknowledges,
// creates the CRM lead and routes high-value inquiries to Hammad immediately.

export const metadata: Metadata = {
  title: "Build a Custom AI Agent for Your Business — Hammad Yousuf, Dubai",
  description:
    "Get an autonomous AI agent built for your actual workflow — lead qualification, marketing ops, SEO, reporting or a custom process. Production-proven systems, human approval built in.",
};

const STEPS = [
  { n: "01", t: "Describe the workflow", d: "Tell me what repetitive work eats your team's time — leads, reporting, content ops, ad management, anything." },
  { n: "02", t: "Get a concrete agent design", d: "You receive a scoped proposal: what the agent does, what it refuses to do, integrations, approvals and timeline." },
  { n: "03", t: "Watch it work before you commit", d: "Every engagement starts with a demo against your real scenario — see the 73 free agents for the patterns I build with." },
];

const PROOF = [
  "Autonomous marketing OS running 24/7 on its own infrastructure",
  "Google Ads management agents operating under hard budget caps",
  "Lead-generation agents with verified, receipt-backed actions",
  "Human-approval gates on every externally visible action",
];

export default function BuildAnAgentPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <p className="font-data text-[12px] uppercase tracking-[0.12em] text-amber">Custom AI agents</p>
      <h1 className="text-h1 text-ink mt-3 max-w-[16ch]">Build an AI agent that does real work for your business.</h1>
      <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-ink/80">
        Not a chatbot. An autonomous agent that executes a workflow end to end — qualifying leads, running marketing
        operations, producing reports — with verification and human approval where it matters. Describe your process
        below; you&rsquo;ll get a serious answer, not a sales sequence.
      </p>

      <ol className="mt-10 grid gap-5 sm:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.n} className="rounded-xl border border-ink/10 p-4">
            <span className="font-data text-[12px] text-amber">{s.n}</span>
            <h2 className="mt-1 font-display text-[15px] font-bold text-ink">{s.t}</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-ink/70">{s.d}</p>
          </li>
        ))}
      </ol>

      <section className="mt-10 rounded-xl border border-ink/10 p-5">
        <h2 className="font-display text-[15px] font-bold text-ink">Built on production-proven systems</h2>
        <ul className="mt-2 grid gap-1.5 text-[13px] text-ink/75">
          {PROOF.map((p) => <li key={p}>· {p}</li>)}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-[17px] font-bold text-ink">Describe the workflow you want automated</h2>
        <p className="mt-1 text-[13px] text-ink/60">2 minutes. The more concrete the process, the more concrete the proposal.</p>
        <BuildAgentForm />
      </section>
    </main>
  );
}
