"use client";

import { useEffect, useState } from "react";

type Source = "ringcentral" | "teams";
type Scenario = "hr" | "member";

const STEPS = ["Recording", "Transcript", "Extract details", "Fill template", "Store & act"];

const TRANSCRIPT = [
  ["Dana (HR)", "Thanks for jumping on. We interviewed Alex for the Care Coordinator role yesterday."],
  ["Sam (Hiring mgr)", "Strong on scheduling and documentation. I'd like to move to references."],
  ["Dana (HR)", "Okay. I'll request two references today. Can you send your written feedback by Friday?"],
  ["Sam (Hiring mgr)", "Yes, Friday. One concern: weekend availability. Can we confirm that before an offer?"],
  ["Dana (HR)", "I'll ask the candidate and add it to the reference check. Let's regroup Monday."],
];

const FIELDS: { k: string; v: string }[] = [
  { k: "Call type", v: "Hiring debrief" },
  { k: "Role", v: "Care Coordinator" },
  { k: "Decision", v: "Move to reference check" },
  { k: "Open question", v: "Weekend availability to confirm" },
  { k: "Next meeting", v: "Monday" },
];

const ACTIONS: { what: string; owner: string; due: string }[] = [
  { what: "Request two references", owner: "Dana (HR)", due: "Today" },
  { what: "Send written interview feedback", owner: "Sam (Hiring mgr)", due: "Friday" },
  { what: "Confirm weekend availability with candidate", owner: "Dana (HR)", due: "Before offer" },
];

