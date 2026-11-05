import type { SlideDef } from "./types";
import Pipeline, { type PipelineStep } from "@/components/Pipeline";
import { ChatMock, ListMock, RecordMock, TextMock, BarsMock } from "@/components/Mocks";

const nurture: PipelineStep[] = [
  {
    key: "applied", title: "Applied", hint: "Thank-you within hours",
    plain: "Every applicant hears back the same day, so nobody wonders whether their application arrived.",
    tech: "A Rippling “new applicant” event starts a Power Automate flow, which sends a templated email (and an SMS if the candidate opted in).",
    tools: ["Rippling", "Power Automate", "Outlook", "RingCentral SMS"],
    io: { in: "New application in Rippling", does: "Sends a thank-you message and creates a candidate journey record", out: "Candidate acknowledged; journey started" },
    preview: <TextMock where="Email · to Alex R." title="Thanks for applying, Alex" lines={["We received your application for Care Coordinator. Our team reviews applications within 3 business days, and we'll be in touch either way.", "Prefer text updates? Reply YES to 555-0142."]} />,
  },
  {
    key: "screen", title: "Screening", hint: "Book a time without phone tag",
    plain: "Candidates who pass the first review get a link to pick an interview time, instead of days of back-and-forth calls.",
    tech: "Stage change to “Screen” sends a booking link (Microsoft Bookings), and a reminder goes out 24 hours before.",
    tools: ["Microsoft Bookings", "Power Automate"],
    io: { in: "Stage moved to Screen", does: "Sends a booking link and reminders", out: "Interview on both calendars" },
    preview: <ChatMock where="SMS · to Alex R." from="Care team hiring" time="Tue 10:05 AM" text="Hi Alex, we'd love to talk about the Care Coordinator role. Pick a 20-min time that works for you: book.example.org/alex  Reply STOP to opt out." />,
  },
  {
    key: "prep", title: "Interview prep", hint: "Know what to expect",
    plain: "Before the interview, candidates get a short note on who they'll meet, how long it takes and how to join, by phone or in person.",
    tech: "Template email with interviewer names, address or phone dial-in. Copilot drafts a short personal opening line, and HR approves it.",
    tools: ["Outlook", "Copilot Studio (draft)"],
    io: { in: "Confirmed interview", does: "Sends prep details; a draft personal line waits for HR approval", out: "A prepared candidate" },
    preview: <TextMock where="Email · to Alex R." title="Your interview on Monday at 10:00" lines={["You'll meet Sam K. (Program Manager) and Priya N. (Care Lead) for about 45 minutes.", "Join by video or by phone at 555-0199. No computer needed.", "Questions? Just reply to this email."]} />,
  },
  {
    key: "waiting", title: "No ghosting", hint: "Updates while we decide",
    plain: "While the team decides, the candidate gets a short status update every few days. Silence is where good candidates are lost to other offers.",
    tech: "A timer sends an update if the stage hasn't changed in 3 business days, and nudges the hiring manager in Teams at the same time.",
    tools: ["Power Automate timers", "Teams", "Outlook"], tone: "amber",
    io: { in: "No stage change for 3 business days", does: "Sends the candidate an update and nudges the hiring manager", out: "Candidate kept warm; manager reminded" },
    preview: <>
      <ChatMock where="SMS · to Alex R." from="Care team hiring" time="Thu 9:00 AM" text="Hi Alex, quick update: we're finishing interviews this week and expect to be in touch by Monday. Thanks for your patience!" />
      <ChatMock where="Teams · HR Follow-up" from="HR Follow-up" time="Thu 9:00 AM" card={{ title: "Alex R. is waiting on your decision", tone: "amber", facts: [["Interviewed", "Mon"], ["Waiting", "3 days"]], actions: ["Record decision", "Need more time"] }} />
    </>,
  },
  {
    key: "offer", title: "Offer & references", hint: "Fast, clear next steps",
    plain: "References and the offer move quickly, and the candidate always knows the next step and the date.",
    tech: "Reference requests are sent and chased automatically. The offer letter comes from Rippling; HR reviews it before sending.",
    tools: ["Rippling", "Power Automate", "Outlook"],
    io: { in: "Decision: make an offer", does: "Chases references, prepares the offer for HR review", out: "Offer sent with a clear reply date" },
    preview: <ListMock where="Candidate journey · Alex R." title="Offer stage" rows={[{ l: "Reference 1 · M. Diaz", badge: "Received" }, { l: "Reference 2 · T. Nguyen", badge: "Reminder sent", tone: "warn" }, { l: "Offer letter", badge: "Waiting HR review", tone: "warn" }]} />,
  },
  {
    key: "preboard", title: "Pre-boarding", hint: "Welcome before day one",
    plain: "Between “yes” and day one, the new hire gets a welcome, a checklist and a named contact, so fewer people drop out before starting.",
    tech: "The onboarding template creates checklist items: background check, documents, handbook sign-off. Progress shows in the HR queue.",
    tools: ["Dataverse checklist", "Power Automate", "Rippling"],
    io: { in: "Offer accepted", does: "Starts the onboarding checklist and the welcome series", out: "New hire ready on day one" },
    preview: <RecordMock where="Onboarding · Alex R." title="Starts Monday, Nov 17" status="4 of 6 done" fields={[["Background check", "✓ Cleared"], ["Documents", "✓ Received"], ["Handbook sign-off", "Waiting"], ["Equipment", "✓ Ordered"], ["Buddy", "Priya N."], ["Day-one contact", "Dana (HR)"]]} />,
  },
  {
    key: "checkin", title: "30 · 60 · 90 days", hint: "Early check-ins",
    plain: "Short check-ins in the first three months catch problems early, while there's still time to fix them.",
    tech: "Scheduled one-question pulse (Teams or SMS). Low scores create a work item for the supervisor and HR.",
    tools: ["Microsoft Forms", "Teams", "Power Automate"],
    io: { in: "30, 60 and 90 days after start", does: "Sends a short pulse; low scores alert the supervisor", out: "Early warnings before someone quits" },
    preview: <ChatMock where="Teams · Chat with HR" from="HR" time="Day 30" card={{ title: "How's your first month going?", body: "1 = rough, 5 = great. Your answer goes to HR only.", actions: ["1", "2", "3", "4", "5"] }} />,
  },
  {
    key: "pool", title: "Talent pool", hint: "Not now ≠ not ever",
    plain: "Strong candidates who weren't hired this time stay in a talent pool and are invited back first when a similar role opens.",
    tech: "Tagged in Rippling as “silver medalist” with consent. A new opening for the same role family triggers a personal invite (AI draft, HR approves).",
    tools: ["Rippling tags", "Power Automate", "Copilot Studio (draft)"],
    io: { in: "New opening + consented pool", does: "Matches by role family and drafts personal invites", out: "Warm candidates re-engaged before posting the job" },
    preview: <>
      <TextMock where="Email · to Jordan P. (talent pool)" title="A role we thought of you for" lines={["Hi Jordan, you interviewed with us for Care Coordinator in August and the team was impressed. A similar role just opened. Would you like to talk?"]} />
      <BarsMock where="Power BI · Hiring funnel" title="Where candidates drop out (example)" bars={[["No reply after apply", 18], ["Waiting on decision", 11], ["Offer to day one", 4]]} unit="%" />
    </>,
  },
];

