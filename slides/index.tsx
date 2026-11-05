import type { SlideDef } from "./types";
import { appendix } from "./appendix";
import {
  ArchitectureDiagram, LifecycleDiagram, PhaseBoundaryDiagram, RagDiagram, ReferralDiagram,
} from "@/components/diagrams";
import Pipeline, { type PipelineStep } from "@/components/Pipeline";
import { HoursChart, RoadmapGantt, ToolSplit } from "@/components/charts/Charts";
import Blueprint from "@/components/Blueprint";

function Head({ eyebrow, q, title, lede }: { eyebrow: string; q?: string; title: string; lede?: string }) {
  return (
    <header className="d-flex flex-column gap-2">
      <div className="eyebrow"><span>{eyebrow}</span>{q && <span className="q">{q}</span>}</div>
      <h2>{title}</h2>
      {lede && <p className="lede">{lede}</p>}
    </header>
  );
}

/** One-sentence summary for non-technical readers. */
function Plain({ children }: { children: React.ReactNode }) {
  return (
    <div className="plain"><span className="label">In plain words</span><p>{children}</p></div>
  );
}

/* ------------------------------------------------------------------ pipeline data */
const followUpJourney: PipelineStep[] = [
  {
    key: "happens", title: "Something happens", hint: "A form arrives or a candidate moves",
    plain: "A hiring manager interviews a candidate, or a new referral form comes in. Today someone has to remember that a follow-up is now needed.",
    tech: "A Jotform submission or a Rippling stage change triggers a Power Automate flow. No one has to type anything.",
    tools: ["Jotform", "Rippling", "Power Automate"],
  },
  {
    key: "logged", title: "It's written down", hint: "One shared list, not a spreadsheet",
    plain: "The follow-up goes on one shared to-do list that everyone can see, instead of in someone's head or a private spreadsheet.",
    tech: "The flow creates a work item in a Dataverse table, from a template that says what this kind of item needs.",
    tools: ["Dataverse"],
  },
  {
    key: "owner", title: "Someone owns it", hint: "A named person and a due date",
    plain: "Each item gets one named person who owns the next step, and a date it should be done by.",
    tech: "Template rules assign the owner (for example, the interviewer) and set the due date from the agreed turnaround time.",
    tools: ["Dataverse business rules"],
  },
  {
    key: "remind", title: "A friendly reminder", hint: "In Teams or email, before it's late",
    plain: "As the date gets close, the owner gets a short, polite reminder where they already work.",
    tech: "A scheduled flow checks due dates. Copilot Studio drafts the reminder text; HR approves anything sent to candidates.",
    tools: ["Power Automate", "Teams", "Outlook", "Copilot Studio"], tone: "amber",
  },
  {
    key: "escalate", title: "Escalate if stuck", hint: "Manager is told, with the history",
    plain: "If it is still not done, the owner's manager is told automatically, with a short summary of what has happened so far.",
    tech: "Escalation tiers are fixed rules, not AI. AI only writes the short summary from the item's history.",
    tools: ["Power Automate", "Copilot Studio"], tone: "crit",
  },
  {
    key: "done", title: "Done and recorded", hint: "Closed with a full history",
    plain: "When the owner finishes, the item closes. Every step is kept, so anyone can see what happened and when.",
    tech: "Dataverse auditing keeps the full history of each item.",
    tools: ["Dataverse auditing"],
  },
  {
    key: "see", title: "Leaders see trends", hint: "No one builds the report by hand",
    plain: "Leaders get a weekly picture of what is stuck and where, built from the same list. Nobody has to maintain a separate dashboard.",
    tech: "A Power BI report reads the work-item tables directly, and a Copilot summary writes the weekly brief.",
    tools: ["Power BI", "Microsoft Fabric (later)"],
  },
];

