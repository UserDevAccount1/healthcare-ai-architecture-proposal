import { Arrow, Box, Figure, Label } from "./svg";

/* ---------------------------------------------------------------- Q3 architecture */
export function ArchitectureDiagram() {
  const colY = 56;
  const src = ["Rippling (HR/ATS)", "Jotform (forms)", "RingCentral", "Email · Slack", "Spreadsheets", "QuickBooks", "Healthcare systems"];
  return (
    <Figure
      viewBox="0 0 1200 540"
      label="Microsoft-based architecture: source systems connect through Power Automate into Dataverse tables; a Copilot Studio agent with Azure OpenAI and SharePoint knowledge sits behind a PHI gate; people see results in Teams, Power Apps, Outlook and Power BI."
      caption="Every system connects through Power Automate into one set of Dataverse tables. AI never reads a source system directly: requests pass the PHI gate first. Dashed = needs technical discovery (API access, licences)."
    >
      {/* column headers */}
      {[
        [110, "WHERE DATA STARTS"], [350, "CONNECT"], [610, "TRACK (DATAVERSE)"], [870, "THINK (AI)"], [1100, "WHERE PEOPLE SEE IT"],
      ].map(([x, t]) => <Label key={t as string} x={x as number} y={36}>{t}</Label>)}

      {/* sources */}
      {src.map((s, i) => (
        <Box key={s} x={20} y={colY + i * 50} w={180} h={40} lines={[s]} bold={false}
          dashed={s === "RingCentral" || s === "Healthcare systems"} tone={s === "Healthcare systems" ? "muted" : "plain"} />
      ))}

      {/* integration */}
      <Box x={260} y={colY} w={180} h={106} lines={["Power Automate", "connectors", "Jotform · QuickBooks · Slack"]} />
      <Box x={260} y={colY + 118} w={180} h={106} lines={["Custom connectors", "Rippling · RingCentral", "(API check in discovery)"]} />
      <Box x={260} y={colY + 236} w={180} h={104} lines={["Power Automate", "Desktop (RPA) / CSV", "only where no API"]} dashed tone="muted" />

      {/* orchestration core */}
      <rect x={500} y={colY} width={220} height={340} rx={8} style={{ fill: "var(--pine-soft)", stroke: "var(--pine)", strokeWidth: 2 }} />
      <Box x={516} y={colY + 16} w={188} h={66} lines={["Work-item tables", "owner · waiting on · due"]} />
      <Box x={516} y={colY + 94} w={188} h={66} lines={["Timers & escalation", "scheduled cloud flows"]} />
      <Box x={516} y={colY + 172} w={188} h={66} lines={["Workflow templates", "HR · referral · ER · reports"]} />
      <Box x={516} y={colY + 250} w={188} h={74} lines={["History & audit", "Dataverse auditing"]} />

      {/* AI services */}
      <Box x={780} y={colY} w={180} h={70} lines={["PHI gate", "field allowlist + Purview DLP"]} tone="amber" />
      <Box x={780} y={colY + 84} w={180} h={78} lines={["Copilot Studio agent", "Azure OpenAI models", "drafts & summaries only"]} />
      <Box x={780} y={colY + 176} w={180} h={78} lines={["Knowledge (RAG)", "SharePoint library", "+ Azure AI Search"]} />
      <Box x={780} y={colY + 268} w={180} h={72} lines={["Conversation logs", "Copilot Studio analytics"]} />

      {/* experience */}
      {["Teams agent & nudges", "Power Apps work queue", "Outlook daily digest", "Power BI CEO brief", "Policy Q&A in Teams"].map((t, i) => (
        <Box key={t} x={1020} y={colY + i * 69} w={160} h={58} lines={[t]} />
      ))}

      {/* flows */}
      <Arrow x1={200} y1={226} x2={258} y2={226} label="webhooks" />
      <Arrow x1={200} y1={260} x2={258} y2={300} label="" />
      <Arrow x1={440} y1={226} x2={498} y2={226} label="events" />
      <Arrow x1={720} y1={110} x2={778} y2={92} label="req" amber labelDy={-10} />
      <Arrow x1={778} y1={170} x2={722} y2={180} label="draft" labelDy={16} />
      <Arrow x1={720} y1={250} x2={778} y2={270} label="" />
      <Arrow x1={960} y1={226} x2={1018} y2={226} label="notify" />
      <path d="M720 380 C 870 420, 960 410, 1018 380" fill="none" stroke="var(--muted)" strokeWidth={1.6} markerEnd="url(#arw)" style={{ color: "var(--muted)" }} />
      <Label x={880} y={428}>rules-only notifications skip AI</Label>

      {/* cross-cutting band */}
      <Label x={20} y={462} anchor="start">APPLIES TO EVERY LAYER</Label>
      {["Entra ID SSO + MFA", "Security roles", "Purview DLP", "Audit logs", "Monitoring", "DEV · QA · PROD", "Approvals"].map((t, i) => (
        <Box key={t} x={20 + i * 166} y={474} w={154} h={44} lines={[t]} tone="muted" bold={false} />
      ))}
    </Figure>
  );
}

