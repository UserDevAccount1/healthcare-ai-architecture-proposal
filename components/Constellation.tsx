"use client";

import { useEffect, useRef, useState } from "react";
import type * as Three from "three";

type Group = "sources" | "connect" | "track" | "think" | "brain" | "show" | "govern";

type Node = {
  id: string;
  label: string;
  group: Group;
  phase: 1 | 2;
  role: string;
  works: string;
};

const GROUPS: Record<Group, { name: string; center: [number, number, number]; token: string }> = {
  sources: { name: "Where data starts", center: [-15, 2, 0], token: "--muted" },
  connect: { name: "Connect", center: [-8, -3, 4], token: "--c1" },
  track: { name: "Track", center: [-1, 3, -3], token: "--pine" },
  brain: { name: "Company brain", center: [3, -1, 2], token: "--amber" },
  think: { name: "Think (AI)", center: [8, 4, -1], token: "--c2" },
  show: { name: "Where people see it", center: [15, -1, 2], token: "--c1" },
  govern: { name: "Keep it safe", center: [1, -9, -2], token: "--crit" },
};

const NODES: Node[] = [
  { id: "rippling", label: "Rippling", group: "sources", phase: 1, role: "HR and recruiting system of record.", works: "Candidate stage changes start HR follow-ups." },
  { id: "jotform", label: "Jotform", group: "sources", phase: 1, role: "Intake and internal forms.", works: "A new submission creates a work item with a checklist." },
  { id: "ringcentral", label: "RingCentral", group: "sources", phase: 1, role: "Phone calls, recordings, transcripts.", works: "Internal call recordings feed the call-to-report flow; member calls wait for Phase 2." },
  { id: "m365", label: "Outlook · Teams", group: "sources", phase: 1, role: "Email, meetings, Teams transcripts.", works: "Teams meeting transcripts become recaps and action items." },
  { id: "quickbooks", label: "QuickBooks", group: "sources", phase: 1, role: "Accounting.", works: "Finance figures for leadership reports, read-only." },
  { id: "scans", label: "Scans & faxes", group: "sources", phase: 2, role: "Referral packets, consents, paper forms.", works: "OCR turns scanned referral packets into searchable, structured data." },
  { id: "ehr", label: "Healthcare systems", group: "sources", phase: 2, role: "Care management and member records.", works: "APIs or exports to confirm in discovery." },

  { id: "pa", label: "Power Automate", group: "connect", phase: 1, role: "Moves data between tools, runs timers and escalation.", works: "Every reminder, escalation and sync in Phase 1." },
  { id: "custom", label: "Custom connectors", group: "connect", phase: 1, role: "Links to APIs with no standard connector.", works: "Rippling and RingCentral APIs." },
  { id: "rpa", label: "Power Automate Desktop", group: "connect", phase: 1, role: "Screen automation (RPA).", works: "Only for systems with no API or export." },

  { id: "dataverse", label: "Dataverse", group: "track", phase: 1, role: "Secure tables for work items, templates and history.", works: "The one shared record of what is waiting and on whom." },
  { id: "sharepoint", label: "SharePoint", group: "track", phase: 1, role: "Documents, policy library, generated reports.", works: "Stores filled report templates (PDF) and approved policies." },

  { id: "brain", label: "Company brain", group: "brain", phase: 1, role: "Organizational memory: decisions, recaps, commitments, owners, lessons.", works: "Feeds the CEO brief, onboarding and consistent answers. No PHI." },
  { id: "gbrain", label: "GBrain (option)", group: "brain", phase: 1, role: "Open-source, self-hosted agent memory (Markdown + Postgres).", works: "Option to evaluate for agent memory; Microsoft-native is the default." },

  { id: "copilot", label: "Copilot Studio", group: "think", phase: 1, role: "Builds the AI agents published in Teams.", works: "HR assistant, policy assistant, chief-of-staff brief." },
  { id: "aoai", label: "Azure OpenAI", group: "think", phase: 1, role: "The language models behind the agents.", works: "Drafting, summarizing, extracting fields from transcripts." },
  { id: "search", label: "Azure AI Search (RAG)", group: "think", phase: 1, role: "Finds the right passages before the AI answers.", works: "Cited answers from policies, recaps and, in Phase 2, member documents." },
  { id: "speech", label: "Azure AI Speech", group: "think", phase: 1, role: "Turns recordings into text if no transcript exists.", works: "Fallback when RingCentral transcription is not enabled." },
  { id: "ocr", label: "OCR", group: "think", phase: 2, role: "Reads scanned documents: Azure AI Document Intelligence, or self-hosted Unlimited-OCR.", works: "Referral packets, consents, faxed records." },

  { id: "teams", label: "Teams", group: "show", phase: 1, role: "Where staff talk to agents and get reminders.", works: "Reminders, approvals, policy questions." },
  { id: "apps", label: "Power Apps", group: "show", phase: 1, role: "Work-queue app.", works: "HR and intake queues with aging and owners." },
  { id: "pbi", label: "Power BI", group: "show", phase: 1, role: "Reports and the stuck-work view.", works: "Leadership trends without manual dashboards." },
  { id: "reports", label: "Report PDFs", group: "show", phase: 1, role: "Filled templates generated from calls and meetings.", works: "Consistent call and meeting reports, saved to SharePoint." },

  { id: "entra", label: "Entra ID", group: "govern", phase: 1, role: "Single sign-on, MFA, security groups.", works: "One login; groups drive every permission." },
  { id: "purview", label: "Purview DLP", group: "govern", phase: 1, role: "Data-loss prevention and audit.", works: "Blocks PHI from reaching AI in Phase 1." },
  { id: "alm", label: "DEV · QA · PROD", group: "govern", phase: 1, role: "Release pipelines with approvals.", works: "Every change tested before staff see it." },
  { id: "phigate", label: "PHI gate", group: "govern", phase: 2, role: "Separate environment and field allowlist for member data.", works: "Opens only after governing-body approval." },
];

