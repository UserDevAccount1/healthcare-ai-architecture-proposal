import type { SlideDef } from "./types";
import { withOutputs, ragDocsOut } from "./outputs";
import Pipeline, { type PipelineStep } from "@/components/Pipeline";
import CallDemo from "@/components/CallDemo";
import Constellation from "@/components/Constellation";
import { BrainDiagram } from "@/components/diagrams";

function Head({ eyebrow, q, title, lede }: { eyebrow: string; q?: string; title: string; lede?: string }) {
  return (
    <header className="d-flex flex-column gap-2">
      <div className="eyebrow"><span>{eyebrow}</span>{q && <span className="q">{q}</span>}</div>
      <h2>{title}</h2>
      {lede && <p className="lede">{lede}</p>}
    </header>
  );
}

function Plain({ children }: { children: React.ReactNode }) {
  return <div className="plain"><span className="label">In plain words</span><p>{children}</p></div>;
}

/* ------------------------------------------------------------------ RAG + OCR flow */
const ragFlow: PipelineStep[] = [
  {
    key: "in", title: "Documents arrive", hint: "Files, scans, faxes, email",
    plain: "Policies, training guides, call reports and, later, referral packets and consent forms come in from wherever they live today.",
    tech: "SharePoint libraries, email attachments routed by Power Automate, scanned or faxed PDFs dropped into an intake library.",
    tools: ["SharePoint", "Outlook", "Power Automate"],
  },
  {
    key: "ocr", title: "Read scans (OCR)", hint: "Turn images into text",
    plain: "Scanned and faxed pages become real text, keeping tables and checkboxes, so they can be searched.",
    tech: "Default: Azure AI Document Intelligence (managed, can be covered by the Microsoft BAA). Option: self-hosted Unlimited-OCR (open source, MIT) for long multi-page packets, if a GPU server is justified.",
    tools: ["Azure AI Document Intelligence", "Unlimited-OCR (self-hosted option)"], tone: "amber",
  },
  {
    key: "classify", title: "Sort & pull fields", hint: "What is it, what's in it",
    plain: "Each document is labeled (consent, referral, policy) and key details are picked out, like dates, names and signatures present.",
    tech: "Document classifier plus field extraction; low-confidence results go to a person to confirm.",
    tools: ["Document Intelligence models", "Copilot Studio", "Approval queue"],
  },
  {
    key: "gate", title: "PHI check", hint: "Which zone does it belong in?",
    plain: "Anything about a member goes to the locked Phase 2 area. Everything else goes to the general knowledge base.",
    tech: "Purview sensitivity labels plus a PHI classifier route files to the right environment and index. Each zone has a separate index.",
    tools: ["Purview", "Sensitivity labels"], tone: "crit",
  },
  {
    key: "store", title: "Store properly", hint: "File + structured record",
    plain: "The original file is kept, and the key details go into a structured record so they can be reported on.",
    tech: "File in SharePoint with version history and metadata; fields in Dataverse linked to the referral, candidate or policy.",
    tools: ["SharePoint", "Dataverse"],
  },
  {
    key: "index", title: "Make it findable", hint: "Search with permissions",
    plain: "Everything becomes searchable, but people only find what they're allowed to see.",
    tech: "Azure AI Search hybrid index (keyword + vector) with security trimming from Entra ID groups.",
    tools: ["Azure AI Search", "Entra ID"],
  },
  {
    key: "ask", title: "Ask & get cited answers", hint: "In Teams",
    plain: "Ask a question and get an answer quoted from the actual document, with a link. If it isn't there, it says so.",
    tech: "Copilot Studio agent retrieves passages, answers only from them, and cites document, section and version.",
    tools: ["Copilot Studio", "Teams"],
  },
];

