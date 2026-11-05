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
    id: "a2-guardrails",
    section: "A2 · AI guardrails",
    title: "How AI answers are kept safe",
    content: (
      <>
        <AHead code="A2" title="How AI answers are kept safe" />
        <div className="row g-3" style={{ fontSize: ".9em" }}>
          {[
            ["It only sees what it needs", "Each request contains only the fields the task needs, picked from an approved list. The AI never browses whole records."],
            ["It only answers from sources", "Policy answers must quote the approved document. If the quote can't be matched to a real passage, the answer is replaced with “no approved answer”."],
            ["It drafts, people decide", "Messages to candidates go to an approval queue. Hiring, discipline and eligibility decisions are never made by AI."],
            ["It stops at member data", "If member information shows up in a Phase 1 request, the request is blocked and logged instead of processed."],
            ["It is checked every week", "A person reviews a sample of AI drafts and answers each week. Scores are kept, so changes can't quietly make it worse."],
            ["It is logged", "Every question, answer and draft is logged with who asked, kept for a set retention period, and visible to auditors."],
          ].map(([k, v]) => (
            <div className="col-12 col-md-6 col-xl-4" key={k}>
              <div className="panel h-100"><h3>{k}</h3><p className="mb-0">{v}</p></div>
            </div>
          ))}
        </div>
      </>
    ),
    notes: ["These guardrails are enforced in the flows and settings, not only in the prompt wording."],
  },
  {
    id: "a4-ceo",
    section: "A3 · CEO brief",
    title: "Chief-of-staff brief, maintained by nobody",
    content: (
      <>
        <AHead code="A3" title="Chief-of-staff brief, maintained by nobody" />
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
    section: "A4 · Call intelligence",
    title: "Call intelligence (Phase 2)",
    content: (
      <>
        <AHead code="A4" title="Call intelligence (Phase 2, approval-gated)" />
        <div className="row g-3" style={{ fontSize: ".9em" }}>
          {[
            ["Flow", "RingCentral recording → transcript (BAA-covered service) → summary + action items → care manager reviews → approved items become work items."],
            ["Value", "Less documentation time, action items no longer lost after calls, unresolved issues flagged for follow-up."],
            ["Preconditions", "Governing-body approval, a BAA with every processor, member consent and recording-notice review, and a retention policy for transcripts."],
            ["Start safely", "The demo slide shows the Phase 1 version: internal staff calls and Teams meetings with no member data. It measures summary quality before Phase 2."],
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
    section: "A5 · ALM",
    title: "How changes ship safely (DEV → QA → PROD)",
    content: (
      <>
        <AHead code="A5" title="How changes ship safely: DEV → QA → PROD" />
        <Pipeline steps={alm} label="Release pipeline" />
      </>
    ),
    notes: ["This is the application lifecycle management answer: three environments, managed solutions, pipeline approvals, and rollback."],
  },
  {
    id: "a7-skills",
    section: "A6 · Team skills",
    title: "Skills needed to build and run it",
    content: (
      <>
        <AHead code="A6" title="Skills needed to build and run it" />
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
    section: "A7 · Glossary",
    title: "Glossary in plain words",
    content: (
      <>
        <AHead code="A7" title="Glossary in plain words" />
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
