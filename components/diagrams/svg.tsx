import type { CSSProperties, ReactNode } from "react";

export type Tone = "plain" | "pine" | "amber" | "muted" | "crit";

const toneStyle: Record<Tone, { fill: string; stroke: string; text: string }> = {
  plain: { fill: "var(--surface)", stroke: "var(--line)", text: "var(--fg)" },
  pine: { fill: "var(--pine-soft)", stroke: "var(--pine)", text: "var(--fg)" },
  amber: { fill: "var(--amber-soft)", stroke: "var(--amber)", text: "var(--fg)" },
  muted: { fill: "var(--surface-2)", stroke: "var(--line)", text: "var(--muted)" },
  crit: { fill: "var(--crit-soft)", stroke: "var(--crit)", text: "var(--fg)" },
};

export function Defs() {
  return (
    <defs>
      <marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
      </marker>
      <marker id="arw-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" style={{ fill: "var(--amber)" }} />
      </marker>
    </defs>
  );
}

type BoxProps = {
  x: number; y: number; w: number; h: number;
  lines: string[];
  tone?: Tone;
  dashed?: boolean;
  bold?: boolean;
  size?: number;
};

/** Rounded box with centered multi-line label. */
export function Box({ x, y, w, h, lines, tone = "plain", dashed, bold, size = 13 }: BoxProps) {
  const t = toneStyle[tone];
  const lh = size * 1.3;
  const startY = y + h / 2 - ((lines.length - 1) * lh) / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6}
        style={{ fill: t.fill, stroke: t.stroke, strokeWidth: 1.4, strokeDasharray: dashed ? "5 4" : undefined }} />
      {lines.map((l, i) => (
        <text key={i} x={x + w / 2} y={startY + i * lh} textAnchor="middle" dominantBaseline="middle"
          style={{ fill: i === 0 ? t.text : "var(--muted)", fontSize: i === 0 ? size : size - 1.5, fontWeight: i === 0 && bold !== false ? 600 : 400, fontFamily: "var(--font-body)" }}>
          {l}
        </text>
      ))}
    </g>
  );
}

export function Label({ x, y, children, anchor = "middle", size = 11, style }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; size?: number; style?: CSSProperties }) {
  return (
    <text x={x} y={y} textAnchor={anchor}
      style={{ fill: "var(--muted)", fontSize: size, fontFamily: "var(--font-mono)", letterSpacing: "0.04em", ...style }}>
      {children}
    </text>
  );
}

/** Straight arrow with an optional label above its midpoint. */
export function Arrow({ x1, y1, x2, y2, label, amber, dashed, labelDy = -7 }: { x1: number; y1: number; x2: number; y2: number; label?: string; amber?: boolean; dashed?: boolean; labelDy?: number }) {
  return (
    <g style={{ color: amber ? "var(--amber)" : "var(--muted)" }}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={1.6}
        strokeDasharray={dashed ? "5 4" : undefined} markerEnd={amber ? "url(#arw-amber)" : "url(#arw)"} />
      {label && <Label x={(x1 + x2) / 2} y={(y1 + y2) / 2 + labelDy} style={amber ? { fill: "var(--amber)" } : undefined}>{label}</Label>}
    </g>
  );
}

export function Figure({ label, caption, viewBox, children }: { label: string; caption: string; viewBox: string; children: ReactNode }) {
  return (
    <figure className="diagram">
      <svg viewBox={viewBox} role="img" aria-label={label} xmlns="http://www.w3.org/2000/svg">
        <Defs />
        {children}
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
