"use client";

import { useState } from "react";

type Exec = "Workflow" | "AI agent" | "Both";

export type UseCase = {
  name: string;
  phase: 1 | 2;
  exec: Exec;
  why: string;
  tools: string[];
  /** who can use it and what they can do */
  access: string[];
  /** agent skills (what the agent can do) or workflow steps */
  skills: string[];
};

export const USE_CASES: UseCase[] = [
  {
    name: "HR follow-up reminders", phase: 1, exec: "Both",
    why: "Timers and escalation must be predictable (workflow). Writing a good reminder is a language task (agent).",
    tools: ["Power Automate", "Dataverse", "Copilot Studio", "Teams", "Outlook"],
    access: ["HR staff: all HR items, approve drafts", "Hiring managers: own items only", "HR lead: edit templates & due dates"],
    skills: ["Draft reminder", "Summarize item history", "Snooze or reassign (calls a flow)"],
  },
  {
    name: "Interview scheduling & feedback", phase: 1, exec: "Workflow",
    why: "Fixed steps with fixed data. AI adds nothing here.",
    tools: ["Power Automate", "Outlook calendar", "Teams adaptive cards", "Rippling connector"],
    access: ["Interviewers: own feedback cards", "HR staff: all candidates in their roles"],
    skills: ["Send availability request", "Collect feedback card", "Chase after 48 h", "Update Rippling stage"],
  },
  {
    name: "Onboarding checklist", phase: 1, exec: "Workflow",
    why: "A checklist with due dates and outside vendors. Rules handle it fully.",
    tools: ["Dataverse", "Power Automate", "Power Apps", "Rippling connector"],
    access: ["HR staff: all new hires", "Supervisors: their new hires only", "New hire: own tasks in Teams"],
    skills: ["Create checklist from template", "Track background check", "Collect handbook sign-off", "Escalate overdue items"],
  },
  {
    name: "Employee relations write-ups", phase: 1, exec: "Both",
    why: "Drafting from notes is a language task. The decision and next steps stay with HR.",
    tools: ["Copilot Studio (HR-only agent)", "Dataverse (restricted table)", "Power Automate", "SharePoint policy library"],
    access: ["ER specialist / HR lead: full", "Supervisors: submit notes, see only their own cases", "No access for anyone else"],
    skills: ["Draft documentation from notes", "Cite the relevant policy section", "Check consistency with similar past cases", "Track action items"],
  },
  {
    name: "Policy & SOP assistant", phase: 1, exec: "AI agent",
    why: "Free-text questions need language understanding, grounded only in approved documents.",
    tools: ["Copilot Studio", "SharePoint library", "Azure AI Search (if needed)", "Teams"],
    access: ["All employees: ask, answers limited to what they may read", "Policy owners: edit their documents", "Compliance: approve publication"],
    skills: ["Answer with citations", "Say “no approved answer” and route to owner", "Show conflicting policies", "Log unanswered questions"],
  },
  {
    name: "Referral tracking & 24-hour clock", phase: 1, exec: "Workflow",
    why: "Status, deadlines and escalation are rules. Records contain member data, so AI stays off.",
    tools: ["Jotform connector", "Power Automate", "Dataverse (PHI environment)", "Power Apps"],
    access: ["Intake coordinators: referrals assigned to them", "Program lead: all referrals in program", "Executives: counts only, no member detail"],
    skills: ["Auto-acknowledge referral", "Missing-info checklist", "24 h and stage timers", "Prospect re-check reminders"],
  },
  {
    name: "Recurring reports", phase: 1, exec: "Workflow",
    why: "The numbers must be exact. Calculation is never left to AI.",
    tools: ["Power BI", "Dataflows / Microsoft Fabric", "Power Automate (distribution)"],
    access: ["Report owners: build & publish", "Viewers: row-level security by department"],
    skills: ["Scheduled refresh", "Subscriptions by email/Teams", "Optional Copilot narrative on top of fixed numbers"],
  },
  {
    name: "CEO chief-of-staff brief", phase: 1, exec: "Both",
    why: "Facts come from data (workflow). Turning them into a readable brief is a language task (agent).",
    tools: ["Power BI", "Copilot Studio", "Outlook calendar", "Dataverse"],
    access: ["CEO and executive team only", "Aggregates; no member-level data in Phase 1"],
    skills: ["Weekly brief", "What's stuck and on whom", "Meeting prep for attendees", "My open commitments"],
  },
  {
    name: "Regulatory change watch", phase: 1, exec: "Both",
    why: "Fetching named sources is a scheduled job. Judging relevance is a language task, and a person confirms it.",
    tools: ["Power Automate (scheduled)", "Copilot Studio", "SharePoint list"],
    access: ["Compliance lead: review & assign", "Policy owners: receive assigned changes"],
    skills: ["Summarize new guidance", "Suggest affected policies", "Create review task"],
  },
  {
    name: "Call summaries (RingCentral)", phase: 2, exec: "Both",
    why: "Summaries and action items are language work, but calls contain PHI, so this waits for approval.",
    tools: ["RingCentral API", "Azure AI Speech", "Copilot Studio", "Dataverse (PHI environment)"],
    access: ["Care managers: own calls", "Supervisors: their team", "Requires governing-body approval"],
    skills: ["Summarize call", "Extract action items → work items", "Flag unresolved issues"],
  },
  {
    name: "Member risk signals", phase: 2, exec: "Workflow",
    why: "Start with clear rules (recert date, missed contacts). Add ML only once there is labeled history.",
    tools: ["Dataverse", "Power Automate", "Microsoft Fabric (ML later)", "Power BI"],
    access: ["Care managers: own caseload", "Program lead: program view"],
    skills: ["Recertification countdown", "Missed-contact rule", "Missing-document rule", "Weekly risk list"],
  },
  {
    name: "SMS check-ins", phase: 2, exec: "Workflow",
    why: "Simple keyword replies need no AI. No reply always becomes a human call task.",
    tools: ["RingCentral SMS or Azure Communication Services", "Power Automate", "Dataverse"],
    access: ["Care managers: own members", "Members: reply only, no login"],
    skills: ["Send check-in", "Read 1 / 2 / HELP reply", "No reply → call task"],
  },
];

