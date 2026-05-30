# Sample Project — demonstrates methodology

> **Illustrative demonstration build.** This is not a real client engagement. The company is anonymized, the architecture is representative of how I design these systems, and every outcome in the Representative Metrics section is *modeled and reasoned, not measured from a live deployment.* Tool and vendor names refer to the integration stack the build would use — they are not the anonymized subject.

## Scenario

A US-based B2B SaaS company (mid-market, ~80–250 employees, sales-assisted product-led motion). Inbound demo requests, content downloads, and free-trial signups all flow into HubSpot, but routing is manual: an ops manager eyeballs each new lead, looks up the account, and pings an SDR in Slack. Nights, weekends, and lunchtime spikes get dropped on the floor.

## The Challenge

High-fit leads routinely wait 30–90 minutes — or until the next morning — for first contact, and SDRs burn cycles manually researching company size and tech stack before they reach out. Round-robin "fairness" is enforced from memory, so assignment is uneven and unauditable. The specific friction this build removes is the manual research-and-assign gap between form submit and the first qualified human touch.

## The Automation Logic

**Trigger:** a HubSpot webhook fires on form submission (and on the `lifecyclestage` transition to *lead*), POSTing to a self-hosted **n8n** Webhook node. n8n is the orchestrator; HubSpot remains the system of record.

```text
HubSpot form submit ──► n8n Webhook (trigger)
        │
        ▼
[Dedup / idempotency: hash(email + form_guid), check Redis for 24h key] ──► exit if seen
        │
        ▼
[Enrich: Apollo (primary) → Clearbit/Breeze (fallback on non-200 / timeout)]
        │  map → employee_count, industry, technologies[], seniority, country
        ▼
[Consent + lawful-basis gate — branch on `country`]
        │   EU / UK / EEA  → require recorded opt-in (GDPR Art. 6(1)(a)); check suppression list
        │   US / CA / RoW  → proceed under legitimate interest / CAN-SPAM; check suppression list
        │   (any region) consent missing OR on suppression list → nurture-only, no rep alert
        ▼
[Score: Fit (firmographic) + Intent (page / product signals) → A / B / C tier]
        │
        ├── Tier A / B ──► [Round-robin: next available SDR from persisted rotation state]
        │                       │
        │                       ├─► HubSpot: set owner, create task, write scoring properties
        │                       ├─► Slack DM to rep: name, company, score, booking link
        │                       └─► Instant scheduler: rep-specific calendar link (sub-5-min path)
        │
        └── Tier C ──────────► HubSpot workflow enrollment: automated nurture sequence
```

**Step detail**

1. **Idempotency.** Compute `hash(email + form_guid)` and write it to Redis with a 24h TTL; if the key already exists, exit early. This absorbs double-submits, browser retries, and HubSpot webhook re-delivery so a single human action never fans out into duplicate owners, tasks, or Slack pings.
2. **Enrichment + mapping.** Look up Apollo by email/domain; on a non-200 or timeout, fall back to Clearbit (now offered as HubSpot Breeze Intelligence). Map the response to a normalized contract (`employee_count`, `industry`, `technologies[]`, `seniority`, `country`) and write **only non-null fields** back to HubSpot, so a thin enrichment response never clobbers existing good data.
3. **Consent + lawful basis.** Branch on the enriched `country`. EU/UK/EEA leads require a recorded affirmative opt-in (lawful basis = consent, GDPR Art. 6(1)(a)) before any rep outreach and are checked against a global suppression/unsubscribe list; US/CA/rest-of-world leads proceed under legitimate interest within CAN-SPAM, still gated by the same suppression check. Anyone missing consent or present on the suppression list is dropped to nurture-only and excluded from rep alerts. Consent state and basis are stamped on the record for audit.
4. **Error handling.** Every external call (enrichment, HubSpot, Slack) is wrapped with retry — 3 attempts, exponential backoff. On exhaustion the lead is routed to a manual-review queue and an alert is posted to `#revops-alerts`, so a vendor outage degrades to "a human looks at it" rather than a silently dropped lead.
5. **Scoring.** Fit is derived from `employee_count`, `industry`, and `country`; Intent from pricing-page views, trial activation, and the form type submitted. The two combine into an A/B/C tier. Thresholds live in config, not hard-coded in nodes, so RevOps can tune them without redeploying the workflow.
6. **Round-robin assignment.** Rotation state is persisted in a datastore (not in node memory, which would reset on restart), and reps flagged OOO are skipped. The chosen owner is written to the HubSpot record, giving a complete, queryable audit trail of who got what and why.
7. **Human handoff.** Tier A/B reps receive a Slack DM and an owned HubSpot task with a rep-specific scheduler link; Tier C is suppressed from rep alerts and enrolled in nurture only.