const stackFlow: PipelineStep[] = [
  {
    key: "start", title: "Where data starts", hint: "Tools the team uses today",
    plain: "Nothing gets replaced. Rippling, Jotform, QuickBooks and RingCentral stay where they are.",
    tech: "Read-only connections first. Which of these have usable APIs is confirmed in discovery.",
    tools: ["Rippling", "Jotform", "RingCentral", "QuickBooks", "Slack", "Email"],
  },
  {
    key: "connect", title: "Connect", hint: "Power Automate",
    plain: "A connector moves information between the tools automatically, so nobody re-types it.",
    tech: "Standard connectors where they exist; custom connectors for Rippling and RingCentral APIs; Power Automate Desktop (RPA) only where there is no API.",
    tools: ["Power Automate", "Custom connectors", "Power Automate Desktop"],
  },
  {
    key: "track", title: "Track", hint: "Dataverse",
    plain: "One secure place holds every open follow-up: who owns it, what it's waiting on, when it's due.",
    tech: "Dataverse tables for work items, templates and events, with security roles and auditing switched on.",
    tools: ["Dataverse", "Power Apps (model-driven)"],
  },
  {
    key: "think", title: "Think (AI)", hint: "Copilot Studio",
    plain: "AI helps with writing: drafting reminders, summarizing a history, answering policy questions from approved documents.",
    tech: "Copilot Studio agents using Azure OpenAI, with knowledge from a SharePoint policy library (plus Azure AI Search if needed). There is a PHI gate in front of every call.",
    tools: ["Copilot Studio", "Azure OpenAI", "SharePoint", "Azure AI Search"], tone: "amber",
  },
  {
    key: "show", title: "Show", hint: "Teams · Power Apps · Power BI",
    plain: "People see their to-dos where they already work, and leaders get a report without asking anyone to build it.",
    tech: "The agent is published to Teams, the work queue is a Power Apps app, alerts go through Outlook, and reports are built in Power BI.",
    tools: ["Teams", "Power Apps", "Outlook", "Power BI"],
  },
  {
    key: "govern", title: "Keep it safe", hint: "Entra ID · Purview · ALM",
    plain: "Only the right people see the right things, every change is tested before it goes live, and AI can't see member data until it's approved.",
    tech: "Entra ID single sign-on with MFA, Purview data-loss-prevention policies, managed environments, and Power Platform Pipelines moving changes from DEV to QA to PROD.",
    tools: ["Entra ID", "Purview", "Managed Environments", "Power Platform Pipelines"], tone: "muted",
  },
];