function Plain({ children }: { children: React.ReactNode }) {
  return <div className="plain"><span className="label">In plain words</span><p>{children}</p></div>;
}

export const nurtureSlide: SlideDef = {
  id: "nurture",
  section: "Candidate nurturing",
  title: "Candidate nurturing pipeline, no CRM needed",
  content: (
    <>
      <header className="d-flex flex-column gap-2">
        <div className="eyebrow"><span>Candidate nurturing pipeline</span><span className="q">HR admin load · Problem 3</span></div>
        <h2>Keep every candidate warm, without buying a CRM</h2>
        <p className="lede">A HubSpot-style journey built from Rippling, Power Automate, Outlook and SMS. Messages go out on time automatically, and HR only steps in for decisions and approvals.</p>
      </header>
      <Pipeline steps={nurture} label="Candidate nurturing pipeline" />
      <div className="row g-2" style={{ fontSize: ".88em" }}>
        <div className="col-12 col-lg-4"><div className="panel h-100"><span className="label">How it helps candidates</span><p className="mt-1 mb-0">They always know where they stand and what&rsquo;s next, can book times themselves, and can choose email, text or a phone call.</p></div></div>
        <div className="col-12 col-lg-4"><div className="panel h-100"><span className="label">How it helps HR</span><p className="mt-1 mb-0">Status updates, reminders and reference chasing are automatic. HR approves drafts and makes decisions instead of chasing people, the biggest part of the 10–15 recruiting hours a week.</p></div></div>
        <div className="col-12 col-lg-4"><div className="panel is-signal h-100"><span className="label">Guardrails</span><p className="mt-1 mb-0">SMS only with opt-in and an easy STOP. Talent-pool use needs the candidate&rsquo;s consent. AI drafts are approved by HR before candidates see them. No hiring decision is automated.</p></div></div>
      </div>
      <Plain>Candidates hear from us at every step, so they don&rsquo;t drift to other offers, and HR stops spending hours on &ldquo;just checking in&rdquo; messages.</Plain>
    </>
  ),
};