## Representative Metrics

> **Modeled / representative outcomes — not real client results.** The figures below are reasoned from the mechanism and from published benchmarks, stated conservatively. In a live deployment they would be confirmed with HubSpot reporting plus n8n execution logs.

- **Median speed-to-lead: ~75 min → under 5 min (routing path).** Assignment becomes event-driven, so latency collapses to enrichment + API round-trip time. The sub-5-minute figure is the *time to a routed, rep-ready lead*; actual human contact still depends on rep pickup. The remaining variance is rep response and enrichment-API latency, not the assignment step.
- **Lead-to-meeting conversion: modeled +20–30%.** The *direction* is well established in the speed-to-lead literature (e.g., the Lead Response Management / *HBR* "Short Life of Online Sales Leads" research), which shows that contacting within ~5 minutes versus 30+ sharply raises the odds of reaching and qualifying a lead. The specific percentage here is a deliberately conservative modeled estimate, not a number taken from that research — real lift depends on SDR follow-through and ICP fit.
- **~15–20% of previously "dead" leads recovered via nurture.** Conservative against typical re-engagement email recovery rates: Tier C and consent-deferred leads that were previously ignored now enter a structured sequence instead of going nowhere.
- **SDR research time: ~5–8 min/lead → ~0.** Firmographic and tech-stack data arrive pre-attached on the record, removing the manual lookup that used to precede outreach.
- **100% routing auditability.** Every assignment is logged with owner, score, consent basis, and timestamp, which closes out "who got that lead?" disputes by construction.

## What this demonstrates

This build shows event-driven orchestration against a live CRM, third-party enrichment with graceful vendor fallback, idempotent and fault-tolerant pipeline design, region-aware consent handling (GDPR lawful basis plus suppression), and defensible fit/intent scoring tied to a measurable business outcome — speed-to-lead. The transferable skill is turning a fragile manual handoff into an auditable, resilient system that degrades safely instead of dropping revenue on the floor. The numbers above are illustrative of that mechanism; proving them on a specific account is an instrumentation-and-measurement exercise, which is exactly how I'd scope the first 30 days of a real engagement.

*"We went from 'whose turn is it?' to leads hitting the right rep's Slack before they'd closed the thank-you page."* (representative scenario — illustrative, not a real client quote)

---

# Sample Project — demonstrates methodology

*This is an illustrative demonstration build, created to show how I architect RFQ recovery and reorder automation. It is not a real client engagement: the company is anonymized, no real organization is named, and every figure in the Representative Metrics section is modeled and reasoned from public benchmarks — not measured from a live account.*

## Scenario

A European B2B industrial e-commerce / wholesale supplier — GDPR-bound, multi-country, selling in EUR across multiple languages with account-based (tiered) pricing. Picture a catalog of MRO consumables, fasteners, and safety equipment sold across DACH, Benelux, and the Nordics. Buyers request quotes online, but conversion depends on fast, multi-touch follow-up that a small inside-sales team cannot sustain by hand.

## The Challenge

RFQs arrived through the storefront and a contact form, then sat in an inbox until a rep had time — often hours, sometimes a full day later. High-intent quotes went cold, reps duplicated outreach or missed it entirely, and nothing systematically re-engaged stalled quotes or flagged when a recurring consumable was due for reorder. The friction to remove: dead time between buyer intent and first response, plus the manual memory work of chasing stalled quotes and anticipating replenishment.

