"use client";
// Intake form → AMOS AI Receptionist (classify → CRM → route). Falls back to
// the contact mailto if the control plane is unreachable — the lead is never lost.
import { useState } from "react";

const AMOS_INTAKE = process.env.NEXT_PUBLIC_AMOS_INTAKE_URL ?? "https://srv1943769.hstgr.cloud/intake";

export default function BuildAgentForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [ack, setAck] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      name: String(f.get("name") ?? ""),
      email: String(f.get("email") ?? ""),
      company: String(f.get("company") ?? ""),
      message: `[build-an-agent] Workflow: ${f.get("workflow")} | Tools: ${f.get("tools")} | Volume: ${f.get("volume")}`,
      source: "withhammad.com/build-an-agent",
    };
    setState("sending");
    try {
      const res = await fetch(AMOS_INTAKE, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      const out = (await res.json()) as { acknowledgement?: string };
      setAck(out.acknowledgement ?? "Thanks — I'll get back to you shortly.");
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="mt-4 rounded-xl border border-amber/40 p-5 text-[14px] text-ink">
        <p className="font-display font-bold">Received.</p>
        <p className="mt-1 text-ink/75">{ack}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Your name" className="rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-[14px]" />
        <input name="email" required type="email" placeholder="Work email" className="rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-[14px]" />
      </div>
      <input name="company" placeholder="Company (optional)" className="rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-[14px]" />
      <textarea name="workflow" required rows={4} placeholder="The workflow to automate — what happens today, step by step?" className="rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-[14px]" />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="tools" placeholder="Tools involved (CRM, sheets, ad platforms…)" className="rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-[14px]" />
        <input name="volume" placeholder="Rough volume (e.g. 50 leads/week)" className="rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-[14px]" />
      </div>
      <button type="submit" disabled={state === "sending"} className="mt-1 w-fit rounded-lg bg-ink px-5 py-2.5 font-display text-[14px] font-bold text-paper disabled:opacity-60">
        {state === "sending" ? "Sending…" : "Get an agent proposal"}
      </button>
      {state === "error" && (
        <p className="text-[13px] text-red-600">
          Couldn&rsquo;t reach the intake service — email me directly at{" "}
          <a className="underline" href="mailto:marketing@withhammad.com?subject=Build%20an%20AI%20agent">marketing@withhammad.com</a>.
        </p>
      )}
    </form>
  );
}
