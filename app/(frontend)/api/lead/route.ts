import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TO = process.env.LEAD_EMAIL_TO;
// Must be on a domain you've verified in Resend. For first tests you can use
// "onboarding@resend.dev" (Resend's sandbox sender, which only delivers to the
// email on your Resend account).
const FROM = process.env.LEAD_EMAIL_FROM || "onboarding@resend.dev";

interface LeadBody {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
}

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const esc = (s: string) =>
  s.replace(
    /[<>&"]/g,
    (c) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c] as string,
  );

export async function POST(req: Request) {
  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return Response.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 120);
  const email = (body.email ?? "").trim().slice(0, 160);
  const company = (body.company ?? "").trim().slice(0, 160);
  const message = (body.message ?? "").trim().slice(0, 2000);

  if (!name || !isEmail(email)) {
    return Response.json(
      { ok: false, error: "Please share your name and a valid email." },
      { status: 422 },
    );
  }

  // Don't lose a lead if email isn't configured yet — log it and tell the client.
  if (!process.env.RESEND_API_KEY || !TO) {
    console.warn("[lead] RESEND_API_KEY or LEAD_EMAIL_TO missing. Lead:", {
      name,
      email,
      company,
      message,
    });
    return Response.json(
      { ok: false, error: "Lead email isn't configured yet." },
      { status: 503 },
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: `With Hammad Leads <${FROM}>`,
      to: [TO],
      replyTo: email,
      subject: `New lead: ${name}${company ? " · " + company : ""}`,
      html: `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5">
        <h2 style="margin:0 0 12px">New website lead</h2>
        <p><strong>Name:</strong> ${esc(name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
        <p><strong>Company:</strong> ${esc(company) || "—"}</p>
        <p><strong>Message:</strong><br>${esc(message).replace(/\n/g, "<br>") || "—"}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
        <p style="color:#888;font-size:13px">Sent from the chatbot lead form on withhammad.com</p>
      </div>`,
    });

    if (error) {
      console.error("[lead] resend error:", error);
      return Response.json(
        { ok: false, error: "Couldn't send right now." },
        { status: 502 },
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[lead] send failed:", err);
    return Response.json(
      { ok: false, error: "Couldn't send right now." },
      { status: 502 },
    );
  }
}