## The Automation Logic

**Orchestration:** Make (Integromat). **CRM:** Pipedrive. **Storefront:** Shopify Plus B2B. **Email:** Brevo (transactional + sequences). **Time-sensitive channels:** WhatsApp Business / SMS, consent-gated.

**Triggers**
- Webhook on RFQ submit (Shopify `draft_orders/create` plus the custom contact-form payload).
- Pipedrive deal `stage_id` change → `Quote Sent`.
- Scheduled scenario (daily) scanning won deals for reorder due-dates.

```text
RFQ webhook ──▶ [Make] dedupe (hash email+SKU, 24h age check) ──▶ enrich (VIES VAT + domain firmographics)
   │                                                                 │
   │                                                  upsert Pipedrive Person+Org+Deal
   │                                                                 │
   ▼                                              consent / lawful-basis check + suppression list
speed-to-lead branch ◀──────────────────────────────────────────────┤
   ├─ consent=yes ▶ WhatsApp/SMS within ~5 min + Brevo email + rep task
   └─ consent=no  ▶ Brevo reply-to-own-RFQ email only + rep task
                                                                     │
Quote-Sent ──▶ wait 2d ▶ no reply? ▶ reminder 1 (email) ▶ wait 3d ▶ reminder 2 (WA if consent) ▶ rep handoff
Reorder scan ──▶ last_order + cycle_days reached ▶ pre-filled reorder draft + nudge (consented channel)
```

**Step flow**
1. **Ingest + dedup / idempotency.** Hash `email + primary SKU` and store it with a timestamp in a Make data store. On each new submit, look up the hash and compare record age against a 24-hour window (the age check is explicit — data stores have no native TTL); inside the window, repeat submits update the existing deal instead of spawning a duplicate.
2. **Enrichment + mapping.** VIES validation on the buyer's VAT number confirms country and registration validity; a domain/firmographic lookup fills `language` and `price_tier` signals. RFQ line items map to the Pipedrive deal `products` array, with estimated value written to the custom field `rfq_value_est`.
3. **Consent gate (GDPR).** Read `marketing_consent` and `channel_consent_whatsapp`. WhatsApp/SMS fires only on explicit opt-in. The first email reply is justified as pre-contractual / legitimate-interest processing — the buyer submitted the RFQ and is awaiting an answer to their own request — while any *additional* marketing messaging requires recorded consent (the stricter member-state rules, e.g. Germany, are assumed as the baseline). A central suppression list is checked before every send, and every outbound carries one-click unsubscribe.
4. **Speed-to-lead.** On consent, WhatsApp/SMS plus a transactional email dispatch within ~5 minutes; a Pipedrive activity is routed to the territory rep by `Org.country`.
5. **Quote-abandonment recovery.** A `Quote Sent` deal with no reply triggers a 2-day, then 3-day cadence. Any inbound reply or stage change cancels the remaining steps — a router-plus-filter re-checks live deal state immediately before each send, so a buyer who has already responded is never chased.
6. **Predictive reorder.** For won deals, `last_order_date + cycle_days` (cycle derived from the historical reorder interval per SKU) generates a pre-filled reorder draft and a nudge on the buyer's consented channel.
7. **Error handling.** Each HTTP module sits behind a Make error handler using the Break directive with incremental retry intervals (3 attempts); terminal failures route to a dead-letter data store plus a Slack alert, so nothing is silently dropped.
8. **Human handoff.** Every branch creates or updates a rep task. Inbound replies and high-value RFQs (`rfq_value_est` over threshold) escalate to a human immediately rather than continuing inside automation.

## Representative Metrics *(modeled / representative outcomes — illustrative, reasoned from public benchmarks, not measured client results)*