const FILTERS: ("All" | Exec)[] = ["All", "Workflow", "AI agent", "Both"];

export default function Blueprint() {
  const [f, setF] = useState<"All" | Exec>("All");
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const list = USE_CASES.filter((u) => (f === "All" || u.exec === f) && (phase === 0 || u.phase === phase));
  const counts = (e: Exec) => USE_CASES.filter((u) => u.exec === e).length;

  return (
    <div className="d-flex flex-column gap-2">
      <div className="d-flex flex-wrap gap-2 align-items-center" role="toolbar" aria-label="Filter use cases">
        {FILTERS.map((x) => (
          <button key={x} type="button" className="btn-deck" aria-pressed={f === x} onClick={() => setF(x)}>
            {x}{x !== "All" && ` · ${counts(x)}`}
          </button>
        ))}
        <span className="mx-1 text-body-secondary">|</span>
        {([0, 1, 2] as const).map((p) => (
          <button key={p} type="button" className="btn-deck" aria-pressed={phase === p} onClick={() => setPhase(p)}>
            {p === 0 ? "Both phases" : p === 1 ? "Phase 1 · now" : "Phase 2 · after approval"}
          </button>
        ))}
      </div>
      <div className="blueprint-grid">
        {list.map((u) => (
          <article className={`blueprint-card exec-${u.exec.replace(" ", "-").toLowerCase()}`} key={u.name}>
            <div className="d-flex justify-content-between align-items-start gap-2">
              <h3>{u.name}</h3>
              <span className={`exec-badge exec-${u.exec.replace(" ", "-").toLowerCase()}`}>{u.exec}</span>
            </div>
            <p className="why">{u.why}</p>
            <div className="bp-row"><span className="label">Tools</span>
              <div className="d-flex flex-wrap gap-1">{u.tools.map((t) => <span className="tool-chip" key={t}>{t}</span>)}</div>
            </div>
            <div className="bp-row"><span className="label">Who has access</span>
              <ul>{u.access.map((a) => <li key={a}>{a}</li>)}</ul>
            </div>
            <div className="bp-row"><span className="label">{u.exec === "Workflow" ? "Workflow steps" : "Agent skills"}</span>
              <ul>{u.skills.map((a) => <li key={a}>{a}</li>)}</ul>
            </div>
            <span className={`chip ${u.phase === 1 ? "now" : "gate"} align-self-start`}>{u.phase === 1 ? "Phase 1 · now" : "Phase 2 · after approval"}</span>
          </article>
        ))}
      </div>
    </div>
  );
}
