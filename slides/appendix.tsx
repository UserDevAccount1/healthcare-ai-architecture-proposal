import type { SlideDef } from "./types";

function AHead({ code, title }: { code: string; title: string }) {
  return (
    <header className="d-flex flex-column gap-2">
      <div className="eyebrow"><span>Appendix {code}</span><span className="q">for Q&amp;A</span></div>
      <h2>{title}</h2>
    </header>
  );
}

export const appendix: SlideDef[] = [
  {
    id: "a1-discovery",
    section: "A1 · Discovery",
    title: "Technical discovery questions",
    content: (
      <>
        <AHead code="A1" title="Technical discovery questions" />
        <p className="lede">These are unknowns to answer before the architecture is final. None of them are assumed.</p>
        <div className="row g-3" style={{ fontSize: ".88em" }}>
          {[
            ["Systems & APIs", ["Rippling: which API scopes and webhooks are on our plan?", "Jotform: HIPAA plan? webhook payloads? where are submissions stored?", "RingCentral: recording/transcript API access and retention settings?", "Healthcare systems: vendor names, export formats, any API?", "QuickBooks: is it needed at all in Phase 1?"]],
            ["Data & source of truth", ["Where does a referral officially live today?", "Which spreadsheets are operational, and who owns each?", "Monthly volumes: referrals, candidates, onboarding cases.", "How are people identified across systems (shared IDs)?"]],
            ["Identity & security", ["Identity provider: Google Workspace or Microsoft Entra? Is MFA enforced?", "Do all field staff have accounts and devices?", "Existing BAAs, and with which vendors?", "Security policies, incident response, log retention rules."]],
            ["Governance & people", ["What will the governing bodies need to review: architecture, vendor list, a risk assessment?", "Who owns each policy, and how are policies approved today?", "Who has authority to change SLAs and escalation paths?", "Where is the organization comfortable with AI-drafted text?"]],
          ].map(([t, items]) => (
            <div className="col-12 col-md-6" key={t as string}>
              <div className="panel h-100">
                <h3>{t as string}</h3>
                <ul>{(items as string[]).map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            </div>
          ))}
        </div>
      </>
    ),
    notes: ["Use this slide if asked 'what would you need to know first?'. Each answer changes a specific box in the architecture diagram."],
  },
  {
    id: "a2-data-model",
    section: "A2 · Data model",
    title: "Data model & API pattern",
    content: (
      <>
        <AHead code="A2" title="Data model & API pattern" />
        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <pre className="code">{`WorkItem
  id              uuid
  template        "hr.interview_feedback" | "referral.missing_docs" | ...
  subject_ref     external id (candidate, referral)  -- no PHI in Phase 1
  owner_id        user id (never a group)
  waiting_on      "internal" | "external:<party>"
  status          open | waiting | due_soon | overdue | escalated | resolved
  due_at          timestamptz   (from template SLA)
  sla_paused      { reason, until } | null
  checklist       [{ key, label, done_at }]
  escalation_lvl  0..3
  created_at / resolved_at

Event   (append-only)
  id, work_item_id, type, actor, payload_json, at

Template
  key, item_types, checklist, sla_hours, escalation_path[], channels[]

PolicyDoc
  id, title, owner_id, authority_rank, audience_roles[],
  version, effective_from, expires_at, status (draft|approved|superseded)`}</pre>
          </div>
          <div className="col-12 col-lg-6 d-flex flex-column gap-3">
            <pre className="code">{`# inbound (from integration layer)
POST /events
{ "source": "rippling",
  "type": "candidate.stage_changed",
  "external_id": "cand_8812",
  "data": { "stage": "interviewed",
            "interviewers": ["u_17","u_42"] } }

# engine applies template rules -> work items
GET  /work-items?owner=me&status=overdue
POST /work-items/{id}/resolve
POST /work-items/{id}/snooze { "until": "...", "reason": "..." }`}</pre>
            <pre className="code">{`# SLA sweep (every 15 min, deterministic)
for item in open_items():
    pct = elapsed_business_hours(item) / item.sla_hours
    if pct >= 1.0 and item.status != "overdue":
        mark(item, "overdue"); nudge(item.owner)
    elif pct >= 1.0 + item.escalation_lvl * 0.5:
        escalate(item)   # owner -> manager -> lead
    elif pct >= 0.75:
        mark(item, "due_soon")`}</pre>
          </div>
        </div>
      </>
    ),
    notes: ["The SLA sweep is plain code, not AI. It is explainable to an auditor line by line."],
  },
  {
    id: "a3-prompts",
    section: "A3 · Prompts",
    title: "Example prompts & guardrails",
    content: (
      <>
        <AHead code="A3" title="Example prompts & guardrails" />
        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <span className="label">Nudge drafting (Phase 1)</span>
            <pre className="code mt-1">{`SYSTEM: You write short, polite internal reminders.
Use only the facts in <item>. Do not invent dates,
names or commitments. Max 60 words. No member data
will ever be provided; if any appears, reply
"REDACT_REQUIRED" and nothing else.

<item>
template: hr.interview_feedback
owner_first_name: Dana
candidate_role: Care Coordinator
interview_date: 2026-10-28
days_waiting: 4
</item>`}</pre>
          </div>
          <div className="col-12 col-lg-6">
            <span className="label">Grounded policy answer</span>
            <pre className="code mt-1">{`SYSTEM: Answer only from <sources>. Every sentence
must cite [doc_id §section v#]. If the sources do not
answer the question, reply exactly:
"NO_AUTHORITATIVE_ANSWER" plus the closest source.
Never give legal, clinical or HR decisions.

<sources> ...retrieved, permission-filtered,
current-version passages... </sources>
<question> How many PTO days carry over? </question>`}</pre>
          </div>
        </div>
        <div className="panel">
          <h3>Guardrails in code, not just in prompts</h3>
          <ul className="mb-0" style={{ fontSize: ".9em" }}>
            <li>Field allowlist builds the &lt;item&gt; block. The model never sees raw records.</li>
            <li>Citation check: an answer whose citations don’t match retrieved passages is replaced with the no-answer response.</li>
            <li>Outbound messages to candidates go to an approval queue; internal nudges can auto-send after a quality trial.</li>
            <li>A weekly sample of prompts and responses is reviewed by a person, with scores kept for regression testing.</li>
          </ul>
        </div>
      </>
    ),
    notes: ["The sentinel strings (REDACT_REQUIRED, NO_AUTHORITATIVE_ANSWER) let code handle failure deterministically instead of trusting prose."],
  },
  {
    id: "a4-ceo",
    section: "A4 · CEO brief",
    title: "Chief-of-staff brief, maintained by nobody",
    content: (
      <>
        <AHead code="A4" title="Chief-of-staff brief, maintained by nobody" />
        <p className="lede">The CEO doesn’t want another dashboard to maintain. The brief is generated from the orchestration engine’s own data, so it is never maintained by hand.</p>
        <div className="row g-3" style={{ fontSize: ".9em" }}>
          <div className="col-12 col-lg-6">
            <div className="panel h-100">
              <h3>Monday 7:00 · generated brief (example)</h3>
              <ul>
                <li><b>Stuck:</b> 6 items past SLA; 4 are waiting on the same hiring manager.</li>
                <li><b>Referrals:</b> 92% answered within 24 h last week (target 95%); 3 prospects due for re-check.</li>
                <li><b>Hiring:</b> 2 offers waiting on references for more than 5 days.</li>
                <li><b>Your commitments:</b> 3 open items assigned to you from last week’s leadership meeting.</li>
              </ul>
              <p className="text-body-secondary mb-0">Example values for illustration only.</p>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="panel is-pine h-100">
              <h3>How it’s built</h3>
              <ul className="mb-0">
                <li>Numbers come from SQL over work items. The model never computes figures.</li>
                <li>The LLM writes only the narrative around those computed facts.</li>
                <li>Every line links to the underlying items.</li>
                <li>Meeting briefs pull open items for the attendees. Commitments come from action items logged in the engine.</li>
              </ul>
            </div>
          </div>
        </div>
      </>
    ),
    notes: ["This is why executive support isn't a separate project. Once the engine exists, the brief is mostly a query plus a template."],
  },
  {
    id: "a5-calls",
    section: "A5 · Call intelligence",
    title: "Call intelligence (Phase 2)",
    content: (
      <>
        <AHead code="A5" title="Call intelligence (Phase 2, approval-gated)" />
        <div className="row g-3" style={{ fontSize: ".9em" }}>
          {[
            ["Flow", "RingCentral recording → transcript (BAA-covered service) → summary + action items → care manager reviews → approved items become work items."],
            ["Value", "Less documentation time, action items no longer lost after calls, unresolved issues flagged for follow-up."],
            ["Preconditions", "Governing-body approval, a BAA with every processor, member consent and recording-notice review, and a retention policy for transcripts."],
            ["Start safely", "Pilot on internal staff calls (HR, operations) with no member data, to measure summary quality before Phase 2."],
          ].map(([k, v]) => (
            <div className="col-12 col-md-6" key={k}>
              <div className={`panel h-100 ${k === "Preconditions" ? "is-signal" : ""}`}><span className="label">{k}</span><p className="mt-1">{v}</p></div>
            </div>
          ))}
        </div>
      </>
    ),
    notes: ["Raw transcripts are never stored longer than needed. Approved summaries go into the record, and the rest follows the retention policy."],
  },
];