export default function CallDemo() {
  const [step, setStep] = useState(0);
  const [source, setSource] = useState<Source>("ringcentral");
  const [scenario, setScenario] = useState<Scenario>("hr");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setStep((s) => {
      if (s >= STEPS.length - 1) { setPlaying(false); return s; }
      return s + 1;
    }), 2200);
    return () => clearInterval(t);
  }, [playing]);

  const blocked = scenario === "member" && step >= 1;

  return (
    <div className="demo">
      <div className="d-flex flex-wrap gap-2 align-items-center">
        <span className="label me-1">Source</span>
        <button type="button" className="btn-deck" aria-pressed={source === "ringcentral"} onClick={() => setSource("ringcentral")}>RingCentral call</button>
        <button type="button" className="btn-deck" aria-pressed={source === "teams"} onClick={() => setSource("teams")}>Teams meeting</button>
        <span className="mx-1 text-body-secondary">|</span>
        <span className="label me-1">Call</span>
        <button type="button" className="btn-deck" aria-pressed={scenario === "hr"} onClick={() => setScenario("hr")}>Internal HR call</button>
        <button type="button" className="btn-deck" aria-pressed={scenario === "member"} onClick={() => setScenario("member")}>Member call (Phase 2)</button>
        <span className="ms-auto sample-tag">Sample data · fictional people</span>
      </div>

      <div className="demo-steps" role="tablist" aria-label="Demo steps">
        {STEPS.map((s, i) => (
          <button key={s} type="button" role="tab" aria-selected={step === i}
            className={`demo-step ${step === i ? "is-active" : ""} ${i < step ? "is-done" : ""}`}
            onClick={() => { setPlaying(false); setStep(i); }}>
            <span className="pipeline-num">{i + 1}</span>{s}
          </button>
        ))}
        <button type="button" className="btn-deck ms-auto" aria-pressed={playing}
          onClick={() => { if (step >= STEPS.length - 1) setStep(0); setPlaying((p) => !p); }}>
          {playing ? "Pause" : "Play demo"}
        </button>
      </div>

      <div className="demo-stage">
        {blocked ? (
          <div className="demo-blocked">
            <span className="chip gate">Phase 2 · after approval</span>
            <h3 className="mt-2">Stopped at the PHI gate</h3>
            <p>This call contains member information. Until the governing bodies approve it, the recording stays in RingCentral and no AI service receives it. The care manager documents the call as they do today.</p>
            <p className="mb-0 text-body-secondary">After approval, the same flow runs in the separate Phase 2 environment. It fills a member contact note (reason for call, follow-ups, missing documents), and the care manager reviews it before it is saved.</p>
          </div>
        ) : (
          <>
            {step === 0 && (
              <div className="d-flex flex-column gap-2">
                <div className="wave" aria-hidden="true">{Array.from({ length: 64 }, (_, i) => <span key={i} style={{ height: `${18 + Math.abs(Math.sin(i * 0.7) * 34 + Math.sin(i * 2.1) * 12)}%` }} />)}</div>
                <p className="mb-0"><b>{source === "ringcentral" ? "RingCentral recording" : "Teams meeting recording"}</b> · 12 min · internal staff only</p>
                <p className="mb-0 text-body-secondary">When the call ends, a Power Automate flow picks up the new {source === "ringcentral" ? "recording through the RingCentral API" : "meeting through Microsoft Graph"}.</p>
              </div>
            )}
            {step === 1 && (
              <div className="d-flex flex-column gap-2">
                <p className="mb-1 text-body-secondary">{source === "ringcentral"
                  ? "If RingCentral transcription is already turned on, the flow takes its transcript. If not, Azure AI Speech transcribes the recording."
                  : "Teams transcription comes with Microsoft 365. The flow reads the transcript through Microsoft Graph."}</p>
                <div className="transcript">
                  {TRANSCRIPT.map(([who, line], i) => <p key={i}><b>{who}:</b> {line}</p>)}
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="row g-3">
                <div className="col-12 col-lg-5">
                  <p className="text-body-secondary mb-2">The AI only pulls out the fields the template asks for. It writes nothing else.</p>
                  <dl className="fields">{FIELDS.map((f) => <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>)}</dl>
                </div>
                <div className="col-12 col-lg-7">
                  <span className="label">Action items found</span>
                  <table className="table table-sm mb-0 mt-1"><thead><tr><th>Action</th><th>Owner</th><th>Due</th></tr></thead>
                    <tbody>{ACTIONS.map((a) => <tr key={a.what}><td>{a.what}</td><td>{a.owner}</td><td>{a.due}</td></tr>)}</tbody></table>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="paper" aria-label="Filled call report template">
                <div className="paper-head">
                  <div><b>Call Report</b><div className="paper-sub">Template: HR · Hiring debrief v2</div></div>
                  <div className="paper-sub text-end">Generated automatically<br />Reviewed by: Dana (HR) ✓</div>
                </div>
                <div className="paper-grid">{FIELDS.map((f) => <div key={f.k}><span>{f.k}</span><b>{f.v}</b></div>)}</div>
                <div className="paper-sec">Action items</div>
                <ol>{ACTIONS.map((a) => <li key={a.what}>{a.what} · <i>{a.owner}</i> · {a.due}</li>)}</ol>
                <div className="paper-foot">Source: {source === "ringcentral" ? "RingCentral call" : "Teams meeting"} · transcript kept 30 days · report kept per HR retention policy</div>
              </div>
            )}
            {step === 4 && (
              <div className="row g-3">
                <div className="col-12 col-md-4"><div className="panel h-100"><span className="label">SharePoint</span><p className="mt-1 mb-0 mono-path">HR › Call Reports › 2026 › 11 ›<br />hiring-debrief-care-coordinator.pdf</p></div></div>
                <div className="col-12 col-md-4"><div className="panel h-100"><span className="label">Dataverse</span><p className="mt-1 mb-0">One <b>call report</b> row with the fields, linked to the candidate, searchable and reportable.</p></div></div>
                <div className="col-12 col-md-4"><div className="panel is-pine h-100"><span className="label">Work items created</span><p className="mt-1 mb-0">3 follow-ups with owners and due dates. Reminders go out in Teams automatically.</p></div></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