/* ---------------------------------------------------------------- Q5 work item lifecycle */
export function LifecycleDiagram() {
  const y = 70, h = 64, w = 150, gap = 40;
  const states: { t: string[]; tone: "plain" | "pine" | "amber" | "crit" | "muted" }[] = [
    { t: ["Created", "by event or form"], tone: "plain" },
    { t: ["Waiting on", "named owner"], tone: "pine" },
    { t: ["Due soon", "≥ 75% of SLA"], tone: "amber" },
    { t: ["Overdue", "nudge owner"], tone: "amber" },
    { t: ["Escalated", "to manager"], tone: "crit" },
    { t: ["Resolved", "closed + logged"], tone: "muted" },
  ];
  return (
    <Figure
      viewBox="0 0 1150 250"
      label="Work item lifecycle: created, waiting on a named owner, due soon, overdue, escalated, resolved. Timers move the item forward; the owner's action resolves it at any stage."
      caption="One state machine for every workflow. Deterministic timers move an item to the right; any owner action closes it. AI is only used to write the nudge text and summarize the history for the escalation."
    >
      {states.map((s, i) => (
        <Box key={i} x={20 + i * (w + gap)} y={y} w={w} h={h} lines={s.t} tone={s.tone} />
      ))}
      {[0, 1, 2, 3].map((i) => {
        const x1 = 20 + i * (w + gap) + w, x2 = x1 + gap - 2;
        const labels = ["assign", "timer", "SLA hit", "+N days"];
        return <Arrow key={i} x1={x1} y1={y + h / 2} x2={x2} y2={y + h / 2} label={labels[i]} amber={i > 0} />;
      })}
      <Arrow x1={20 + 4 * (w + gap) + w} y1={y + h / 2} x2={20 + 5 * (w + gap) - 2} y2={y + h / 2} label="resolve" />
      {/* return path: owner action resolves from any state */}
      <path d={`M ${20 + w + gap + w / 2} ${y + h} V ${y + h + 50} H ${20 + 5 * (w + gap) + w / 2} V ${y + h + 4}`}
        fill="none" stroke="var(--pine)" strokeWidth={1.6} markerEnd="url(#arw)" style={{ color: "var(--pine)" }} />
      <Label x={575} y={y + h + 44} style={{ fill: "var(--pine)" }}>owner completes the action → resolved (from any state)</Label>
      <Label x={20} y={40} anchor="start">AGING CLOCK STARTS AT CREATION · PAUSES ONLY WHEN WAITING ON AN EXTERNAL PARTY WITH A LOGGED REASON</Label>
    </Figure>
  );
}