export const extra: Record<string, SlideDef> = {
  /* ------------------------------------------------------------ what they are solving */
  "really-solving": {
    id: "really-solving",
    section: "What you're solving",
    title: "What we think you're really trying to solve",
    content: (
      <>
        <Head eyebrow="Reading between the lines" title="What we think you're really trying to solve"
          lede="The brief lists tools and departments. Underneath, we hear five goals. The proposal is built to meet these, not just to add AI." />
        <div className="row g-3">
          {[
            ["Nothing falls through the cracks", "Every follow-up has an owner and a due date, and leaders can see what's stuck before it becomes a problem.", "Work orchestration"],
            ["Staff spend time on people, not paperwork", "Less chasing, re-typing and report building, so HR and care teams get hours back each week.", "Automation + AI drafting"],
            ["Prove AI value without a compliance risk", "Start where there is no member data, show results, and earn the right to do more.", "Phase 1 pilot"],
            ["One organization, not six departments", "Shared tools, one record of work and one source of policy, instead of each team's own spreadsheets.", "Shared platform"],
            ["Ready to grow and ready for review", "A setup that scales with headcount and that the governing bodies can review and approve.", "Governance + ALM"],
          ].map(([t, d, tag]) => (
            <div className="col-12 col-md-6 col-xl" key={t}>
              <div className="panel h-100 d-flex flex-column gap-1">
                <span className="label">{tag}</span>
                <h3 className="mb-0">{t}</h3>
                <p style={{ fontSize: ".92em" }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="panel is-signal">
          <h3>What we&rsquo;d confirm in the first week</h3>
          <p className="mb-0" style={{ fontSize: ".92em" }}>Is RingCentral transcription already turned on? Which Microsoft 365 plan is in use, and are Teams meetings already transcribed? Who owns each spreadsheet in use today? What will the governing bodies ask to see?</p>
        </div>
        <Plain>You don&rsquo;t need more technology. You need work that doesn&rsquo;t get lost, less admin, and a safe way to start using AI.</Plain>
      </>
    ),
    notes: [
      "This is the pitch opener. Show you understood the business before the technology.",
      "Each goal maps to a part of the proposal. Point to the tag on each card.",
    ],
  },

  /* ------------------------------------------------------------ quick wins */
  "works-now": {
    id: "works-now",
    section: "Works now",
    title: "What can work now, with tools you already have",
    content: (
      <>
        <Head eyebrow="Pitch · quick wins" title="What can work in the first 30 days, with tools you likely own"
          lede="If you already have Microsoft 365 and Teams, these need little or no new software. Each one is non-PHI and shows value fast." />
        <div className="table-wrap">
          <table className="table map-table align-middle mb-0">
            <thead><tr><th>Quick win</th><th>What staff see</th><th>Built with</th><th>Run as</th><th>Ready?</th></tr></thead>
            <tbody>
              {[
                ["Meeting & call reports", "A filled report (PDF) in SharePoint after each internal meeting or call, with action items as tasks", "Teams transcripts or RingCentral recordings · Power Automate · Copilot Studio · SharePoint", "Both", "Teams: likely now · RingCentral: confirm API & transcription"],
                ["Interview feedback chaser", "Interviewers get a Teams card to submit feedback; reminders after 48 h", "Power Automate · Teams adaptive cards · Rippling", "Workflow", "Confirm Rippling API access"],
                ["Policy Q&A in Teams", "Ask a policy question, get a cited answer from the approved library", "Copilot Studio · SharePoint library", "AI agent", "Needs policies gathered into one library"],
                ["Stuck-work report", "A weekly Power BI view of overdue HR items by owner", "Dataverse · Power BI", "Workflow", "After the first workflow is live"],
                ["Referral 24-hour clock (rules only)", "A queue showing every referral's age, owner and missing items", "Jotform · Power Automate · Dataverse · Power Apps", "Workflow", "Confirm Power Platform is approved for PHI under the BAA"],
              ].map(([w, s, b, r, ready]) => (
                <tr key={w}>
                  <td>{w}</td><td>{s}</td><td className="text-body-secondary">{b}</td>
                  <td><span className={`exec-badge exec-${r.replace(" ", "-").toLowerCase()}`}>{r}</span></td>
                  <td className="text-body-secondary">{ready}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Plain>We can show working results within a month, using what you already pay for, without touching patient data with AI.</Plain>
      </>
    ),
    notes: [
      "The meeting-and-call report is the best demo: it's visible, saves time immediately, and is easy to understand. See the next slide.",
      "Every 'Ready?' cell is an assumption to confirm, not a promise.",
    ],
  },

  /* ------------------------------------------------------------ call demo */
  demo: {
    id: "demo",
    section: "Demo",
    title: "Demo: from a call to a filed report",
    content: (
      <>
        <Head eyebrow="Demo · call intelligence, Phase 1 version" title="From a recorded call to a filed report, automatically"
          lede="Press Play. Switch the source between RingCentral and Teams, and try a member call to see the PHI gate stop it." />
        <CallDemo />
        <Plain>After a staff call, the system writes the meeting notes into your standard report template, files it in the right folder, and creates the follow-up tasks. A person checks it before it&rsquo;s final.</Plain>
      </>
    ),
    notes: [
      "Fictional sample data. In a real prototype, the source is an internal call recorded in RingCentral or a Teams meeting.",
      "The AI only extracts fields the template defines. It doesn't write free-form conclusions.",
      "Member calls are the Phase 2 version of this, and the flow is identical, which is the point: approval switches on an already-tested design.",
    ],
  },

  /* ------------------------------------------------------------ constellation */
  constellation: {
    id: "constellation",
    section: "3D map",
    title: "The whole system as a constellation",
    content: (
      <>
        <Head eyebrow="Architecture constellation" title="The whole system, as one connected map"
          lede="Each cluster is a layer and each star is a tool. Lines show where information flows. Click a star to see what it does and where it fits." />
        <Constellation />
      </>
    ),
    notes: [
      "Start on the company brain at the center, then click outward: Dataverse, SharePoint, Copilot Studio, Teams.",
      "Dim, dashed labels are Phase 2 (OCR of member documents, healthcare systems, PHI gate).",
    ],
  },

  /* ------------------------------------------------------------ mapping */
  mapping: {
    id: "mapping",
    section: "Architecture mapping",
    title: "How each requirement maps to the architecture",
    content: (
      <>
        <Head eyebrow="High-level architecture mapping" title="Every requirement in the brief, and where it lives"
          lede="A checklist against the assessment: what the requirement is, which layer handles it, the tool, and when." />
        <div className="table-wrap">
          <table className="table map-table align-middle mb-0">
            <thead><tr><th>Requirement from the brief</th><th>Layer</th><th>Handled by</th><th>Phase</th></tr></thead>
            <tbody>
              {[
                ["Know what is waiting, on whom, for how long", "Track", "Dataverse work items + Power Automate timers", "1"],
                ["Escalate stuck work", "Track", "Escalation rules (no AI)", "1"],
                ["Cut HR admin (18–29 h/week)", "Connect · Think", "Rippling/Jotform flows + Copilot drafting", "1"],
                ["Answers grounded in approved policy, never invented", "Think", "Copilot Studio + SharePoint + Azure AI Search, citations required", "1"],
                ["Automate recurring reports", "Show", "Power BI over Dataverse; Fabric later", "1"],
                ["CEO chief of staff, no manual dashboard", "Brain · Show", "Company brain + Power BI + Copilot brief", "1"],
                ["Referral response within 24 hours", "Track", "Jotform → Dataverse queue with a 24 h clock", "1 (rules)"],
                ["Reduce duplicate data entry", "Connect", "One intake record, connectors instead of re-typing", "1"],
                ["Call summaries & action items", "Think", "Teams / RingCentral transcript → template → SharePoint", "1 staff · 2 member"],
                ["Scanned referral packets & consents", "Think", "OCR + field extraction into Dataverse", "2"],
                ["Member risk signals", "Track", "Rules first (recert dates, missed contacts), ML later", "2"],
                ["Reach members without smartphones", "Show", "SMS, voice, staff call task, mail; no reply → human", "2"],
                ["HIPAA, BAA, least privilege, audit", "Keep it safe", "Entra ID, security roles, Purview, separate PHI environment", "1 + 2"],
                ["Safe releases (DEV / QA / PROD)", "Keep it safe", "Power Platform Pipelines with approvals", "1"],
              ].map(([r, l, h, p]) => (
                <tr key={r}>
                  <td>{r}</td><td><span className="tool-chip">{l}</span></td><td className="text-body-secondary">{h}</td>
                  <td><span className={`chip ${p.startsWith("2") ? "gate" : "now"}`}>{p}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),
    notes: ["Use this as the 'did we cover everything' slide. Each row points back to a slide in the deck."],
  },

  /* ------------------------------------------------------------ RAG + OCR */
  rag: {
    id: "rag",
    section: "RAG & OCR",
    title: "Finding any document or detail, safely",
    content: (
      <>
        <Head eyebrow="Retrieval (RAG) at a high level · with OCR" title="Find any document or detail, with the source attached"
          lede="The same retrieval pattern serves policies today, and referral packets and member records after approval, each in its own locked zone." />
        <Pipeline steps={withOutputs(ragFlow, ragDocsOut)} label="Document retrieval pipeline" />
        <div className="row g-2" style={{ fontSize: ".88em" }}>
          {[
            ["Phase 1 · now", "“What’s our PTO carry-over rule?” · “Find the onboarding checklist for drivers” · “What did we decide about weekend coverage?”", "now"],
            ["Phase 2 · after approval", "“Is the consent form in referral R-1042 signed?” · “What’s missing from this referral packet?” · “Summarize the last three contacts with this member.”", "gate"],
          ].map(([k, v, c]) => (
            <div className="col-12 col-lg-6" key={k}>
              <div className={`panel h-100 ${c === "gate" ? "is-signal" : ""}`}><span className={`chip ${c}`}>{k}</span><p className="mt-2 mb-0">{v}</p></div>
            </div>
          ))}
        </div>
        <Plain>Every paper, scan and policy becomes searchable. Staff ask in plain English and get the exact document back, with a link. Patient documents stay locked until approval.</Plain>
      </>
    ),
    notes: [
      "OCR choice: start with Azure AI Document Intelligence. It's managed, part of the Microsoft stack, and can be covered by the BAA.",
      "Unlimited-OCR (Baidu, MIT licence) is strong on very long multi-page documents, but it is self-hosted and was tested on an 80 GB data-centre GPU. Consider it only if volumes or data-location rules justify running our own server.",
      "Separate indexes per zone mean a Phase 1 question can never retrieve a member document.",
    ],
  },

  /* ------------------------------------------------------------ company brain */
  brain: {
    id: "brain",
    section: "Company brain",
    title: "The company brain",
    content: (
      <>
        <Head eyebrow="Organizational memory" title="A company brain: what the organization knows, in one place"
          lede="Decisions, recaps, owners and lessons are captured automatically as work happens, so knowledge doesn't leave when people do." />
        <BrainDiagram />
        <div className="row g-2" style={{ fontSize: ".88em" }}>
          <div className="col-12 col-lg-4"><div className="panel h-100"><span className="label">How it contributes</span><p className="mt-1 mb-0">It powers the CEO brief and meeting prep, gives new staff answers on day one, keeps supervisors consistent, and shows which questions policy doesn&rsquo;t answer yet.</p></div></div>
          <div className="col-12 col-lg-4"><div className="panel h-100"><span className="label">How it&rsquo;s built</span><p className="mt-1 mb-0">Default: SharePoint pages and Dataverse records indexed for Copilot. Option to evaluate: GBrain, an open-source, self-hosted memory for AI agents (Markdown files + Postgres search, MIT licence).</p></div></div>
          <div className="col-12 col-lg-4"><div className="panel is-signal h-100"><span className="label">Guardrails</span><p className="mt-1 mb-0">No PHI, ever. Each fact links to its source, every page has an owner who can correct it, and stale pages are flagged for review.</p></div></div>
        </div>
        <Plain>The brain remembers what was decided, who owns what, and where things are, so the CEO and staff don&rsquo;t have to ask around.</Plain>
      </>
    ),
    notes: [
      "This is the long-term asset. Every workflow and agent adds to it, and every agent reads from it.",
      "If GBrain is evaluated, run it self-hosted inside the organization's cloud, and check where its embedding and rerank providers send text.",
    ],
  },
};
