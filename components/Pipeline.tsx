"use client";

import { useEffect, useState, type ReactNode } from "react";

export type PipelineStep = {
  key: string;
  /** short node label */
  title: string;
  /** one-line caption under the node */
  hint: string;
  /** plain-language explanation for non-technical readers */
  plain: string;
  /** what does it behind the scenes */
  tech: string;
  /** tools used at this step, shown as chips */
  tools?: string[];
  tone?: "pine" | "amber" | "crit" | "muted";
  /** what this node receives, does, and hands on */
  io?: { in: string; does: string; out: string };
  /** example of what this node produces */
  preview?: ReactNode;
};

type Props = {
  steps: PipelineStep[];
  label: string;
  /** shows step numbers; only for real sequences */
  numbered?: boolean;
};

/** Horizontal node pipeline. Click or arrow-key through nodes; Play walks the flow. */
export default function Pipeline({ steps, label, numbered = true }: Props) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setActive((a) => {
        if (a >= steps.length - 1) { setPlaying(false); return a; }
        return a + 1;
      });
    }, 1800);
    return () => clearInterval(t);
  }, [playing, steps.length]);

  const s = steps[active];

  return (
    <div className="pipeline" aria-label={label}>
      <div className="pipeline-track" role="tablist" aria-label={label}>
        {steps.map((st, i) => (
          <div className="pipeline-cell" key={st.key}>
            <button
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`pipeline-node tone-${st.tone ?? "pine"} ${i === active ? "is-active" : ""} ${i < active ? "is-done" : ""}`}
              onClick={(e) => { e.stopPropagation(); setPlaying(false); setActive(i); }}
              onKeyDown={(e) => {
                // keep the deck's arrow keys working; Enter/Space selects
                if (e.key === " ") { e.preventDefault(); e.stopPropagation(); setActive(i); }
              }}
            >
              {numbered && <span className="pipeline-num">{i + 1}</span>}
              {i === steps.length - 1 && st.preview && <span className="pipeline-out-tag">Output</span>}
              <span className="pipeline-title">{st.title}</span>
              <span className="pipeline-hint">{st.hint}</span>
            </button>
            {i < steps.length - 1 && <span className={`pipeline-link ${i < active ? "is-done" : ""}`} aria-hidden="true" />}
          </div>
        ))}
      </div>

      <div className="pipeline-detail" role="tabpanel" aria-live="polite">
        <div className="pipeline-detail-head">
          <span className="label">{numbered ? `Step ${active + 1} of ${steps.length}` : s.title}</span>
          <div className="d-flex gap-2">
            <button type="button" className="btn-deck" onClick={(e) => { e.stopPropagation(); setActive((a) => Math.max(0, a - 1)); setPlaying(false); }} disabled={active === 0} aria-label="Previous step">‹</button>
            <button type="button" className="btn-deck" aria-pressed={playing} onClick={(e) => { e.stopPropagation(); if (active >= steps.length - 1) setActive(0); setPlaying((p) => !p); }}>
              {playing ? "Pause" : "Play flow"}
            </button>
            <button type="button" className="btn-deck" onClick={(e) => { e.stopPropagation(); setActive((a) => Math.min(steps.length - 1, a + 1)); setPlaying(false); }} disabled={active === steps.length - 1} aria-label="Next step">›</button>
          </div>
        </div>
        {s.io && (
          <div className="pipeline-io" aria-label="What this step processes">
            <div><span className="label">Goes in</span><p>{s.io.in}</p></div>
            <span className="pipeline-io-arrow" aria-hidden="true">→</span>
            <div><span className="label">What happens</span><p>{s.io.does}</p></div>
            <span className="pipeline-io-arrow" aria-hidden="true">→</span>
            <div className="is-out"><span className="label">Comes out</span><p>{s.io.out}</p></div>
          </div>
        )}
        <div className="row g-3">
          <div className={`col-12 ${s.preview ? "col-xl-6" : ""}`}>
            <div className="pipeline-plain">
              <span className="label">In plain words</span>
              <p>{s.plain}</p>
            </div>
            <span className="label">Behind the scenes</span>
            <p className="mb-2">{s.tech}</p>
            {s.tools && (
              <div className="d-flex flex-wrap gap-1">
                {s.tools.map((t) => <span className="tool-chip" key={t}>{t}</span>)}
              </div>
            )}
          </div>
          {s.preview && (
            <div className="col-12 col-xl-6">
              <div className="d-flex justify-content-between align-items-baseline mb-1">
                <span className="label">{active === steps.length - 1 ? "Final output · example" : "Output at this step · example"}</span>
                <span className="sample-tag">Example</span>
              </div>
              {s.preview}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
