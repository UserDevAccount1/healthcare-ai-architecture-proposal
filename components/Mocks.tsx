/* Illustrative output previews shown inside pipeline nodes. Example data only. */
import type { ReactNode } from "react";

export type Card = {
  title: string;
  facts?: [string, string][];
  body?: string;
  note?: string;
  actions?: string[];
  tone?: "pine" | "amber" | "crit";
};

export function ChatMock({ where, from, time = "9:02 AM", text, card }: { where: string; from: string; time?: string; text?: string; card?: Card }) {
  return (
    <div className="mock mock-chat">
      <div className="mock-bar"><span className="mock-dot" />{where}</div>
      <div className="mock-msg">
        <div className="mock-avatar" aria-hidden="true">{from.slice(0, 1)}</div>
        <div className="mock-msg-body">
          <div className="mock-from"><b>{from}</b> <span>{time}</span></div>
          {text && <p className="mb-1">{text}</p>}
          {card && (
            <div className={`mock-card tone-${card.tone ?? "pine"}`}>
              <div className="mock-card-title">{card.title}</div>
              {card.body && <p className="mb-1">{card.body}</p>}
              {card.facts && <dl>{card.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
              {card.note && <p className="mock-note">{card.note}</p>}
              {card.actions && <div className="mock-actions">{card.actions.map((a, i) => <span key={a} className={i === 0 ? "primary" : ""}>{a}</span>)}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function RecordMock({ where, title, fields, status }: { where: string; title: string; fields: [string, string][]; status?: string }) {
  return (
    <div className="mock">
      <div className="mock-bar"><span className="mock-dot" />{where}</div>
      <div className="mock-pad">
        <div className="d-flex justify-content-between align-items-baseline gap-2 mb-1">
          <b>{title}</b>{status && <span className="mock-status">{status}</span>}
        </div>
        <dl className="mock-fields">{fields.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      </div>
    </div>
  );
}

export function ListMock({ where, title, rows }: { where: string; title?: string; rows: { l: ReactNode; r?: ReactNode; badge?: string; tone?: "ok" | "warn" | "crit" | "muted" }[] }) {
  return (
    <div className="mock">
      <div className="mock-bar"><span className="mock-dot" />{where}</div>
      <div className="mock-pad">
        {title && <b className="d-block mb-1">{title}</b>}
        <ul className="mock-list">
          {rows.map((r, i) => (
            <li key={i}>
              <span className="l">{r.l}</span>
              {r.r && <span className="r">{r.r}</span>}
              {r.badge && <span className={`mock-badge ${r.tone ?? "ok"}`}>{r.badge}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function BarsMock({ where, title, bars, unit = "" }: { where: string; title: string; bars: [string, number][]; unit?: string }) {
  const max = Math.max(...bars.map((b) => b[1]));
  return (
    <div className="mock">
      <div className="mock-bar"><span className="mock-dot" />{where}</div>
      <div className="mock-pad">
        <b className="d-block mb-2">{title}</b>
        <div className="mock-bars">
          {bars.map(([k, v]) => (
            <div key={k} className="mock-bars-row">
              <span className="k">{k}</span>
              <span className="track"><span style={{ width: `${(v / max) * 100}%` }} /></span>
              <span className="v">{v}{unit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TextMock({ where, title, lines, mono }: { where: string; title?: string; lines: string[]; mono?: boolean }) {
  return (
    <div className="mock">
      <div className="mock-bar"><span className="mock-dot" />{where}</div>
      <div className={`mock-pad ${mono ? "mock-mono" : ""}`}>
        {title && <b className="d-block mb-1">{title}</b>}
        {lines.map((l, i) => <p key={i} className="mb-1">{l}</p>)}
      </div>
    </div>
  );
}

/** two previews side by side (e.g. before/after) */
export function Pair({ a, b }: { a: ReactNode; b: ReactNode }) {
  return <div className="mock-pair">{a}{b}</div>;
}