const EDGES: [string, string][] = [
  ["rippling", "custom"], ["jotform", "pa"], ["ringcentral", "custom"], ["m365", "pa"], ["quickbooks", "pa"], ["scans", "ocr"], ["ehr", "rpa"],
  ["custom", "pa"], ["rpa", "pa"], ["pa", "dataverse"], ["pa", "sharepoint"],
  ["dataverse", "brain"], ["sharepoint", "brain"], ["brain", "gbrain"],
  ["ringcentral", "speech"], ["speech", "aoai"], ["ocr", "search"], ["sharepoint", "search"], ["brain", "search"],
  ["search", "copilot"], ["aoai", "copilot"], ["copilot", "teams"], ["dataverse", "apps"], ["dataverse", "pbi"], ["brain", "pbi"],
  ["aoai", "reports"], ["reports", "sharepoint"],
  ["entra", "copilot"], ["entra", "dataverse"], ["purview", "aoai"], ["alm", "pa"], ["phigate", "ocr"], ["phigate", "ehr"],
];

const SPREAD = 1.75;

function seeded(i: number) {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export default function Constellation() {
  const host = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<Node | null>(NODES.find((n) => n.id === "brain") ?? null);
  const [failed, setFailed] = useState(false);
  const selectRef = useRef<(id: string | null) => void>(() => {});

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const el = host.current;
      if (!el) return;
      try {
        const THREE = await import("three");
        const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
        const { CSS2DRenderer, CSS2DObject } = await import("three/addons/renderers/CSS2DRenderer.js");
        if (disposed) return;

        const css = () => getComputedStyle(document.documentElement);
        const color = (token: string) => new THREE.Color(css().getPropertyValue(token).trim() || "#888");

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        el.appendChild(renderer.domElement);
        const labels = new CSS2DRenderer();
        labels.domElement.className = "constellation-labels";
        el.appendChild(labels.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 400);
        camera.position.set(0, 6, 64);

        const controls = new OrbitControls(camera, labels.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.minDistance = 18;
        controls.maxDistance = 120;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        controls.autoRotate = !reduce;
        controls.autoRotateSpeed = 0.5;

        // star field
        const starGeo = new THREE.BufferGeometry();
        const pts: number[] = [];
        for (let i = 0; i < 700; i++) {
          const r = 70 + seeded(i) * 90, t = seeded(i + 1000) * Math.PI * 2, p = Math.acos(2 * seeded(i + 2000) - 1);
          pts.push(r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t));
        }
        starGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
        const starMat = new THREE.PointsMaterial({ size: 0.5, transparent: true, opacity: 0.55, color: color("--muted") });
        scene.add(new THREE.Points(starGeo, starMat));

        // nodes
        const pos = new Map<string, Three.Vector3>();
        const meshes: Three.Mesh[] = [];
        const labelEls = new Map<string, HTMLDivElement>();
        const groupCount: Record<string, number> = {};
        const sphere = new THREE.SphereGeometry(1, 24, 16);
        const halo = new THREE.SphereGeometry(1, 16, 12);
        NODES.forEach((n, i) => {
          const g = GROUPS[n.group];
          const k = (groupCount[n.group] = (groupCount[n.group] ?? 0) + 1) - 1;
          const ang = k * 2.39996; // golden angle spiral inside the cluster
          const rad = n.group === "brain" && k === 0 ? 0 : 3 + k * 1.1;
          const v = new THREE.Vector3(
            g.center[0] * SPREAD + Math.cos(ang) * rad,
            g.center[1] * SPREAD + Math.sin(ang) * rad,
            g.center[2] * SPREAD + (seeded(i) - 0.5) * 5,
          );
          pos.set(n.id, v);
          const size = n.id === "brain" ? 1.5 : 0.65;
          const mat = new THREE.MeshBasicMaterial({ color: color(g.token) });
          const m = new THREE.Mesh(sphere, mat);
          m.scale.setScalar(size);
          m.position.copy(v);
          m.userData.id = n.id;
          scene.add(m);
          meshes.push(m);
          const h = new THREE.Mesh(halo, new THREE.MeshBasicMaterial({ color: color(g.token), transparent: true, opacity: n.phase === 2 ? 0.08 : 0.16 }));
          h.scale.setScalar(size * 1.7);
          h.position.copy(v);
          scene.add(h);
          m.userData.halo = h;

          const div = document.createElement("div");
          div.className = `constellation-label ${n.phase === 2 ? "is-phase2" : ""} ${n.id === "brain" ? "is-brain" : ""}`;
          div.textContent = n.label;
          div.addEventListener("pointerdown", (e) => { e.stopPropagation(); selectRef.current(n.id); });
          const obj = new CSS2DObject(div);
          obj.position.set(0, size + 0.9, 0);
          m.add(obj);
          labelEls.set(n.id, div);
        });

        // cluster titles
        (Object.keys(GROUPS) as Group[]).forEach((gk) => {
          const g = GROUPS[gk];
          const div = document.createElement("div");
          div.className = "constellation-group";
          div.textContent = g.name;
          const obj = new CSS2DObject(div);
          obj.position.set(g.center[0] * SPREAD, g.center[1] * SPREAD + 9, g.center[2] * SPREAD);
          scene.add(obj);
        });

        // edges
        const edgeGeo = new THREE.BufferGeometry();
        const ep: number[] = [];
        EDGES.forEach(([a, b]) => { const A = pos.get(a)!, B = pos.get(b)!; ep.push(A.x, A.y, A.z, B.x, B.y, B.z); });
        edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(ep, 3));
        const edgeMat = new THREE.LineBasicMaterial({ color: color("--muted"), transparent: true, opacity: 0.35 });
        scene.add(new THREE.LineSegments(edgeGeo, edgeMat));

        const hiGeo = new THREE.BufferGeometry();
        const hiMat = new THREE.LineBasicMaterial({ color: color("--amber"), transparent: true, opacity: 0.95 });
        const hiLines = new THREE.LineSegments(hiGeo, hiMat);
        scene.add(hiLines);

        // travelling pulses along edges
        const pulseGeo = new THREE.SphereGeometry(0.18, 8, 6);
        const pulseMat = new THREE.MeshBasicMaterial({ color: color("--c1") });
        const pulses = EDGES.map(([a, b], i) => {
          const m = new THREE.Mesh(pulseGeo, pulseMat);
          m.userData = { a: pos.get(a)!, b: pos.get(b)!, t: seeded(i + 500) };
          scene.add(m);
          return m;
        });

        const select = (id: string | null) => {
          const n = NODES.find((x) => x.id === id) ?? null;
          setSel(n);
          const hp: number[] = [];
          EDGES.forEach(([a, b]) => {
            if (a === id || b === id) { const A = pos.get(a)!, B = pos.get(b)!; hp.push(A.x, A.y, A.z, B.x, B.y, B.z); }
          });
          hiGeo.setAttribute("position", new THREE.Float32BufferAttribute(hp, 3));
          labelEls.forEach((d, k) => d.classList.toggle("is-selected", k === id));
        };
        selectRef.current = select;
        select("brain");

        // picking
        const ray = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let downAt = 0;
        const onDown = () => { downAt = performance.now(); };
        const onUp = (e: PointerEvent) => {
          if (performance.now() - downAt > 250) return; // a drag, not a click
          const r = labels.domElement.getBoundingClientRect();
          mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
          ray.setFromCamera(mouse, camera);
          const hit = ray.intersectObjects(meshes)[0];
          if (hit) select(hit.object.userData.id as string);
        };
        labels.domElement.addEventListener("pointerdown", onDown);
        labels.domElement.addEventListener("pointerup", onUp);

        const resize = () => {
          const w = el.clientWidth, h = el.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h);
          labels.setSize(w, h);
          camera.aspect = w / h;
          camera.position.z = w < 600 ? 96 : 64;
          camera.updateProjectionMatrix();
        };
        const ro = new ResizeObserver(resize);
        ro.observe(el);
        resize();

        // re-read theme colors when the scheme changes
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const recolor = () => {
          meshes.forEach((m) => {
            const n = NODES.find((x) => x.id === m.userData.id)!;
            const c = color(GROUPS[n.group].token);
            (m.material as Three.MeshBasicMaterial).color = c;
            ((m.userData.halo as Three.Mesh).material as Three.MeshBasicMaterial).color = c;
          });
          edgeMat.color = color("--muted"); starMat.color = color("--muted"); hiMat.color = color("--amber"); pulseMat.color = color("--c1");
        };
        mq.addEventListener("change", recolor);

        let raf = 0;
        const clock = new THREE.Clock();
        const tick = () => {
          raf = requestAnimationFrame(tick);
          const active = el.closest(".slide")?.classList.contains("is-active") ?? true;
          if (!active) return;
          const dt = clock.getDelta();
          if (!reduce) pulses.forEach((p) => {
            p.userData.t = (p.userData.t + dt * 0.25) % 1;
            p.position.lerpVectors(p.userData.a, p.userData.b, p.userData.t);
          });
          controls.update();
          renderer.render(scene, camera);
          labels.render(scene, camera);
        };
        tick();

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          mq.removeEventListener("change", recolor);
          controls.dispose();
          renderer.dispose();
          scene.traverse((o) => {
            const m = o as Three.Mesh;
            if (m.geometry) m.geometry.dispose();
            const mat = m.material as Three.Material | undefined;
            if (mat) mat.dispose();
          });
          el.innerHTML = "";
        };
      } catch {
        setFailed(true);
      }
    })();

    return () => { disposed = true; cleanup(); };
  }, []);

  return (
    <div className="constellation-wrap">
      <div className="constellation" ref={host} aria-label="3D map of the architecture. Drag to rotate, scroll to zoom, click a node for details.">
        {failed && (
          <div className="p-3">
            <p className="mb-2">3D view isn&rsquo;t available in this browser. The same map as a list:</p>
            <ul>{NODES.map((n) => <li key={n.id}><b>{n.label}</b> ({GROUPS[n.group].name}): {n.role}</li>)}</ul>
          </div>
        )}
      </div>
      <aside className="constellation-card" aria-live="polite">
        {sel ? (
          <>
            <span className="label">{GROUPS[sel.group].name}</span>
            <h3 className="mt-1">{sel.label}</h3>
            <p className="mb-2">{sel.role}</p>
            <span className="label">Where it may work</span>
            <p className="mb-2">{sel.works}</p>
            <span className={`chip ${sel.phase === 1 ? "now" : "gate"}`}>{sel.phase === 1 ? "Phase 1 · now" : "Phase 2 · after approval"}</span>
            <p className="mt-3 mb-1 label">Connected to</p>
            <div className="d-flex flex-wrap gap-1">
              {EDGES.filter(([a, b]) => a === sel.id || b === sel.id).map(([a, b]) => {
                const other = NODES.find((n) => n.id === (a === sel.id ? b : a))!;
                return <button type="button" key={other.id} className="tool-chip" onClick={() => selectRef.current(other.id)}>{other.label}</button>;
              })}
            </div>
          </>
        ) : <p>Click a node.</p>}
        <p className="mt-3 mb-0 text-body-secondary" style={{ fontSize: ".78rem" }}>Drag to rotate · scroll to zoom · dim labels are Phase 2</p>
      </aside>
    </div>
  );
}
