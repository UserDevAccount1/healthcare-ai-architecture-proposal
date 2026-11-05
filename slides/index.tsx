import type { SlideDef } from "./types";
import { appendix } from "./appendix";
import {
  ArchitectureDiagram, LifecycleDiagram, PhaseBoundaryDiagram, RagDiagram, ReferralDiagram,
} from "@/components/diagrams";

function Head({ eyebrow, q, title, lede }: { eyebrow: string; q?: string; title: string; lede?: string }) {
  return (
    <header className="d-flex flex-column gap-2">
      <div className="eyebrow"><span>{eyebrow}</span>{q && <span className="q">{q}</span>}</div>
      <h2>{title}</h2>
      {lede && <p className="lede">{lede}</p>}
    </header>
  );
}

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
          <b>Orchestrate the follow-ups</b> that stall today, <b>use AI for language work</b> (drafting, summarizing, grounded answers),
          and <b>keep member-level data out of AI</b> until the governing bodies approve it.
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
      </div>
    ),
    notes: [
      "Open with the thesis: the problems are mostly about work that waits without an owner, not about a missing AI product.",
      "The 18–29 hours is the sum of the HR estimates in the brief: 10–15 recruiting, 5–8 employee relations, 3–6 onboarding.",
      "Set expectations: Phase 1 avoids PHI entirely, which is why it can start now.",
    ],
  },

  /* 2 ------------------------------------------------------------ problem assessment */
  {
    id: "problems",
    section: "Q1 · Problems",
    title: "The four problems worth solving first",
    content: (
      <>
        <Head eyebrow="Problem assessment" q="Q1" title="The four problems worth solving first"
          lede="Picked because they recur across departments, cost measurable hours or response time, and share one root cause: no shared record of who owns the next step." />
        <div className="row g-3">
          {[
            ["1 · Stalled follow-ups", "Interview feedback, candidate replies, missing consents and referral documents are tracked in heads and spreadsheets. Nobody can see what is waiting, on whom, or for how long.", "Cross-department"],
            ["2 · Referral response & leakage", "The 24-hour target has no clock behind it. Not-yet-eligible prospects sit in side spreadsheets with no re-check date.", "Revenue + mission"],
            ["3 · HR administrative load", "18–29 hours a week spent chasing people, moving candidates between stages and drafting ER documentation.", "Hours we can measure"],
            ["4 · Scattered policy knowledge", "Staff ask colleagues questions the policies already answer. Answers vary by supervisor.", "Consistency + risk"],
          ].map(([t, d, tag]) => (
            <div className="col-12 col-md-6 col-xl-3" key={t}>
              <div className="panel h-100 d-flex flex-column gap-2">
                <span className="label">{tag}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="panel is-signal">
          <h3>Where AI is the wrong tool</h3>
          <div className="row g-2">
            {[
              ["Re-entering the same data in several forms", "One intake record plus integration"],
              ["Deadlines, aging, escalation", "Deterministic rules and timers"],
              ["Recurring report assembly", "Scheduled data pulls and templates"],
              ["Status of a referral or candidate", "Workflow state, not a model's guess"],
            ].map(([p, f]) => (
              <div className="col-12 col-md-6" key={p}>
                <span className="fw-semibold">{p}</span> <span className="text-body-secondary">→ {f}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    ),
    notes: [
      "Executive support (the chief-of-staff idea) is deliberately not a separate problem. It becomes a by-product of the orchestration data (see appendix A4).",
      "Call intelligence and risk signals are valuable, but they need member-level data, so they belong in Phase 2.",
      "Emphasize the amber box: most of the pain is solved without generative AI.",
    ],
  },

  /* 3 ------------------------------------------------------------ pilot */
  {
    id: "pilot",
    section: "Q2 · Pilot",
    title: "Pilot: HR follow-up on a shared work queue",
    content: (
      <>
        <Head eyebrow="Initial pilot" q="Q2" title="Pilot: HR follow-up on a shared work queue"
          lede="The first workflow on the reusable orchestration engine. No member data, APIs that are likely to exist (Rippling, Jotform, Slack), and hours we can count before and after." />
        <div className="row g-3">
          <div className="col-12 col-lg-8">
            <div className="row g-2">
              {[
                ["Problem", "Recruiting and onboarding stall while HR chases feedback, references, checks and acknowledgements."],
                ["Users", "HR/recruiting staff, hiring managers, supervisors; HR lead as admin."],
                ["Trigger", "Rippling stage change, Jotform submission, or a timer firing on an open item."],
                ["Workflow", "Event → create work item with owner + due date → nudge in Slack/email → escalate on SLA → close on completion."],
                ["Inputs", "Candidate stage, interviewer list, onboarding checklist, due dates. Staff data only."],
                ["Outputs", "Owner-specific nudges, HR work queue, weekly aging report, drafted reminder text."],
                ["Systems", "Rippling, Jotform, Slack, email, orchestration core, LLM gateway (drafting only)."],
                ["Human review", "HR approves AI-drafted messages to candidates; managers own the decisions; HR can snooze or reassign."],
                ["Exceptions", "No API data → CSV import; unknown owner → HR triage queue; failed send → retry + alert."],
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
              <p className="mt-1">Fewer manual chases, faster time-to-hire, nothing silently stuck. It also proves the engine we reuse for referrals.</p>
            </div>
            <div className="panel">
              <span className="label">Success measures · baseline in discovery</span>
              <ul className="mt-1" style={{ fontSize: ".9em" }}>
                <li>HR hours/week on recruiting admin (target: −30%, to be validated)</li>
                <li>Median days to interviewer feedback</li>
                <li>Items past SLA, by owner</li>
                <li>Time from offer to day-one ready</li>
                <li>Share of AI drafts sent without edits</li>
              </ul>
            </div>
          </div>
        </div>
      </>
    ),
    notes: [
      "Why HR first, not referrals: referrals carry member data, so a referral pilot would hit the PHI approval wall. HR has real pain and measurable hours.",
      "The −30% is a hypothesis to test against a two-week time-study baseline, not a promise.",
      "AI is a small part of the pilot: it only drafts reminder text. The value comes from the work items and timers.",
    ],
  },

  /* 4 ------------------------------------------------------------ architecture */
  {
    id: "architecture",
    section: "Q3 · Architecture",
    title: "Solution architecture",
    content: (
      <>
        <Head eyebrow="Solution architecture" q="Q3" title="One integration layer, one orchestration core, AI behind a gate" />
        <ArchitectureDiagram />
        <div className="row g-2" style={{ fontSize: ".88em" }}>
          {[
            ["Structured data", "Work items, events, owners, SLAs in a relational store (Postgres)."],
            ["Unstructured", "Policies and SOPs in the existing document repository, indexed for RAG."],
            ["Identity", "SSO with the existing identity provider; roles from Rippling job data."],
            ["Notifications", "Slack first, email fallback, daily digest instead of message floods."],
          ].map(([k, v]) => (
            <div className="col-12 col-md-6 col-xl-3" key={k}><span className="label">{k}</span><div>{v}</div></div>
          ))}
        </div>
      </>
    ),
    notes: [
      "Walk left to right: sources → integration → core → AI → where people already work (Slack, email).",
      "The cloud provider is not chosen yet. The design only needs a managed database, a workflow runner and an LLM provider that will sign a BAA. Pick these in discovery based on what the organization already licenses.",
      "Dashed boxes mark integrations we have not confirmed: RingCentral API access and the healthcare-specific systems.",
    ],
  },

  /* 5 ------------------------------------------------------------ AI vs automation */
  {
    id: "ai-vs-automation",
    section: "Q4 · AI vs automation",
    title: "Which tool for which job",
    content: (
      <>
        <Head eyebrow="AI vs automation" q="Q4" title="Which tool for which job"
          lede="Default to the cheapest deterministic option. AI is used only where the input or output is unstructured language." />
        <div className="table-wrap">
          <table className="table matrix align-middle mb-0">
            <thead>
              <tr>
                <th style={{ minWidth: 190 }}>Component</th>
                {["Workflow", "Rules", "API", "RPA", "GenAI", "ML", "RAG", "Agentic", "Human"].map((h) => <th key={h} className="text-center">{h}</th>)}
                <th style={{ minWidth: 240 }}>Why</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Work items, SLAs, escalation", "●●●○○○○○○", "Must be predictable and auditable."],
                ["Sync from Rippling / Jotform", "○○●○○○○○○", "APIs exist; integration beats re-typing."],
                ["Systems without APIs", "○○○●○○○○○", "Last resort, after confirming no export or API."],
                ["Reminder & nudge text", "○○○○●○○○●", "Language task; human approves external messages."],
                ["Policy & SOP answers", "○○○○○○●○○", "Must be grounded in approved text, with citations."],
                ["ER documentation drafts", "○○○○●○○○●", "AI drafts, supervisor and HR decide."],
                ["Recurring reports", "●○●○○○○○○", "Data pull + template; AI only for narrative summary."],
                ["Member risk signals (Ph. 2)", "○●○○○●○○●", "Start with rules; ML only once there is labeled history."],
                ["Multi-step autonomous actions", "○○○○○○○●●", "Not in Phase 1. Revisit with audit history."],
                ["Hiring, discipline, eligibility", "○○○○○○○○●", "People decide. AI never makes these calls."],
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
      </>
    ),
    notes: [
      "This slide answers 'do you know when not to use AI'. Out of ten components, only three use generative AI, and each one has a human checkpoint.",
      "Agentic AI is explicitly deferred: we want months of audit logs and stable workflows before letting software take multi-step actions.",
    ],
  },

  /* 6 ------------------------------------------------------------ orchestration */
  {
    id: "orchestration",
    section: "Q5 · Orchestration",
    title: "One engine for “what is waiting?”",
    content: (
      <>
        <Head eyebrow="Follow-up & work orchestration" q="Q5" title="One reusable engine, not one tracker per department"
          lede="Every workflow is the same shape: something is missing, someone owns the next step, a clock is running. Build that once, then configure it per workflow." />
        <LifecycleDiagram />
        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <div className="panel h-100">
              <h3>What the engine identifies</h3>
              <ul style={{ fontSize: ".92em" }}>
                <li><b>Missing information:</b> checklist items per template that are not yet complete</li>
                <li><b>Owner:</b> a named person, never a team inbox; unknown → triage queue</li>
                <li><b>Due date & aging:</b> SLA per item type, business-hours clock</li>
                <li><b>Exceptions:</b> reopened, reassigned 3+ times, or waiting on an external party</li>
                <li><b>Escalation:</b> tiered (owner → manager → department lead), set by rules</li>
              </ul>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="panel is-pine h-100">
              <h3>Why reusable</h3>
              <p style={{ fontSize: ".92em" }}>A new workflow (enrollment documents, ER action items, report sign-offs) is a <b>template</b>: item types, checklist, SLAs, escalation path. There is no new code and no new dashboard. Leadership sees one view of stuck work across the whole organization.</p>
            </div>
          </div>
        </div>
      </>
    ),
    notes: [
      "This is the core of the proposal. HR is the first template and referrals are the second.",
      "Pausing the clock requires a logged reason, so 'waiting on vendor' cannot become a hiding place.",
      "The data model is in appendix A2.",
    ],
  },

  /* 7 ------------------------------------------------------------ security */
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
            ["PHI / HIPAA", "Phase 1 handles no PHI. Phase 2 runs only on HIPAA-eligible services with signed BAAs and approval from the governing bodies."],
            ["Access", "SSO + MFA, role-based access from job role, least privilege, quarterly access review."],
            ["Encryption", "TLS in transit, AES-256 at rest, keys managed by the cloud KMS, member store separately keyed."],
            ["Audit & logging", "Append-only event log; prompts and responses logged with redaction; retention set by policy."],
            ["Model data use", "Enterprise API terms: no training on our data, zero retention. Consumer AI tools blocked."],
            ["Leakage & hallucination", "Field allowlist before any AI call, PHI classifier as a second check, citations required, human approval on outbound text."],
          ].map(([k, v]) => (
            <div className="col-12 col-md-6 col-xl-4" key={k}>
              <div className="panel h-100"><span className="label">{k}</span><p className="mt-1">{v}</p></div>
            </div>
          ))}
        </div>
      </>
    ),
    notes: [
      "The separation is architectural, not just a policy: member data lives in its own store, and the route from that store to the AI gateway does not exist in Phase 1 configuration.",
      "The allowlist is the primary control and the classifier is a backstop. We allow known-safe fields instead of trying to detect every kind of PHI.",
      "Third-party providers: a provider qualifies for Phase 2 only with a BAA, zero retention, a US data region, and SOC 2 Type II.",
    ],
  },

  /* 8 ------------------------------------------------------------ knowledge assistant */
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
              <p>Ranking: regulation &gt; board policy &gt; department SOP &gt; training material. Only documents with an owner and approval date are indexed. Drafts are never indexed.</p>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="panel h-100">
              <h3>Versions, conflicts, expiry</h3>
              <p>A new version supersedes the old one in the index. Expired documents stay archived but are never retrieved. If two current sources conflict, the assistant shows both and flags the owner.</p>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="panel is-signal h-100">
              <h3>When it can’t find an answer</h3>
              <p>It says it found no approved policy on the question, links the closest related section, and creates a work item for the policy owner. The gap is logged so it can feed the next policy update.</p>
            </div>
          </div>
        </div>
      </>
    ),
    notes: [
      "Permissions are enforced at retrieval: a supervisor-only SOP is never retrieved for a frontline question, so the model can't leak it.",
      "Drafting assistance for policy updates comes later. It drafts redlines for the owner and never publishes.",
      "Regulatory monitoring: scheduled checks of named sources (CMS, the state Medicaid agency) produce a digest for a human to triage. It never auto-updates policy.",
    ],
  },

  /* 9 ------------------------------------------------------------ referral + accessibility */
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
      </>
    ),
    notes: [
      "The referral workflow can mostly be built now, because rules and workflow aren't AI. The restriction is on AI platforms using member-level data, so we confirm in discovery that the workflow tool itself is acceptable for PHI under a BAA.",
      "The 'prospect' queue fixes the side-spreadsheet problem: not-yet-eligible referrals get a re-check date and an owner.",
      "Accessibility: the channel is a member attribute, and every digital path has a human fallback.",
    ],
  },

  /* 10 ------------------------------------------------------------ roadmap */
  {
    id: "roadmap",
    section: "Q10 · Roadmap",
    title: "Phased roadmap",
    content: (
      <>
        <Head eyebrow="Implementation approach" q="Q10" title="Five gates, each with an exit test" />
        <div className="gate-list">
          {[
            ["Discovery", "2–3 wks", "Process maps, time study baseline, API & BAA check per system, approval requirements from governing bodies.", "Baseline hours measured; APIs confirmed; pilot scope signed off."],
            ["Prototype", "3–4 wks", "Engine + HR template on sample data; Slack nudges; drafting prompt tested.", "HR walks through it and confirms it matches real work."],
            ["Pilot", "6–8 wks", "One HR team live; weekly metrics; draft-edit rate tracked.", "Hours down vs. baseline; no missed SLAs going unseen; users keep using it."],
            ["Production", "4 wks", "All HR; monitoring, runbooks, access review, support owner.", "Security review passed; uptime and alerting in place."],
            ["Expansion", "ongoing", "Referral template (rules), knowledge assistant, CEO brief; Phase 2 once approved.", "Each new template reuses the engine without new code."],
          ].map(([t, d, b, e]) => (
            <div className="gate" key={t}>
              <div className="d-flex justify-content-between align-items-baseline"><h3>{t}</h3><span className="label">{d}</span></div>
              <p className="mb-0" style={{ fontSize: ".86em" }}>{b}</p>
              <div className="exit"><b>Exit test</b>{e}</div>
            </div>
          ))}
        </div>
        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="panel">
              <h3>Open questions for discovery</h3>
              <ul className="mb-0" style={{ fontSize: ".9em" }}>
                <li>Which of Rippling, Jotform and RingCentral offer API access and a BAA on the current plan?</li>
                <li>What is the source of truth for referrals and members today? Which healthcare systems are involved?</li>
                <li>Which identity provider is used (Google, Microsoft), and does every employee have an account?</li>
                <li>What exactly will the governing bodies need to review, and how long does it take?</li>
              </ul>
              <p className="mb-0 mt-1 text-body-secondary" style={{ fontSize: ".85em" }}>Full list in appendix A1.</p>
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="panel is-pine h-100">
              <h3>Asks for this meeting</h3>
              <ol className="mb-0" style={{ fontSize: ".9em", paddingLeft: "1.1rem" }}>
                <li>Agree on HR follow-up as the pilot</li>
                <li>Name an HR lead and an executive sponsor</li>
                <li>Start the approval conversation with the governing bodies now, in parallel</li>
              </ol>
            </div>
          </div>
        </div>
      </>
    ),
    notes: [
      "Durations are estimates to be re-planned after discovery.",
      "Approval for Phase 2 runs in parallel from week one, so it isn't on the critical path later.",
      "Close with the three asks.",
    ],
  },
];

export const slides: SlideDef[] = [...core, ...appendix];
