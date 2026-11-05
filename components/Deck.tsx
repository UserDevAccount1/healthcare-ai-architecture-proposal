"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SlideDef } from "@/slides/types";

type Props = { slides: SlideDef[] };

function readHash(total: number): number {
  if (typeof window === "undefined") return 0;
  const n = parseInt(window.location.hash.replace(/^#\/?/, ""), 10);
  return Number.isFinite(n) && n >= 1 && n <= total ? n - 1 : 0;
}

export default function Deck({ slides }: Props) {
  const total = slides.length;
  const [idx, setIdx] = useState(0);
  const [notes, setNotes] = useState(false);
  const [overview, setOverview] = useState(false);
  const [print, setPrint] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (n: number) => setIdx(Math.max(0, Math.min(total - 1, n))),
    [total]
  );

  // hash <-> index
  useEffect(() => {
    setIdx(readHash(total));
    const onHash = () => setIdx(readHash(total));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [total]);

  useEffect(() => {
    const want = `#${idx + 1}`;
    if (window.location.hash !== want) history.replaceState(null, "", want);
    document.title = `${idx + 1}. ${slides[idx].title} · Care Ops AI Roadmap`;
  }, [idx, slides]);

  useEffect(() => {
    document.documentElement.classList.toggle("print-mode", print);
  }, [print]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.closest("input, textarea, select, summary") || (el.closest("button") && (e.key === " " || e.key === "Enter")))) return;
      const k = e.key;
      if (["ArrowRight", "PageDown", " "].includes(k)) { e.preventDefault(); go(idx + 1); }
      else if (["ArrowLeft", "PageUp"].includes(k)) { e.preventDefault(); go(idx - 1); }
      else if (k === "Home") go(0);
      else if (k === "End") go(total - 1);
      else if (k === "Escape" || k === "o" || k === "O") setOverview((v) => !v);
      else if (k === "n" || k === "N") setNotes((v) => !v);
      else if (k === "p" || k === "P") setPrint((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, go, total]);

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 60) go(idx + (dx < 0 ? 1 : -1));
    touchX.current = null;
  };

  const s = slides[idx];

  return (
    <div className="deck">
      <div className="deck-progress" aria-hidden="true">
        <span style={{ width: `${((idx + 1) / total) * 100}%` }} />
      </div>

      <main className="deck-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {slides.map((sl, i) => (
          <section
            key={sl.id}
            className={`slide ${i === idx ? "is-active" : ""} ${i < idx ? "is-past" : ""}`}
            aria-hidden={!print && i !== idx}
            aria-label={`Slide ${i + 1}: ${sl.title}`}
          >
            <div className="slide-inner">{sl.content}</div>
          </section>
        ))}

        {notes && !print && (
          <aside className="notes-panel" aria-label="Speaker notes">
            <h3>Speaker notes · {idx + 1}</h3>
            {s.notes.map((p, i) => <p key={i} className="mb-2">{p}</p>)}
          </aside>
        )}

        {overview && (
          <div className="overview" role="dialog" aria-label="All slides">
            <div className="overview-grid">
              {slides.map((sl, i) => (
                <button
                  key={sl.id}
                  type="button"
                  className={`overview-card ${i === idx ? "is-current" : ""}`}
                  onClick={() => { go(i); setOverview(false); }}
                >
                  <span className="n">{sl.section}</span>
                  <span className="t">{sl.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <nav className="deck-bar" aria-label="Slide controls">
          <button type="button" className="btn-deck" onClick={() => go(idx - 1)} disabled={idx === 0} aria-label="Previous slide">←</button>
          <button type="button" className="btn-deck" onClick={() => go(idx + 1)} disabled={idx === total - 1} aria-label="Next slide">→</button>
          <span className="count">{String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          <span className="title">{s.section} · {s.title}</span>
          <button type="button" className="btn-deck" aria-pressed={overview} onClick={() => setOverview((v) => !v)}>Slides</button>
          <button type="button" className="btn-deck" aria-pressed={notes} onClick={() => setNotes((v) => !v)}>Notes</button>
          <button type="button" className="btn-deck d-none d-md-inline-block" aria-pressed={print} onClick={() => setPrint((v) => !v)}>Print view</button>
          <span className="kbd d-none d-lg-inline">←/→ · O · N · P</span>
        </nav>
      </main>
    </div>
  );
}
