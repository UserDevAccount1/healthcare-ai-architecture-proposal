"use client";

import { useState } from "react";

/* ------------------------------------------------------------------ tooltip helper */
type Tip = { x: number; y: number; lines: string[] } | null;

function Tooltip({ tip }: { tip: Tip }) {
  if (!tip) return null;
  return (
    <div className="chart-tip" style={{ left: tip.x, top: tip.y }} role="status">
      {tip.lines.map((l, i) => <div key={i} className={i === 0 ? "fw-semibold" : ""}>{l}</div>)}
    </div>
  );
}

function useTip() {
  const [tip, setTip] = useState<Tip>(null);
  const show = (e: React.PointerEvent | React.FocusEvent, lines: string[]) => {
    const host = (e.currentTarget as Element).closest(".chart") as HTMLElement | null;
    const r = (e.currentTarget as Element).getBoundingClientRect();
    const h = host?.getBoundingClientRect();
    if (!h) return;
    setTip({ x: r.left - h.left + r.width / 2, y: r.top - h.top, lines });
  };
  return { tip, show, hide: () => setTip(null) };
}

/* ------------------------------------------------------------------ HR hours (range bars) */
const HOURS = [
  { area: "Recruiting & hiring admin", min: 10, max: 15, detail: "Sourcing, screening, interview scheduling, feedback, references, offers" },
  { area: "Employee relations", min: 5, max: 8, detail: "Gathering facts, documenting, drafting letters, next steps" },
  { area: "Onboarding & admin", min: 3, max: 6, detail: "Background checks, handbook sign-offs, documents, vendors" },
];

export function HoursChart() {
  const { tip, show, hide } = useTip();
  const W = 640, H = 210, left = 190, right = 30, top = 18, rowH = 50, axisMax = 16;
  const x = (v: number) => left + (v / axisMax) * (W - left - right);
  const ticks = [0, 4, 8, 12, 16];
  const total = HOURS.reduce((a, h) => [a[0] + h.min, a[1] + h.max], [0, 0]);
  return (
    <figure className="chart m-0">
      <div className="chart-head">
        <span className="chart-title">HR hours per week, by type of work</span>
        <span className="chart-sub">Range estimated by HR · total {total[0]}–{total[1]} h/week</span>
      </div>
      <div className="position-relative">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`HR spends ${total[0]} to ${total[1]} hours a week on administration: recruiting 10–15, employee relations 5–8, onboarding 3–6.`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={top - 6} y2={top + rowH * HOURS.length} style={{ stroke: "var(--line)", strokeWidth: 1 }} />
              <text x={x(t)} y={top + rowH * HOURS.length + 18} textAnchor="middle" className="chart-axis">{t}h</text>
            </g>
          ))}
          {HOURS.map((h, i) => {
            const cy = top + i * rowH + rowH / 2;
            const lines = [h.area, `${h.min}–${h.max} hours per week`, h.detail];
            return (
              <g key={h.area}>
                <text x={left - 12} y={cy} textAnchor="end" dominantBaseline="middle" className="chart-label">{h.area}</text>
                {/* full bar to min, lighter extension to max = the range */}
                <rect x={x(0)} y={cy - 11} width={x(h.min) - x(0)} height={22} rx={4} style={{ fill: "var(--c1)" }} />
                <rect x={x(h.min) + 2} y={cy - 11} width={x(h.max) - x(h.min) - 2} height={22} rx={4} style={{ fill: "var(--c1)", opacity: 0.38 }} />
                <text x={x(h.max) + 8} y={cy} dominantBaseline="middle" className="chart-value">{h.min}–{h.max}h</text>
                <rect x={left} y={cy - rowH / 2} width={W - left} height={rowH} fill="transparent" tabIndex={0}
                  onPointerEnter={(e) => show(e, lines)} onPointerLeave={hide} onFocus={(e) => show(e, lines)} onBlur={hide}>
                  <title>{lines.join(" · ")}</title>
                </rect>
              </g>
            );
          })}
        </svg>
        <Tooltip tip={tip} />
      </div>
      <figcaption className="chart-legend">
        <span><i style={{ background: "var(--c1)" }} /> low estimate</span>
        <span><i style={{ background: "var(--c1)", opacity: 0.38 }} /> up to high estimate</span>
      </figcaption>
      <details className="chart-table">
        <summary>Show as table</summary>
        <table className="table table-sm mb-0">
          <thead><tr><th>Type of work</th><th>Low</th><th>High</th></tr></thead>
          <tbody>{HOURS.map((h) => <tr key={h.area}><td>{h.area}</td><td>{h.min} h</td><td>{h.max} h</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}

/* ------------------------------------------------------------------ roadmap gantt */
const PHASES = [
  { name: "Discovery", start: 0, end: 3, ours: true, exit: "Baseline measured, systems and licences confirmed" },
  { name: "Prototype", start: 3, end: 7, ours: true, exit: "HR confirms it matches real work" },
  { name: "Pilot (one HR team)", start: 7, end: 15, ours: true, exit: "Hours down vs baseline, adoption holding" },
  { name: "Production (all HR)", start: 15, end: 19, ours: true, exit: "Security review passed, monitoring live" },
  { name: "Expansion: referrals, knowledge assistant", start: 19, end: 26, ours: true, exit: "New workflows reuse the engine" },
  { name: "Approval for member-level AI", start: 0, end: 20, ours: false, exit: "Run by governing bodies; length unknown" },
];

export function RoadmapGantt() {
  const { tip, show, hide } = useTip();
  const W = 900, left = 270, right = 20, top = 26, rowH = 38, maxW = 26;
  const H = top + rowH * PHASES.length + 30;
  const x = (w: number) => left + (w / maxW) * (W - left - right);
  const ticks = [0, 4, 8, 12, 16, 20, 24];
  return (
    <figure className="chart m-0">
      <div className="chart-head">
        <span className="chart-title">Timeline in weeks</span>
        <span className="chart-sub">Estimates, re-planned after discovery</span>
      </div>
      <div className="position-relative chart-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Roadmap: discovery weeks 0–3, prototype 3–7, pilot 7–15, production 15–19, expansion from week 19. Approval for member-level AI runs in parallel from week 0 with unknown length." style={{ minWidth: 640 }}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={top - 8} y2={top + rowH * PHASES.length} style={{ stroke: "var(--line)", strokeWidth: 1 }} />
              <text x={x(t)} y={top + rowH * PHASES.length + 18} textAnchor="middle" className="chart-axis">wk {t}</text>
            </g>
          ))}
          {PHASES.map((p, i) => {
            const cy = top + i * rowH + rowH / 2;
            const lines = [p.name, `Weeks ${p.start}–${p.end}${p.ours ? "" : "+ (unknown)"}`, `Exit test: ${p.exit}`];
            return (
              <g key={p.name}>
                <text x={left - 12} y={cy} textAnchor="end" dominantBaseline="middle" className="chart-label">{p.name}</text>
                {p.ours ? (
                  <rect x={x(p.start) + 1} y={cy - 10} width={x(p.end) - x(p.start) - 2} height={20} rx={4} style={{ fill: "var(--c1)" }} />
                ) : (
                  <rect x={x(p.start) + 1} y={cy - 10} width={x(p.end) - x(p.start) - 2} height={20} rx={4}
                    style={{ fill: "var(--c2-soft)", stroke: "var(--c2)", strokeWidth: 1.6, strokeDasharray: "5 4" }} />
                )}
                <rect x={left} y={cy - rowH / 2} width={W - left} height={rowH} fill="transparent" tabIndex={0}
                  onPointerEnter={(e) => show(e, lines)} onPointerLeave={hide} onFocus={(e) => show(e, lines)} onBlur={hide}>
                  <title>{lines.join(" · ")}</title>
                </rect>
              </g>
            );
          })}
        </svg>
        <Tooltip tip={tip} />
      </div>
      <figcaption className="chart-legend">
        <span><i style={{ background: "var(--c1)" }} /> our delivery work</span>
        <span><i className="dashed" /> outside approval, runs in parallel</span>
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ tool split (who does the work) */
const SPLIT = [
  { k: "Rules & workflow", n: 6, note: "Tracking, timers, reminders, escalation, reports, data sync" },
  { k: "AI with a human check", n: 3, note: "Drafting messages, policy answers, ER write-ups" },
  { k: "People only", n: 1, note: "Hiring, discipline and eligibility decisions" },
];

