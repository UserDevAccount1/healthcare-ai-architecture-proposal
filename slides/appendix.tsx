import type { SlideDef } from "./types";
import Pipeline, { type PipelineStep } from "@/components/Pipeline";

const alm: PipelineStep[] = [
  {
    key: "dev", title: "Build in DEV", hint: "Makers work here only",
    plain: "Changes are built in a practice copy of the system, never in the one staff use.",
    tech: "Each maker builds in the DEV environment inside a solution. Source is exported to a git repo for history and review.",
    tools: ["DEV environment", "Solutions", "Git (Azure DevOps or GitHub)"],
  },
  {
    key: "review", title: "Review", hint: "A second person checks",
    plain: "Someone else reviews every change before it moves on.",
    tech: "Solution checker runs automatically; a peer reviews flows, prompts and security roles.",
    tools: ["Solution checker", "Pull request"],
  },
  {
    key: "qa", title: "Test in QA", hint: "Real steps, test data",
    plain: "The change is tried in a test copy with sample data. Users from HR check it works the way they expect.",
    tech: "Deployed as a managed solution to QA through Power Platform Pipelines; test scripts plus prompt evaluation for agent changes.",
    tools: ["QA environment", "Power Platform Pipelines", "Copilot Studio test pane"], tone: "amber",
  },
  {
    key: "approve", title: "Approve", hint: "Business owner signs off",
    plain: "The business owner says yes before anything reaches staff.",
    tech: "Approval stage in the pipeline, with the approver and timestamp recorded.",
    tools: ["Pipeline approvals"], tone: "amber",
  },
  {
    key: "prod", title: "Release to PROD", hint: "Managed, locked, monitored",
    plain: "The change goes live. Nobody can edit the live version directly, and it can be rolled back.",
    tech: "A managed solution in a Managed Environment, with DLP policies and monitoring. The previous version is kept for rollback.",
    tools: ["PROD environment", "Managed Environments", "Purview DLP"],
  },
];

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
            ["Microsoft licensing", ["Which Microsoft 365 plan, and do staff use Teams or Slack day to day?", "Power Platform: premium connectors and Dataverse capacity?", "Copilot Studio and Azure subscription in place?", "Which Microsoft services are in scope of the existing HIPAA BAA?"]],
            ["Identity & security", ["Identity provider: Google Workspace or Microsoft Entra? Is MFA enforced?", "Do all field staff have accounts and devices?", "Existing BAAs, and with which vendors?", "Security policies, incident response, log retention rules."]],
            ["Governance & people", ["What will the governing bodies need to review: architecture, vendor list, a risk assessment?", "Who owns each policy, and how are policies approved today?", "Who has authority to change SLAs and escalation paths?", "Where is the organization comfortable with AI-drafted text?"]],
          ].map(([t, items]) => (
            <div className="col-12 col-md-6 col-xl-4" key={t as string}>
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
  {
    id: "a6-alm",
    section: "A6 · ALM",
    title: "How changes ship safely (DEV → QA → PROD)",
    content: (
      <>
        <AHead code="A6" title="How changes ship safely: DEV → QA → PROD" />
        <Pipeline steps={alm} label="Release pipeline" />
      </>
    ),
    notes: ["This is the application lifecycle management answer: three environments, managed solutions, pipeline approvals, and rollback."],
  },
  {
    id: "a7-skills",
    section: "A7 · Team skills",
    title: "Skills needed to build and run it",
    content: (
      <>
        <AHead code="A7" title="Skills needed to build and run it" />
        <div className="row g-3" style={{ fontSize: ".88em" }}>
          {[
            ["AI solutions architect", "Lead", ["Overall design and use-case triage (agent vs workflow)", "Security and governance design", "Stakeholder workshops, translating needs into plans"]],
            ["Copilot Studio developer", "Build", ["Agent topics, actions and knowledge sources", "Prompt design and evaluation sets", "Publishing to Teams, analytics"]],
            ["Power Automate developer", "Build", ["Cloud flows, custom connectors, error handling", "Scheduled timers and escalation", "Power Automate Desktop where no API exists"]],
            ["Dataverse / Power Apps developer", "Build", ["Data model: work items, templates, events", "Security roles and business units", "Model-driven work-queue app"]],
            ["Power BI developer", "Build", ["Aging and SLA reports", "Row-level security", "Fabric dataflows when data grows"]],
            ["Power Platform admin", "Run", ["Environments, DLP, Managed Environments", "Pipelines and release approvals", "Licence and capacity monitoring"]],
            ["Process owners (HR, intake, compliance)", "Own", ["Define templates, due dates, escalation paths", "Approve AI-drafted content", "Own policy documents"]],
            ["Change & training lead", "Adopt", ["Short how-to guides and Teams office hours", "Champions in each department", "Citizen-developer guardrails"]],
          ].map(([role, tag, items]) => (
            <div className="col-12 col-md-6 col-xl-3" key={role as string}>
              <div className="panel h-100">
                <span className="label">{tag as string}</span>
                <h3 className="mt-1">{role as string}</h3>
                <ul>{(items as string[]).map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            </div>
          ))}
        </div>
        <p className="text-body-secondary mb-0" style={{ fontSize: ".85em" }}>In a small organization, several of these sit with one or two people. The pilot needs the architect plus one Power Platform developer; the process owners matter as much as the builders.</p>
      </>
    ),
    notes: ["Citizen developers can build simple flows inside guardrails (DLP, DEV-only access), but the shared engine and agents stay with the core team."],
  },
  {
    id: "a8-glossary",
    section: "A8 · Glossary",
    title: "Glossary in plain words",
    content: (
      <>
        <AHead code="A8" title="Glossary in plain words" />
        <div className="row g-2" style={{ fontSize: ".88em" }}>
          {[
            ["PHI", "Protected Health Information: anything that identifies a member together with their health or care."],
            ["HIPAA / BAA", "US health privacy law. A Business Associate Agreement is the contract a vendor signs to handle PHI under HIPAA."],
            ["SLA / due date", "The agreed time something should be done in, such as replying to a referral within 24 hours."],
            ["Workflow", "A fixed set of steps that runs the same way every time. Here: Power Automate."],
            ["AI agent", "An assistant that understands and writes everyday language. Here: Copilot Studio in Teams."],
            ["RAG", "The AI looks up approved documents first, then answers only from what it found, with a citation."],
            ["Dataverse", "Microsoft's secure database behind Power Apps, where all follow-ups are stored."],
            ["Connector", "A ready-made link that lets two systems pass information without retyping."],
            ["RPA", "Software that clicks through a screen like a person would. A last resort for systems with no API."],
            ["DLP", "Data-loss prevention: rules that stop sensitive data going where it shouldn't."],
            ["Entra ID", "Microsoft's sign-in and identity service. One login, with MFA."],
            ["ALM · DEV / QA / PROD", "How changes are built, tested and released: in a practice copy, a test copy, then the live system."],
          ].map(([k, v]) => (
            <div className="col-12 col-md-6 col-xl-4" key={k}>
              <div className="panel h-100"><span className="label">{k}</span><p className="mt-1">{v}</p></div>
            </div>
          ))}
        </div>
      </>
    ),
    notes: ["Keep this open for business stakeholders during Q&A."],
  },
];