/* ---------------------------------------------------------------- Q6 phase boundary */
export function PhaseBoundaryDiagram() {
  return (
    <Figure
      viewBox="0 0 1150 330"
      label="Phase 1 zone handles administrative data with AI enabled. Phase 2 zone holds member-level data with AI switched off until governing bodies approve; the PHI gate blocks member data from reaching the AI services."
      caption="The same orchestration code runs in both zones, but member data lives in a separate store, and the path from it to the AI gateway is closed by configuration until written approval exists."
    >
      {/* phase 1 */}
      <rect x={20} y={40} width={500} height={270} rx={10} style={{ fill: "var(--pine-soft)", stroke: "var(--pine)", strokeWidth: 1.6 }} />
      <Label x={40} y={66} anchor="start" style={{ fill: "var(--pine)" }}>PHASE 1 · ADMINISTRATIVE · STARTS NOW</Label>
      <Box x={40} y={86} w={210} h={60} lines={["HR, recruiting, onboarding", "staff data only"]} />
      <Box x={40} y={160} w={210} h={60} lines={["Policies & SOPs", "approved documents"]} />
      <Box x={40} y={234} w={210} h={60} lines={["Referral counts & aging", "IDs only, no member detail"]} />
      <Box x={290} y={120} w={210} h={130} lines={["AI services", "Copilot Studio", "Azure OpenAI", "no training on our data"]} tone="plain" />
      <Arrow x1={250} y1={116} x2={288} y2={150} />
      <Arrow x1={250} y1={190} x2={288} y2={190} />

      {/* gate */}
      <rect x={545} y={110} width={60} height={150} rx={6} style={{ fill: "var(--amber-soft)", stroke: "var(--amber)", strokeWidth: 2 }} />
      <text x={575} y={185} textAnchor="middle" transform="rotate(-90 575 185)" style={{ fill: "var(--fg)", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-body)" }}>PHI gate</text>

      {/* phase 2 */}
      <rect x={630} y={40} width={500} height={270} rx={10} style={{ fill: "var(--surface-2)", stroke: "var(--line)", strokeWidth: 1.6, strokeDasharray: "6 5" }} />
      <Label x={650} y={66} anchor="start">PHASE 2 · MEMBER-LEVEL · AFTER APPROVAL</Label>
      <Box x={900} y={86} w={210} h={60} lines={["Member records", "separate environment"]} tone="muted" />
      <Box x={900} y={160} w={210} h={60} lines={["Call transcripts", "RingCentral"]} tone="muted" />
      <Box x={900} y={234} w={210} h={60} lines={["Risk signals · SMS", "check-ins"]} tone="muted" />
      <Box x={650} y={120} w={210} h={130} lines={["Power Automate", "rules run today", "without AI"]} tone="plain" />
      <Arrow x1={898} y1={190} x2={862} y2={190} />

      {/* blocked path */}
      <Arrow x1={648} y1={150} x2={608} y2={150} amber dashed label="blocked" labelDy={-8} />
      <line x1={545} y1={150} x2={505} y2={150} style={{ stroke: "var(--crit)", strokeWidth: 2, strokeDasharray: "4 4" }} />
      <text x={525} y={146} textAnchor="middle" style={{ fill: "var(--crit)", fontSize: 16, fontWeight: 700 }}>×</text>
      <Label x={575} y={290}>opens only with written approval</Label>
    </Figure>
  );
}

/* ---------------------------------------------------------------- Q7 knowledge assistant */
export function RagDiagram() {
  const y = 60, h = 70;
  return (
    <Figure
      viewBox="0 0 1150 260"
      label="Knowledge assistant flow: approved documents are ingested with owner, version and effective dates; questions are filtered by the asker's permissions; answers cite sources, or the assistant says it found no authoritative answer and routes the question to the policy owner."
      caption="The model may only rephrase what retrieval returns. If no current, approved passage clears the relevance bar, the assistant declines and routes the question to the policy owner."
    >
      <Box x={20} y={y} w={170} h={h} lines={["Approved docs", "SharePoint library"]} />
      <Box x={230} y={y} w={190} h={h} lines={["Ingest + metadata", "owner · version · effective", "expiry · audience"]} />
      <Box x={460} y={y} w={170} h={h} lines={["Azure AI Search", "current versions only"]} tone="pine" />
      <Box x={670} y={y} w={190} h={h} lines={["Retrieve", "filtered by asker's role"]} />
      <Box x={900} y={y - 20} w={230} h={60} lines={["Answer + citations", "doc · section · version"]} tone="pine" />
      <Box x={900} y={y + 60} w={230} h={60} lines={["No authoritative answer", "say so · route to owner"]} tone="amber" />
      <Arrow x1={190} y1={y + h / 2} x2={228} y2={y + h / 2} />
      <Arrow x1={420} y1={y + h / 2} x2={458} y2={y + h / 2} />
      <Arrow x1={630} y1={y + h / 2} x2={668} y2={y + h / 2} />
      <Arrow x1={860} y1={y + 20} x2={898} y2={y + 10} label="match" />
      <Arrow x1={860} y1={y + 50} x2={898} y2={y + 85} label="no match" amber labelDy={22} />
      <Box x={230} y={y + 110} w={190} h={56} lines={["Expired / superseded", "kept, never retrieved"]} tone="muted" />
      <Arrow x1={325} y1={y + h} x2={325} y2={y + 108} />
      <Box x={670} y={y + 110} w={190} h={56} lines={["Conflict detected", "show both · flag owner"]} tone="amber" />
      <Arrow x1={765} y1={y + h} x2={765} y2={y + 108} />
    </Figure>
  );
}

/* ---------------------------------------------------------------- Q8 referral workflow */
export function ReferralDiagram() {
  const stages = ["Referral", "Intake", "Screening", "Assessment", "Enrollment", "Assignment", "Care plan"];
  const w = 138, gap = 18, x0 = 20, y = 70;
  const now = ["Single intake form · auto-ack", "Missing-info checklist", "Eligibility rules", "Scheduling task", "Doc checklist · reminders", "Owner routing rules", "Hand-off task"];
  const later = ["AI: extract from referral fax/PDF", "AI: draft request for missing docs", "", "AI: summarize prior notes", "", "AI: workload-aware suggestion", "AI: call summary → plan draft"];
  return (
    <Figure
      viewBox="0 0 1150 330"
      label="Referral workflow with seven stages. Each stage has a rules-based component that can start now, and some stages have an AI component that waits for PHI approval. A 24-hour response clock covers referral and intake."
      caption="The top row runs now on rules and workflow, with no AI touching member data. The bottom row adds AI only after the governing bodies approve it. Every stage writes to one referral record, so nobody re-enters data."
    >
      <rect x={x0} y={30} width={2 * w + gap} height={26} rx={4} style={{ fill: "var(--amber-soft)", stroke: "var(--amber)" }} />
      <Label x={x0 + w + gap / 2} y={48} style={{ fill: "var(--amber)" }}>24-HOUR RESPONSE CLOCK</Label>
      {stages.map((s, i) => {
        const x = x0 + i * (w + gap);
        return (
          <g key={s}>
            <Box x={x} y={y} w={w} h={46} lines={[s]} tone="pine" />
            {i < stages.length - 1 && <Arrow x1={x + w} y1={y + 23} x2={x + w + gap - 1} y2={y + 23} />}
            <Box x={x} y={y + 64} w={w} h={64} lines={now[i].split(" · ").length > 1 ? now[i].split(" · ") : [now[i]]} bold={false} size={12} />
            {later[i] && <Box x={x} y={y + 146} w={w} h={74} lines={later[i].replace("AI: ", "").match(/.{1,20}(\s|$)/g)!.map((l) => l.trim())} tone="muted" dashed bold={false} size={11.5} />}
          </g>
        );
      })}
      <Label x={x0} y={y + 60} anchor="start" size={10} style={{ fill: "var(--ok)" }}>NOW · RULES + WORKFLOW</Label>
      <Label x={x0} y={y + 142} anchor="start" size={10} style={{ fill: "var(--amber)" }}>AFTER APPROVAL · AI</Label>
      <Label x={x0} y={318} anchor="start">STALLED &gt; SLA AT ANY STAGE → ESCALATE TO PROGRAM LEAD · NOT-YET-ELIGIBLE → "PROSPECT" QUEUE WITH RE-CHECK DATE</Label>
    </Figure>
  );
}

/* ---------------------------------------------------------------- company brain */
export function BrainDiagram() {
  const ins = ["Meeting & call recaps", "Decisions log", "Policy & SOP changes", "Work-item history", "Owners & org chart", "Unanswered questions"];
  const outs = ["CEO weekly brief", "Policy & knowledge assistant", "New-staff onboarding", "Meeting prep", "“Who owns this?” answers", "Consistent ER guidance"];
  const rowY = (i: number) => 52 + i * 46;
  return (
    <Figure
      viewBox="0 0 1150 340"
      label="Company brain: meeting recaps, decisions, policy changes, work history, owners and unanswered questions flow in; the brain stores typed, cited pages; it feeds the CEO brief, the knowledge assistant, onboarding, meeting prep and ownership answers."
      caption="The brain only stores what the organization already knows, with its source attached. Agents read from it and never invent facts into it. Nothing member-level goes in."
    >
      <Label x={130} y={30}>WHAT FLOWS IN (AUTOMATICALLY)</Label>
      <Label x={1020} y={30}>WHAT IT POWERS</Label>
      {ins.map((t, i) => (
        <g key={t}>
          <Box x={20} y={rowY(i)} w={220} h={36} lines={[t]} bold={false} />
          <Arrow x1={240} y1={rowY(i) + 18} x2={418} y2={170} />
        </g>
      ))}
      <rect x={420} y={60} width={310} height={220} rx={14} style={{ fill: "var(--amber-soft)", stroke: "var(--amber)", strokeWidth: 2 }} />
      <text x={575} y={96} textAnchor="middle" style={{ fill: "var(--fg)", fontSize: 18, fontWeight: 700, fontFamily: "var(--font-display)" }}>Company brain</text>
      <Label x={575} y={118}>TYPED PAGES · EACH FACT HAS A SOURCE</Label>
      {["Person / role", "Process", "Decision", "Meeting", "Policy", "Vendor"].map((t, i) => (
        <Box key={t} x={440 + (i % 3) * 98} y={134 + Math.floor(i / 3) * 52} w={88} h={40} lines={[t]} bold={false} size={12} />
      ))}
      <Label x={575} y={264}>OWNER CAN CORRECT · STALE PAGES FLAGGED</Label>
      {outs.map((t, i) => (
        <g key={t}>
          <Arrow x1={732} y1={170} x2={908} y2={rowY(i) + 18} />
          <Box x={910} y={rowY(i)} w={220} h={36} lines={[t]} tone="pine" bold={false} />
        </g>
      ))}
    </Figure>
  );
}

/* ---------------------------------------------------------------- embeddings "map of meaning" */
export function MeaningMap() {
  const pts: { x: number; y: number; t: string; near?: boolean }[] = [
    { x: 300, y: 92, t: "PTO carry-over rules (HR Policy 4.2)", near: true },
    { x: 360, y: 140, t: "Unused vacation at year end (FAQ)", near: true },
    { x: 250, y: 150, t: "Leave request steps (SOP 12)", near: true },
    { x: 560, y: 70, t: "Parking at the main office" },
    { x: 620, y: 175, t: "Mileage reimbursement" },
    { x: 110, y: 210, t: "Background check vendors" },
    { x: 520, y: 225, t: "Referral intake checklist" },
  ];
  const q = { x: 318, y: 124 };
  return (
    <Figure
      viewBox="0 0 760 260"
      label="A map of meaning: the question 'How many vacation days roll over?' lands close to passages about PTO carry-over and unused vacation, and far from parking or mileage passages, even though it shares few exact words with them."
      caption="Embeddings place every passage on a map by meaning. A question lands near the passages that mean the same thing, even when the words differ: “vacation days roll over” finds “PTO carry-over”."
    >
      <rect x={1} y={1} width={758} height={258} rx={10} style={{ fill: "var(--surface-2)", stroke: "var(--line)" }} />
      <circle cx={q.x} cy={q.y} r={78} style={{ fill: "var(--pine-soft)", stroke: "var(--pine)", strokeDasharray: "5 4" }} />
      {pts.map((p) => (
        <g key={p.t}>
          {p.near && <line x1={q.x} y1={q.y} x2={p.x} y2={p.y} style={{ stroke: "var(--pine)", strokeWidth: 1.4 }} />}
          <circle cx={p.x} cy={p.y} r={6} style={{ fill: p.near ? "var(--pine)" : "var(--muted)" }} />
          <text x={p.x + 10} y={p.y + 4} style={{ fill: p.near ? "var(--fg)" : "var(--muted)", fontSize: 12, fontFamily: "var(--font-body)" }}>{p.t}</text>
        </g>
      ))}
      <circle cx={q.x} cy={q.y} r={9} style={{ fill: "var(--amber)" }} />
      <text x={q.x - 14} y={q.y + 30} textAnchor="end" style={{ fill: "var(--amber)", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-body)" }}>“How many vacation days roll over?”</text>
      <Label x={20} y={26} anchor="start">MAP OF MEANING (SIMPLIFIED TO 2D)</Label>
    </Figure>
  );
}