export function ToolSplit() {
  const total = SPLIT.reduce((a, s) => a + s.n, 0);
  const { tip, show, hide } = useTip();
  const W = 640, H = 64;
  let acc = 0;
  const fills = ["var(--c1)", "var(--c2)", "var(--muted)"];
  return (
    <figure className="chart m-0">
      <div className="chart-head">
        <span className="chart-title">Of the 10 components, who does the work</span>
        <span className="chart-sub">From the tool-choice table</span>
      </div>
      <div className="position-relative">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Six of ten components use rules and workflow, three use AI with a human check, one is people only.">
          {SPLIT.map((s, i) => {
            const w = (s.n / total) * W;
            const x0 = acc; acc += w;
            const lines = [s.k, `${s.n} of ${total} components`, s.note];
            return (
              <g key={s.k}>
                <rect x={x0 + (i ? 1 : 0)} y={6} width={w - (i ? 2 : 0) - (i === SPLIT.length - 1 ? 0 : 1)} height={30} rx={4} style={{ fill: fills[i] }}
                  tabIndex={0} onPointerEnter={(e) => show(e, lines)} onPointerLeave={hide} onFocus={(e) => show(e, lines)} onBlur={hide}>
                  <title>{lines.join(" · ")}</title>
                </rect>
                {i === SPLIT.length - 1
                  ? <text x={W - 2} y={56} textAnchor="end" className="chart-label">{s.k} · {s.n}</text>
                  : <text x={x0 + 4} y={56} className="chart-label">{s.k} · {s.n}</text>}
              </g>
            );
          })}
        </svg>
        <Tooltip tip={tip} />
      </div>
    </figure>
  );
}