const core: SlideDef[] = [
  /* 1 ------------------------------------------------------------ title */
  {
    id: "title",
    section: "Intro",
    title: "Care Ops AI Roadmap",
    content: (
      <div className="title-slide d-flex flex-column gap-4 flex-grow-1">
        <div className="eyebrow"><span>AI Solution Architecture Proposal</span><span className="q">Healthcare services organization</span></div>
        <h1>Make waiting work visible first. Add AI where it earns its place.</h1>
        <p className="thesis">
          <b>Track every follow-up</b> so nothing stalls, <b>use AI for writing work</b> (drafting, summarizing, answering from policy),
          and <b>keep member data away from AI</b> until the governing bodies approve it.
        </p>
        <div className="d-flex flex-wrap gap-2">
          <span className="chip now">Phase 1 · no PHI · starts now</span>
          <span className="chip gate">Phase 2 · member-level · after approval</span>
          <span className="sla-clock">Referral response target: 24 h</span>
        </div>
        <div className="row g-3 mt-2" style={{ maxWidth: 880 }}>
          {[
            ["18–29 h", "HR admin per week today (recruiting + ER + onboarding)"],
            ["7", "referral stages where data is re-entered"],
            ["1", "shared engine for every “what is waiting?” question"],
          ].map(([v, k]) => (
            <div className="col-12 col-sm-4" key={k}>
              <div className="stat"><span className="v">{v}</span><span className="k">{k}</span></div>
            </div>
          ))}
        </div>
        <p className="text-body-secondary mb-0" style={{ fontSize: ".85em" }}>Built on Microsoft 365 and Power Platform: Copilot Studio, Power Automate, Dataverse, Power Apps, Power BI, Teams, SharePoint.</p>
      </div>
    ),
    notes: [
      "Open with the thesis: most of the problems are work that waits without an owner. Buying an AI product won't fix that.",
      "The 18–29 hours is the sum of the HR estimates in the brief: 10–15 recruiting, 5–8 employee relations, 3–6 onboarding.",
      "Phase 1 avoids PHI entirely, which is why it can start now.",
    ],
  },

  /* 2 ------------------------------------------------------------ plan in one picture */
  {
    id: "one-picture",
    section: "Overview",
    title: "The plan in one picture",
    content: (
      <>
        <Head eyebrow="The plan in one picture" title="How a follow-up will move, from start to finish"
          lede="Click any step, or press Play, to follow one item through. Each step shows what changes for staff, and the tool that does it." />
        <Pipeline steps={followUpJourney} label="Follow-up journey" />
        <Plain>Every follow-up follows the same seven steps. Only two of them (writing the reminder and the summary) use AI. The rest are simple rules that always behave the same way.</Plain>
      </>
    ),
    notes: [
      "Use this slide with non-technical stakeholders before any architecture. Press Play and narrate the steps.",
      "The same journey applies to interview feedback, missing consents, referral documents and ER action items. Only the template changes.",
    ],
  },

  /* 3 ------------------------------------------------------------ problems */
  {
    id: "problems",
    section: "Q1 · Problems",
    title: "The four problems worth solving first",
    content: (
      <>
        <Head eyebrow="Problem assessment" q="Q1" title="The four problems worth solving first"
          lede="They recur across departments, cost hours or response time we can measure, and share one root cause: nobody can see who owns the next step." />
        <div className="row g-3">
          <div className="col-12 col-xl-6"><HoursChart /></div>
          <div className="col-12 col-xl-6">
            <div className="row g-2">
              {[
                ["1 · Stalled follow-ups", "Feedback, replies, consents and documents tracked in heads and spreadsheets.", "Cross-department"],
                ["2 · Referral response", "No clock behind the 24-hour target; not-yet-eligible prospects get lost.", "Revenue + mission"],
                ["3 · HR admin load", "18–29 hours a week chasing people and moving candidates.", "Hours we can measure"],
                ["4 · Scattered policy", "Questions the policies already answer, answered differently by each supervisor.", "Consistency + risk"],
              ].map(([t, d, tag]) => (
                <div className="col-12 col-sm-6" key={t}>
                  <div className="panel h-100 d-flex flex-column gap-1">
                    <span className="label">{tag}</span>
                    <h3 className="mb-0">{t}</h3>
                    <p style={{ fontSize: ".9em" }}>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="panel is-signal">
          <h3>Where AI is the wrong tool</h3>
          <div className="row g-2" style={{ fontSize: ".92em" }}>
            {[
              ["Re-entering the same data in several forms", "One intake record plus connectors"],
              ["Deadlines, aging, escalation", "Fixed rules and timers"],
              ["Recurring report assembly", "Power BI over the shared data"],
              ["Status of a referral or candidate", "A field in the record, not an AI guess"],
            ].map(([p, f]) => (
              <div className="col-12 col-md-6" key={p}>
                <span className="fw-semibold">{p}</span> <span className="text-body-secondary">→ {f}</span>
              </div>
            ))}
          </div>
        </div>
        <Plain>The biggest problem isn&rsquo;t a lack of AI. It&rsquo;s that work waits without anyone owning it. Fix that first.</Plain>
      </>
    ),
    notes: [
      "The chart is HR's own estimate. Hover a bar to see what each type of work includes.",
      "Executive support isn't a separate problem. It comes almost for free from the shared data (appendix A4).",
      "Call intelligence and risk signals need member data, so they belong in Phase 2.",
    ],
  },

  /* 4 ------------------------------------------------------------ pilot */
  {
    id: "pilot",
    section: "Q2 · Pilot",
    title: "Pilot: HR follow-up on a shared work queue",
    content: (
      <>
        <Head eyebrow="Initial pilot" q="Q2" title="Pilot: HR follow-up on a shared work queue"
          lede="The first workflow on the reusable engine. No member data, tools that likely connect today, and hours we can count before and after." />
        <div className="row g-3">
          <div className="col-12 col-lg-8">
            <div className="row g-2">
              {[
                ["Problem", "Recruiting and onboarding stall while HR chases feedback, references, checks and acknowledgements."],
                ["Users", "HR/recruiting staff, hiring managers, supervisors; HR lead as admin."],
                ["Trigger", "Rippling stage change, Jotform submission, or a timer on an open item."],
                ["Workflow", "Event → work item with owner + due date → reminder in Teams/email → escalate when late → close."],
                ["Inputs", "Candidate stage, interviewer list, onboarding checklist, due dates. Staff data only."],
                ["Outputs", "Personal reminders, HR work queue (Power Apps), weekly Power BI aging report, drafted messages."],
                ["Systems", "Rippling, Jotform, Teams, Outlook, Power Automate, Dataverse, Copilot Studio (drafting only)."],
                ["Human review", "HR approves AI-drafted messages to candidates; managers make the decisions; HR can snooze or reassign."],
                ["Exceptions", "No API → CSV import; unknown owner → HR triage queue; failed send → retry + alert."],
              ].map(([k, v]) => (
                <div className="col-12 col-md-6 col-xl-4" key={k}>
                  <div className="panel h-100"><span className="label">{k}</span><p className="mt-1" style={{ fontSize: ".9em" }}>{v}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-12 col-lg-4 d-flex flex-column gap-2">
            <div className="panel is-pine">
              <span className="label">Expected benefit</span>
              <p className="mt-1">Fewer manual chases, faster hiring, nothing silently stuck. It also proves the engine we reuse for referrals.</p>
            </div>
            <div className="panel">
              <span className="label">Success measures · baseline in discovery</span>
              <ul className="mt-1" style={{ fontSize: ".9em" }}>
                <li>HR hours/week on recruiting admin (target: −30%, to be validated)</li>
                <li>Median days to interviewer feedback</li>
                <li>Items past due, by owner</li>
                <li>Time from offer to day-one ready</li>
                <li>Share of AI drafts sent without edits</li>
              </ul>
            </div>
          </div>
        </div>
        <Plain>Start with HR because it has real pain, no patient data, and results we can count within weeks.</Plain>
      </>
    ),
    notes: [
      "Why HR first, not referrals: referrals carry member data, so a referral pilot would hit the PHI approval wall.",
      "The −30% is a hypothesis to test against a two-week time-study baseline, not a promise.",
      "AI is a small part of the pilot. The value comes from the work items and timers.",
    ],
  },

  /* 5 ------------------------------------------------------------ tech stack pipeline */
  {
    id: "stack",
    section: "Tech stack",
    title: "The tech stack, left to right",
    content: (
      <>
        <Head eyebrow="Recommended tech stack" title="Built on Microsoft tools, connected left to right"
          lede="Power Platform and Copilot Studio cover integration, tracking, AI and reporting under one licence family, one sign-in and one set of security controls." />
        <Pipeline steps={stackFlow} label="Technology pipeline" />
        <div className="row g-2" style={{ fontSize: ".88em" }}>
          <div className="col-12 col-lg-6"><Plain>Data moves left to right: it starts in today&rsquo;s tools, gets connected, tracked in one place, gets AI help only where useful, and shows up where people already work.</Plain></div>
          <div className="col-12 col-lg-6">
            <div className="panel h-100">
              <span className="label">Confirm in discovery</span>
              <p className="mt-1">Which Microsoft 365 and Power Platform licences exist today, whether staff are on Teams or Slack, and which Microsoft services are covered by the organization&rsquo;s HIPAA BAA with Microsoft.</p>
            </div>
          </div>
        </div>
      </>
    ),
    notes: [
      "Why Microsoft: one identity (Entra ID), one security model, low-code tools the team can maintain, and Microsoft signs a HIPAA BAA for many of these services. Confirm scope service by service.",
      "If the organization stays on Slack, Power Automate can still post reminders there. Teams is the better home for the Copilot Studio agent.",
      "The architecture stays portable: the same layers would work with other tools if licensing rules Microsoft out.",
    ],
  },

  /* 6 ------------------------------------------------------------ architecture */
  {
    id: "architecture",
    section: "Q3 · Architecture",
    title: "Solution architecture",
    content: (
      <>
        <Head eyebrow="Solution architecture" q="Q3" title="One connection layer, one shared record, AI behind a gate" />
        <ArchitectureDiagram />
        <div className="row g-2" style={{ fontSize: ".88em" }}>
          {[
            ["Structured data", "Work items, events, owners, due dates in Dataverse tables."],
            ["Unstructured", "Policies and SOPs in a SharePoint library, indexed for the agent."],
            ["Identity", "Entra ID single sign-on with MFA; security roles from job role."],
            ["Notifications", "Teams first, Outlook fallback, one daily digest instead of a flood."],
          ].map(([k, v]) => (
            <div className="col-12 col-md-6 col-xl-3" key={k}><span className="label">{k}</span><div>{v}</div></div>
          ))}
        </div>
        <Plain>Information flows one way: from today&rsquo;s tools, into one shared record, and out to people in Teams and Power BI. AI never reaches into the source systems directly.</Plain>
      </>
    ),
    notes: [
      "Walk left to right: where data starts → connect → track → think → where people see it.",
      "Dashed boxes are integrations we haven't confirmed yet: RingCentral API access and the healthcare-specific systems.",
    ],
  },

  /* 7 ------------------------------------------------------------ AI vs automation */
  {
    id: "ai-vs-automation",
    section: "Q4 · AI vs automation",
    title: "Which tool for which job",
    content: (
      <>
        <Head eyebrow="AI vs automation" q="Q4" title="Which tool for which job"
          lede="Default to the simplest dependable option. AI is used only where the input or output is everyday language." />
        <ToolSplit />
        <div className="table-wrap">
          <table className="table matrix align-middle mb-0">
            <thead>
              <tr>
                <th style={{ minWidth: 190 }}>Component</th>
                {["Workflow", "Rules", "API", "RPA", "GenAI", "ML", "RAG", "Agentic", "Human"].map((h) => <th key={h} className="text-center">{h}</th>)}
                <th style={{ minWidth: 240 }}>Why · Microsoft tool</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Work items, due dates, escalation", "●●●○○○○○○", "Must be predictable and auditable · Power Automate + Dataverse"],
                ["Sync from Rippling / Jotform", "○○●○○○○○○", "Connectors beat re-typing · Power Automate connectors"],
                ["Systems without APIs", "○○○●○○○○○", "Last resort · Power Automate Desktop"],
                ["Reminder & nudge text", "○○○○●○○○●", "Language task; human approves · Copilot Studio"],
                ["Policy & SOP answers", "○○○○○○●○○", "Grounded in approved text · Copilot Studio + SharePoint"],
                ["ER documentation drafts", "○○○○●○○○●", "AI drafts, people decide · Copilot Studio"],
                ["Recurring reports", "●○●○○○○○○", "Data + template · Power BI"],
                ["Member risk signals (Ph. 2)", "○●○○○●○○●", "Rules first, ML later · Fabric"],
                ["Multi-step autonomous actions", "○○○○○○○●●", "Not in Phase 1"],
                ["Hiring, discipline, eligibility", "○○○○○○○○●", "People decide. Always."],
              ].map(([c, m, w]) => (
                <tr key={c}>
                  <td className="fw-semibold">{c}</td>
                  {m.split("").map((d, i) => <td key={i} className={`dot ${i === 8 ? "h" : ""}`}>{d === "●" ? "●" : ""}</td>)}
                  <td className="text-body-secondary">{w}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Plain>Most of the work is plain automation that always does the same thing. AI only helps with writing, and a person checks it.</Plain>
      </>
    ),
    notes: [
      "This answers 'do you know when not to use AI'. Three of ten components use generative AI, and each has a human checkpoint.",
      "Agentic AI is deferred until there are months of audit history and stable workflows.",
    ],
  },

  /* ------------------------------------------------------------ execution blueprint */
  {
    id: "blueprint",
    section: "Execution blueprint",
    title: "Agent, workflow, or both",
    content: (
      <>
        <Head eyebrow="Execution blueprint" title="For each use case: agent, workflow, or both"
          lede="Workflow when the steps are fixed. AI agent when the work is language. Both when a fixed process needs some writing done. Filter to compare." />
        <Blueprint />
        <Plain>Six of twelve use cases are plain workflows, and only one is agent-only. Agents only draft, summarize or answer. They never make a decision or act without a flow and a person behind them.</Plain>
      </>
    ),
    notes: [
      "Agents in Phase 1: HR Assistant (reminders, ER drafts), Policy Assistant, Chief-of-staff brief, Regulatory watch. All are Copilot Studio agents in Teams.",
      "Agent actions (snooze, reassign, create task) always call a Power Automate flow, so every action is logged and checked against the user's role.",
      "Filter by Phase 2 to show what waits for approval.",
    ],
  },

  /* 8 ------------------------------------------------------------ orchestration */
  {
    id: "orchestration",
    section: "Q5 · Orchestration",
    title: "One engine for “what is waiting?”",
    content: (
      <>
        <Head eyebrow="Follow-up & work orchestration" q="Q5" title="One reusable engine, not one tracker per department"
          lede="Every workflow has the same shape: something is missing, someone owns the next step, a clock is running. Build that once, then set it up per workflow." />
        <LifecycleDiagram />
        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <div className="panel h-100">
              <h3>What the engine identifies</h3>
              <ul style={{ fontSize: ".92em" }}>
                <li><b>Missing information:</b> checklist items not yet complete</li>
                <li><b>Owner:</b> a named person, never a team inbox; unknown → triage queue</li>
                <li><b>Due date & aging:</b> agreed turnaround per item type, in business hours</li>
                <li><b>Exceptions:</b> reopened, reassigned 3+ times, or waiting on an outside party</li>
                <li><b>Escalation:</b> owner → manager → department lead, by rule</li>
              </ul>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="panel is-pine h-100">
              <h3>Why reusable</h3>
              <p style={{ fontSize: ".92em" }}>A new workflow (enrollment documents, ER action items, report sign-offs) is a <b>template row in Dataverse</b>: item types, checklist, due dates, escalation path. There is no new app and no new dashboard. Leadership sees one view of stuck work across the organization.</p>
            </div>
          </div>
        </div>
        <Plain>Build one &ldquo;what&rsquo;s waiting, and on whom&rdquo; engine once, and reuse it for HR, referrals and everything else.</Plain>
      </>
    ),
    notes: [
      "This is the core of the proposal. HR is the first template and referrals are the second.",
      "Pausing the clock requires a logged reason, so 'waiting on vendor' can't become a hiding place.",
    ],
  },

  /* 9 ------------------------------------------------------------ security */
  {
    id: "security",
    section: "Q6 · Security",
    title: "Security, privacy & governance",
    content: (
      <>
        <Head eyebrow="Security, privacy & governance" q="Q6" title="Two zones, one gate, closed by default" />
        <PhaseBoundaryDiagram />
        <div className="row g-2" style={{ fontSize: ".86em" }}>
          {[
            ["PHI / HIPAA", "Phase 1 handles no PHI. Phase 2 runs in a separate Power Platform environment, only on services covered by the Microsoft BAA, and only after the governing bodies approve."],
            ["Access", "Entra ID SSO + MFA, Dataverse security roles, least privilege, quarterly access review."],
            ["Encryption", "TLS in transit, encryption at rest by default; customer-managed keys for the Phase 2 environment."],
            ["Audit & logging", "Dataverse auditing, Purview audit log, Copilot Studio conversation transcripts with a set retention period."],
            ["Model data use", "Azure OpenAI through Copilot Studio: prompts are not used to train models. Consumer AI tools are blocked by policy."],
            ["Leakage & hallucination", "Purview DLP policies, a field allowlist before any AI call, answers must cite sources, a person approves outbound text."],
          ].map(([k, v]) => (
            <div className="col-12 col-md-6 col-xl-4" key={k}>
              <div className="panel h-100"><span className="label">{k}</span><p className="mt-1">{v}</p></div>
            </div>
          ))}
        </div>
        <Plain>Patient information lives in a separate, locked area. AI is switched off for it until the governing bodies say yes in writing.</Plain>
      </>
    ),
    notes: [
      "The separation is architectural: a separate environment with its own data and its own DLP policy, and no route from it to the AI services in Phase 1.",
      "Confirm with Microsoft which exact services (Copilot Studio, Azure OpenAI, Dataverse) are in scope of the organization's BAA before Phase 2.",
    ],
  },

  /* ------------------------------------------------------------ roles & permissions */
  {
    id: "roles",
    section: "Roles & access",
    title: "Roles & access permissions",
    content: (
      <>
        <Head eyebrow="Access permission roles" title="Who can see and do what"
          lede="Each role is an Entra ID group mapped to a Dataverse security role and SharePoint permissions. People get the least access their job needs, reviewed every quarter." />
        <div className="table-wrap">
          <table className="table matrix roles align-middle mb-0">
            <thead>
              <tr>
                <th style={{ minWidth: 170 }}>Role</th>
                {["Work items", "Approve AI drafts", "Templates & due dates", "ER records", "Policy library", "Power BI", "Member data (Ph. 2)", "Environments"].map((h) => <th key={h} className="text-center">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {([
                ["Employee", "own", "—", "—", "—", "read", "—", "—", "—"],
                ["Hiring manager / supervisor", "own + team", "—", "—", "submit", "read", "team", "—", "—"],
                ["HR staff", "all HR", "yes", "—", "—", "read", "HR", "—", "—"],
                ["HR lead / ER specialist", "all HR", "yes", "edit", "full", "read", "HR", "—", "—"],
                ["Intake coordinator", "own referrals", "—", "—", "—", "read", "program", "after approval", "—"],
                ["Program lead", "all program", "yes", "edit", "—", "read", "program", "after approval", "—"],
                ["Policy owner / compliance", "own", "—", "—", "—", "edit / approve", "—", "—", "—"],
                ["Executive / CEO", "counts", "—", "—", "—", "read", "all (no member detail)", "—", "—"],
                ["Maker / developer", "DEV only", "—", "DEV only", "—", "—", "DEV only", "—", "DEV"],
                ["Power Platform admin", "—", "—", "—", "—", "—", "—", "—", "DEV · QA · PROD"],
              ] as string[][]).map(([role, ...cells]) => (
                <tr key={role}>
                  <td className="fw-semibold">{role}</td>
                  {cells.map((c, i) => {
                    const cls = c === "—" ? "lvl-none" : c.startsWith("after") ? "lvl-gate" : /full|all|edit|yes|DEV ·/.test(c) ? "lvl-full" : c.startsWith("read") || c === "counts" ? "lvl-read" : "lvl-own";
                    return <td key={i} className={`cell ${cls}`}>{c}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="row g-2" style={{ fontSize: ".86em" }}>
          <div className="col-12 col-lg-4"><div className="panel h-100"><span className="label">Agents use the asker&rsquo;s access</span><p className="mt-1">A Copilot Studio agent answers with the signed-in user&rsquo;s permissions, so it can never show something that person couldn&rsquo;t open themselves.</p></div></div>
          <div className="col-12 col-lg-4"><div className="panel h-100"><span className="label">Makers never touch production</span><p className="mt-1">Developers build in DEV. Changes reach QA and PROD only through Power Platform Pipelines, with an approval step.</p></div></div>
          <div className="col-12 col-lg-4"><div className="panel is-signal h-100"><span className="label">Member data is separate</span><p className="mt-1">The Phase 2 environment has its own security group. Nobody gets access until approval, and access is logged and reviewed.</p></div></div>
        </div>
        <Plain>Everyone sees only what their job needs. The AI follows the same rules as the person asking.</Plain>
      </>
    ),
    notes: [
      "Implementation: Entra ID security groups → Dataverse business units and security roles → SharePoint groups → Power BI row-level security. One group membership drives all four.",
      "ER records live in a separate restricted Dataverse table. Even HR staff outside ER can't read them.",
    ],
  },

  /* 10 ------------------------------------------------------------ knowledge assistant */
  {
    id: "knowledge",
    section: "Q7 · Knowledge assistant",
    title: "Policy & SOP knowledge assistant",
    content: (
      <>
        <Head eyebrow="Policy & SOP knowledge assistant" q="Q7" title="Answers only from approved, current policy, with citations" />
        <RagDiagram />
        <div className="row g-3" style={{ fontSize: ".9em" }}>
          <div className="col-12 col-lg-4">
            <div className="panel h-100">
              <h3>Source authority</h3>
              <p>Ranking: regulation &gt; board policy &gt; department SOP &gt; training. Only documents in the approved SharePoint library, with an owner and approval date, are used. Drafts never are.</p>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="panel h-100">
              <h3>Versions, conflicts, expiry</h3>
              <p>SharePoint versioning keeps history; only the current approved version is indexed. Expired documents are archived and never used. If two current sources conflict, the assistant shows both and flags the owner.</p>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="panel is-signal h-100">
              <h3>When it can’t find an answer</h3>
              <p>It says so, links the closest related section, and creates a work item for the policy owner. The gap is logged for the next policy update.</p>
            </div>
          </div>
        </div>
        <Plain>Staff ask a question in Teams and get an answer quoted from the real policy, with a link to it. If the policy doesn&rsquo;t say, the assistant says so and doesn&rsquo;t guess.</Plain>
      </>
    ),
    notes: [
      "Built as a Copilot Studio agent in Teams, with the SharePoint library as its knowledge source and generative answers restricted to that source.",
      "Permissions follow SharePoint: a supervisor-only SOP is never used to answer a frontline question.",
    ],
  },

  /* 11 ------------------------------------------------------------ referral + accessibility */
  {
    id: "referral",
    section: "Q8–Q9 · Referral & access",
    title: "Referral workflow & accessibility",
    content: (
      <>
        <Head eyebrow="Future-state referral workflow · accessibility" q="Q8 · Q9" title="Referrals on the same engine, reachable without a smartphone" />
        <ReferralDiagram />
        <div className="row g-3" style={{ fontSize: ".9em" }}>
          <div className="col-12 col-lg-7">
            <div className="panel h-100">
              <h3>Designing for members without digital access</h3>
              <div className="row g-2">
                {[
                  ["Smartphone", "SMS link or text reply"],
                  ["Basic phone", "Text reply keywords (1 / 2 / HELP) or an automated voice call"],
                  ["Intermittent", "Retry windows, and the clock pauses with a logged reason"],
                  ["No digital", "Care manager call task, mail, or in-person visit"],
                ].map(([k, v]) => (
                  <div className="col-12 col-sm-6" key={k}><span className="label">{k}</span><div>{v}</div></div>
                ))}
              </div>
              <p className="mt-2 mb-0 text-body-secondary">Each member record stores a preferred channel and a fallback. A missed digital response always becomes a human task. Silence never counts as disengagement.</p>
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="panel is-pine h-100">
              <h3>Start now vs. needs approval</h3>
              <p className="mb-1"><span className="chip now">now</span> single intake form, 24-hour clock, checklists, reminders to staff, escalation, management counts.</p>
              <p className="mb-0"><span className="chip gate">after approval</span> AI extraction from referral documents, drafted outreach, note summaries, SMS check-ins.</p>
            </div>
          </div>
        </div>
        <Plain>Referrals get the same &ldquo;owner and due date&rdquo; treatment now. AI helps later, after approval. Members without phones are always reached by a person.</Plain>
      </>
    ),
    notes: [
      "Most of the referral workflow can be built now, because rules and workflow aren't AI. Confirm that Power Platform itself is acceptable for PHI under the BAA.",
      "The 'prospect' queue replaces the side spreadsheets: not-yet-eligible referrals get a re-check date and an owner.",
    ],
  },

  /* 12 ------------------------------------------------------------ roadmap */
  {
    id: "roadmap",
    section: "Q10 · Roadmap",
    title: "Phased roadmap",
    content: (
      <>
        <Head eyebrow="Implementation approach" q="Q10" title="Five stages, each with a test before moving on" />
        <RoadmapGantt />
        <div className="gate-list">
          {[
            ["Discovery", "Process maps, time-study baseline, licence & API check, approval criteria.", "Baseline measured; pilot scope signed off."],
            ["Prototype", "Dataverse tables + HR template in a DEV environment; Teams reminders.", "HR confirms it matches real work."],
            ["Pilot", "One HR team live from the QA→PROD pipeline; weekly metrics.", "Hours down vs baseline; adoption holding."],
            ["Production", "All HR; monitoring, runbooks, access review, support owner.", "Security review passed; alerting live."],
            ["Expansion", "Referral template, knowledge assistant, CEO brief; Phase 2 once approved.", "New templates reuse the engine."],
          ].map(([t, b, e]) => (
            <div className="gate" key={t}>
              <h3>{t}</h3>
              <p className="mb-0" style={{ fontSize: ".84em" }}>{b}</p>
              <div className="exit"><b>Move on when</b>{e}</div>
            </div>
          ))}
        </div>
        <div className="panel is-pine">
          <h3>Asks for this meeting</h3>
          <ol className="mb-0" style={{ fontSize: ".9em", paddingLeft: "1.1rem" }}>
            <li>Agree on HR follow-up as the pilot</li>
            <li>Name an HR lead and an executive sponsor</li>
            <li>Start the approval conversation with the governing bodies now, in parallel</li>
          </ol>
        </div>
      </>
    ),
    notes: [
      "Durations are estimates to re-plan after discovery. Hover the bars for each stage's test.",
      "The approval track starts in week one so it isn't on the critical path later.",
      "Discovery questions are in appendix A1.",
    ],
  },
];

export const slides: SlideDef[] = [...core, ...appendix];