- **First-response time: from ~6h to under 5 min.** The ~6h baseline is a representative average for the manual-triage state described above (inbox dwell from "hours to a full day"). The improvement is structural, not optimistic: an event-driven webhook removes queue time almost entirely, so the floor is set by API latency rather than rep availability.
- **RFQ-to-quote progression: +20–35%.** Grounded in the speed-to-lead effect from the Lead Response Management Study (Dr. James Oldroyd, MIT / InsideSales.com; later popularized by HBR's *The Short Life of Online Sales Leads*), which found contact within five minutes sharply raises the odds of *qualifying* a lead. That study measures qualification, not closed conversion, and was run in faster-cycle contexts — so this band is a deliberately conservative downward extrapolation for longer B2B industrial cycles, not a restatement of the headline figure.
- **Abandoned-quote recovery: 8–15% of stalled quotes revived.** Anchored to typical email re-engagement / cart-recovery rates (commonly mid-single to low-double digits) and held to the low end, because a quote needs human price agreement to close, unlike a one-click cart recovery.
- **Reorder revenue: 5–12% uplift on consumables.** Replenishment prompts target already-activated accounts with established purchase cycles, where the buying decision is largely pre-made; a well-timed nudge to a known buyer at the right interval is a low-friction lever, which is why a single-digit uplift on the consumables line is plausible and conservatively bounded.

## What this demonstrates

This sample shows end-to-end RevOps automation design: event-driven orchestration, CRM data modeling with dedup and idempotency, GDPR-compliant consent gating and suppression, multi-channel sequencing with proper exit conditions, and resilient error handling with human escalation. The same patterns transfer directly to any quote-driven or subscription / replenishment B2B motion. *"The follow-up that used to depend on whoever remembered now just happens — and stops the moment a human steps in." (representative scenario — illustrative, not a real client quote.)*

---

# Sample Project — demonstrates methodology

> **Illustrative demonstration build.** This is a portfolio sample created to show methodology, not a real client engagement. No real company, customer data, results, or production system is represented. The numbers in *Representative Metrics* are modeled, not measured. Tool names (Segment, n8n, Customer.io, Slack, etc.) are used illustratively to make the build concrete — the same pattern ports to equivalent tools.

## Scenario

An anonymized B2B SaaS company managing the post-sale journey — subscription/seat-based, customer-success-led, with accounts split roughly 60/40 across the United States and Europe (illustratively, a mid-market collaboration platform around \$8M ARR). After the sale, the journey is owned by a small CS/AM team that uses a CRM for account context but has no systematic link between *what users actually do in the product* and *what CS does next*.

## The Challenge

CS was effectively flying blind between renewal cycles. Usage data lived in the product-analytics/CDP stack, account context lived in the CRM, and the two never met. Onboarding stalls — an account that provisioned 40 seats but activated 6 — went unnoticed until a QBR or, worse, a non-renewal notice. The friction this build removes is the manual, lagging, gut-feel triage of which accounts need a human, replacing it with event-driven health scoring that surfaces churn risk and expansion signals while there is still time to act.

## The Automation Logic

Orchestration runs in **n8n**. **Segment** is the event source (instrumented from the product, with the product-analytics tool as the upstream layer), the **CRM** supplies account context, **Customer.io** handles lifecycle messaging, and **Slack** is the human-handoff surface.

```text
[Segment event webhook]  ──►  n8n Webhook Trigger
        │
        ▼
  Normalize + dedup (key = native message_id; fallback hash if absent)
        │
        ▼
  Enrich: CRM lookup by account_id ──► merge {plan, seats, ARR, region, renewal_date, CSM}
        │
        ├── region = EU/EEA? ──► check messaging-consent flag
        │                         └─ not opted in ──► suppress send, score + alert only (log to CRM)
        ▼
  Compute health score (weighted: active-seat ratio, feature depth, admin-active, trend Δ30d)
        │
   ┌────┴───────────────┬──────────────────────┐
   ▼                    ▼                      ▼
 score < 40         40–70 (steady)        expansion signal:
 CHURN RISK         lifecycle nurture     seats > 90% used OR
   │                via Customer.io       gated-feature attempts
   ▼                  (consent-gated)         │
 Slack alert to #cs-alerts                    ▼
 (account, score, drivers,                Slack to #expansion + AM,
  renewal date, "Open in CRM")            create CRM task "upsell review"
```

Step by step:

1. **Trigger.** A Segment webhook fires the n8n Webhook Trigger on key product events (`feature_used`, `seat_provisioned`, `admin_invite`, `integration_connected`). A separate n8n **Schedule Trigger** runs a nightly batch recompute, so health scores reflect trend and decay even for accounts that go quiet — detection never depends solely on live events.

2. **Idempotency.** Webhooks retry, so dedup is keyed on the event source's **native message/event ID** (which is stable across retries) against a short-lived cache (~24h). When an event arrives without a native ID, the flow falls back to a composite hash (`account_id + event_name + rounded_timestamp`). This collapses retried deliveries to a single processed event without dropping genuinely distinct events.

3. **Enrichment + field mapping.** A CRM lookup by `account_id` merges `plan_tier`, `seat_count`, `arr`, `region`, `renewal_date`, and `csm_owner`. A missing or ambiguous account routes to an explicit error branch — surfaced and queued for replay, never silently dropped.

4. **Consent / GDPR (EU/EEA branch).** The build separates two distinct purposes. Internal health scoring and surfacing an existing customer's usage to *their own CSM* are treated as service/account-management processing of customer data. **Outbound lifecycle messaging** is the regulated step: before any Customer.io send, the account's messaging-consent flag is checked, and non-consented EU/EEA accounts are suppressed from sends while still being scored and surfaced to CS via Slack. The applicable lawful basis (GDPR Art. 6 plus ePrivacy/PECR for electronic messaging) is configured per jurisdiction with legal sign-off rather than assumed — the automation enforces whatever the consent record says.

5. **Scoring + branching.** A weighted composite (active-seat ratio, feature depth, admin activity, 30-day trend Δ) buckets accounts into churn-risk / steady / expansion. Weights and thresholds are config, not hard-coded, so they can be tuned against observed outcomes.

6. **Human handoff.** Churn-risk and expansion both route to Slack with a deep link to the CRM record and the top score drivers, so a person — not the workflow — decides the play. Steady accounts stay in consent-gated lifecycle nurture.

7. **Error handling.** Failed CRM or Customer.io calls retry with exponential backoff (e.g. 3 attempts); persistent failures post to an `#automation-errors` channel with the payload attached for inspection and replay, so no signal is lost to a transient outage.

## Representative Metrics *(modeled / representative outcomes — not real client results)*

- **Time to detect a stalling onboarding: ~3 weeks → under 48 hours.** *Reasoning:* detection shifts from a human noticing at the next QBR (a quarterly cadence) to an event/threshold check. The floor becomes event-plus-batch latency rather than meeting frequency — a structural change, so this is the most defensible of the four.

- **15–25% of accounts *in the flagged at-risk segment* re-engaged before renewal.** *Reasoning:* a conservative read of published lifecycle/re-engagement recovery rates. Acting early on a *known-risk* segment beats blind outreach, but the figure is recovery within that segment — not the whole base — and most actual saves still depend on the CS conversation the alert triggers, not the automation alone.

- **Activation lift on stalled new accounts: roughly +8–15% reaching the activation milestone.** *Reasoning:* grounded in the well-documented activation→retention link. Nudging stalled provisioners toward first key actions raises the share that cross an activation threshold, with the effect concentrated among accounts far below their seat potential. It is deliberately hedged: the lift is on the share of *stalled* accounts that activate, and it holds only if the nudged action is genuinely the one that drives activation in this product.

- **Expansion: ~1–3 qualified upsell signals per CSM per month, surfaced automatically.** *Reasoning:* a function of how many accounts cross 90% seat utilization or hit gated features. Modest per rep, but these are warm, usage-proven signals rather than cold prospecting — the value is timing and qualification, not volume.

## What this demonstrates

This sample shows the transferable core of post-sale RevOps automation: joining a product-event stream to CRM context, building a defensible composite health score, and routing it through idempotent, error-handled orchestration with consent-aware suppression and explicit human-handoff points. The hard part is never a single node — it's the data plumbing, the edge cases (retries, missing records, consent state), and judging where automation should stop and a human should take over.

*"We finally saw the stalled accounts before the renewal call instead of after."* — representative scenario, illustrative only; not a real client quote.
