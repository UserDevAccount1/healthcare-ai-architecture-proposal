/* What each pipeline node takes in, does, and produces, plus an example of its output.
   All names and figures are fictional examples. */
import type { ReactNode } from "react";
import type { PipelineStep } from "@/components/Pipeline";
import { BarsMock, ChatMock, ListMock, Pair, RecordMock, TextMock } from "@/components/Mocks";

type Out = { io: { in: string; does: string; out: string }; preview?: ReactNode };

export function withOutputs(steps: PipelineStep[], map: Record<string, Out>): PipelineStep[] {
  return steps.map((s) => ({ ...s, ...(map[s.key] ?? {}) }));
}

/* ------------------------------------------------------------------ follow-up journey (interview feedback example) */
export const followUpOut: Record<string, Out> = {
  happens: {
    io: { in: "Rippling: candidate Alex R. moved to “Interviewed”", does: "Power Automate flow starts and reads the interviewers", out: "A trigger event with candidate, role and interviewers" },
    preview: <RecordMock where="Power Automate · flow run" title="Trigger received" status="Running"
      fields={[["Source", "Rippling"], ["Event", "Stage changed → Interviewed"], ["Candidate", "Alex R."], ["Role", "Care Coordinator"], ["Interviewers", "Sam K., Priya N."], ["Time", "Mon 9:02 AM"]]} />,
  },
  logged: {
    io: { in: "Trigger event", does: "Picks the “Interview feedback” template and creates one item per interviewer", out: "2 work items in Dataverse" },
    preview: <ListMock where="Dataverse · Work items" title="New items"
      rows={[{ l: "WI-1042 · Feedback: Alex R. (Sam K.)", badge: "Open" }, { l: "WI-1043 · Feedback: Alex R. (Priya N.)", badge: "Open" }]} />,
  },
  owner: {
    io: { in: "New work item + template rules", does: "Sets owner, due date (48 business hours) and escalation path", out: "Item with a named owner and a clock running" },
    preview: <RecordMock where="Dataverse · WI-1042" title="Interview feedback · Alex R." status="Waiting on owner"
      fields={[["Owner", "Sam K. (Hiring manager)"], ["Waiting on", "Internal"], ["Due", "Wed 5:00 PM"], ["Turnaround", "48 business hours"], ["Escalates to", "Sam's manager → HR lead"]]} />,
  },
  remind: {
    io: { in: "Item at 75% of its time", does: "Copilot Studio drafts a short reminder from the item fields; flow posts it", out: "A Teams message to the owner with one-click actions" },
    preview: <ChatMock where="Teams · Chat with HR Follow-up" from="HR Follow-up" time="Tue 2:00 PM"
      card={{ title: "Interview feedback due tomorrow", tone: "amber", facts: [["Candidate", "Alex R."], ["Role", "Care Coordinator"], ["Interviewed", "Mon"], ["Due", "Wed 5:00 PM"]],
        body: "Hi Sam, a quick reminder to share your feedback on Alex. It takes about 2 minutes.", actions: ["Submit feedback", "Snooze 1 day", "Not my item"] }} />,
  },
  escalate: {
    io: { in: "Item still open after the due date", does: "Rule moves it up one level; AI writes a 2-line summary of the history", out: "A post in the HR Ops escalations channel" },
    preview: <ChatMock where="Teams · HR Ops › Escalations" from="HR Follow-up" time="Thu 9:00 AM"
      card={{ title: "Overdue 1 day · Interview feedback", tone: "crit", facts: [["Owner", "Sam K."], ["Candidate", "Alex R. (Care Coordinator)"], ["Waiting", "3 days"]],
        body: "Sam was reminded Tuesday and Wednesday with no response. The recruiter noted Alex has another offer pending.",
        note: "Summary written by AI from the item history", actions: ["Message Sam", "Reassign", "Extend 1 day"] }} />,
  },
  done: {
    io: { in: "Sam submits the feedback card", does: "Flow closes the item and writes the full history", out: "Closed item with a timeline, and a confirmation" },
    preview: <>
      <ChatMock where="Teams · Chat with HR Follow-up" from="HR Follow-up" time="Thu 11:20 AM" text="Thanks Sam. Feedback for Alex R. is recorded and HR has been notified." />
      <ListMock where="Dataverse · WI-1042 timeline" rows={[{ l: "Created from Rippling", r: "Mon 9:02" }, { l: "Reminder sent", r: "Tue 2:00" }, { l: "Escalated to HR Ops", r: "Thu 9:00" }, { l: "Feedback submitted · closed", r: "Thu 11:20", badge: "Done" }]} />
    </>,
  },
  see: {
    io: { in: "All open and closed work items", does: "Power BI refreshes; Copilot writes the weekly summary", out: "A stuck-work report and a Monday channel post for leaders" },
    preview: <>
      <BarsMock where="Power BI · Stuck work" title="Overdue HR items by owner" bars={[["Hiring mgrs", 4], ["HR staff", 1], ["Vendors", 1]]} />
      <ChatMock where="Teams · Leadership › Monday brief" from="Chief of Staff" time="Mon 7:00 AM"
        card={{ title: "This week: 6 HR items past due", facts: [["Biggest wait", "4 on hiring managers"], ["Feedback time", "median 2.4 days"], ["Needs you", "2 offers waiting on references"]], actions: ["Open report"] }} />
    </>,
  },
};

/* ------------------------------------------------------------------ tech stack flow */
export const stackOut: Record<string, Out> = {
  start: {
    io: { in: "Day-to-day work in today's tools", does: "Nothing changes for staff; we only read from these", out: "Events: new form, stage change, new recording" },
    preview: <ListMock where="Connected sources" rows={[{ l: "Rippling", badge: "API · confirm", tone: "warn" }, { l: "Jotform", badge: "Connector", tone: "ok" }, { l: "RingCentral", badge: "API · confirm", tone: "warn" }, { l: "Outlook · Teams", badge: "Built in", tone: "ok" }, { l: "QuickBooks", badge: "Connector", tone: "ok" }]} />,
  },
  connect: {
    io: { in: "An event from a source system", does: "A flow maps the fields and calls the next step, retrying on errors", out: "Clean data passed to Dataverse" },
    preview: <ListMock where="Power Automate · Run history" rows={[{ l: "Jotform → Create referral item", r: "2 s", badge: "Succeeded" }, { l: "Rippling → Interview feedback", r: "3 s", badge: "Succeeded" }, { l: "RingCentral → New recording", r: "retry 1", badge: "Retried", tone: "warn" }]} />,
  },
  track: {
    io: { in: "Clean data from flows", does: "Stores it as work items with owners, due dates and history", out: "One shared, permissioned list of what's waiting" },
    preview: <ListMock where="Dataverse · Open work items" rows={[{ l: "WI-1042 Feedback · Sam K.", r: "due Wed", badge: "Due soon", tone: "warn" }, { l: "WI-1051 Background check · Vendor", r: "due Fri", badge: "Waiting", tone: "muted" }, { l: "WI-1038 Handbook sign-off · J. Lee", r: "2 d late", badge: "Overdue", tone: "crit" }]} />,
  },
  think: {
    io: { in: "Selected fields only (after the PHI gate)", does: "Drafts, summarizes or answers from approved sources", out: "A draft or a cited answer, waiting for a person if needed" },
    preview: <TextMock where="Copilot Studio · Draft (needs approval)" title="Reminder to candidate" lines={["Hi Alex, thanks again for meeting with us on Monday. We're now checking references and expect to update you by Friday."]} />,
  },
  show: {
    io: { in: "Work items, drafts, answers", does: "Delivers them where people already work", out: "Teams messages, a work-queue app, reports" },
    preview: <ChatMock where="Teams · Chat with HR Follow-up" from="HR Follow-up" time="Tue 2:00 PM"
      card={{ title: "Interview feedback due tomorrow", tone: "amber", facts: [["Candidate", "Alex R."], ["Due", "Wed 5:00 PM"]], actions: ["Submit feedback", "Snooze 1 day"] }} />,
  },
  govern: {
    io: { in: "Every change, sign-in and AI request", does: "Checks access, blocks sensitive data, records everything", out: "An audit trail and safe releases" },
    preview: <ListMock where="Admin · Activity" rows={[{ l: "Release v1.3 to PROD · approved by HR lead", r: "Fri", badge: "Approved" }, { l: "DLP: blocked member ID in AI request", r: "Thu", badge: "Blocked", tone: "crit" }, { l: "Quarterly access review · HR group", r: "Due", badge: "Open", tone: "warn" }]} />,
  },
};

/* ------------------------------------------------------------------ RAG + OCR document pipeline */
export const ragDocsOut: Record<string, Out> = {
  in: {
    io: { in: "Files, scans, faxes and email attachments", does: "Flows drop them into an intake library", out: "A queue of documents to process" },
    preview: <ListMock where="SharePoint · Intake" rows={[{ l: "HR Policy 4.2 – PTO.docx", r: "policy" }, { l: "Referral packet R-1042.pdf (scan, 14 pages)", r: "scan", badge: "Phase 2", tone: "warn" }, { l: "Onboarding checklist – drivers.xlsx", r: "SOP" }]} />,
  },
  ocr: {
    io: { in: "Scanned or faxed pages", does: "OCR reads the text, tables and checkboxes", out: "Searchable text with the page layout kept" },
    preview: <Pair a={<TextMock where="Before · scan" lines={["[ image of page 3 ]", "☑ Consent to share  ☐ Declined", "Signature: (handwritten)"]} mono />}
      b={<TextMock where="After · text" lines={["Consent to share: YES", "Signature present: YES", "Dated: 10/28/2026"]} mono />} />,
  },
  classify: {
    io: { in: "Document text", does: "Labels the document type and pulls key fields; unsure results go to a person", out: "Type, fields and a confidence score" },
    preview: <RecordMock where="Extraction result" title="Consent form" status="Confidence 97%" fields={[["Belongs to", "Referral R-1042"], ["Signed", "Yes"], ["Date", "10/28/2026"], ["Missing", "Guardian signature"]]} />,
  },
  gate: {
    io: { in: "Labeled document", does: "Checks for member data and routes it to the right zone", out: "Phase 1 index, or locked Phase 2 area" },
    preview: <ListMock where="Routing" rows={[{ l: "HR Policy 4.2 – PTO", badge: "Phase 1 index" }, { l: "Onboarding checklist – drivers", badge: "Phase 1 index" }, { l: "Referral packet R-1042", badge: "Phase 2 · locked", tone: "crit" }]} />,
  },
  store: {
    io: { in: "Routed document + fields", does: "Saves the file with metadata and the fields as a record", out: "File in SharePoint, record in Dataverse, linked" },
    preview: <RecordMock where="SharePoint + Dataverse" title="HR Policy 4.2 – PTO" status="Approved v3" fields={[["Owner", "HR lead"], ["Effective", "Jan 1, 2026"], ["Expires", "Dec 31, 2026"], ["Audience", "All staff"]]} />,
  },
  index: {
    io: { in: "Stored documents", does: "Splits, labels and indexes them by words and meaning, with permissions", out: "A searchable index per zone" },
    preview: <ListMock where="Azure AI Search · Phase 1 index" rows={[{ l: "Documents", r: "214" }, { l: "Passages (index cards)", r: "3,870" }, { l: "Expired, excluded", r: "19" }, { l: "Last refresh", r: "06:00 today" }]} />,
  },
  ask: {
    io: { in: "A staff question in Teams", does: "Finds the best passages and answers only from them", out: "A short answer with a link to the exact section" },
    preview: <ChatMock where="Teams · Policy Assistant" from="Policy Assistant" time="10:14 AM"
      card={{ title: "Up to 5 unused PTO days carry over", body: "Unused PTO above 5 days is not carried into the next year. Carried days must be used by March 31.",
        note: "Source: HR Policy 4.2 – PTO, section 3, version 3 (approved Jan 1, 2026)", actions: ["Open policy", "Was this helpful?"] }} />,
  },
};

/* ------------------------------------------------------------------ advanced RAG: preparing */
export const prepareOut: Record<string, Out> = {
  collect: {
    io: { in: "Every document in the policy library", does: "Keeps approved, current versions; drops drafts and duplicates", out: "A clean set of official documents" },
    preview: <ListMock where="Collection check" rows={[{ l: "HR Policy 4.2 – PTO (v3, approved)", badge: "Included" }, { l: "HR Policy 4.2 – PTO (v2)", badge: "Superseded", tone: "muted" }, { l: "PTO policy DRAFT – Jane's edits", badge: "Draft", tone: "warn" }]} />,
  },
  chunk: {
    io: { in: "One long document", does: "Cuts it into short passages by heading, with a little overlap", out: "Index cards, each about one idea" },
    preview: <ListMock where="Chunks · HR Policy 4.2" rows={[{ l: "Card 11 · §3 Carry-over · “Up to 5 unused days…”", r: "380 words" }, { l: "Card 12 · §3 Carry-over · “…used by March 31.”", r: "290 words" }, { l: "Card 13 · §4 Payout at separation", r: "410 words" }]} />,
  },
  label: {
    io: { in: "Index cards", does: "Attaches source, version, owner, dates and who may read it", out: "Cards that know where they came from" },
    preview: <RecordMock where="Card 11 · labels" title="§3 Carry-over" fields={[["Document", "HR Policy 4.2 – PTO"], ["Version", "3"], ["Authority", "Board policy"], ["Audience", "All staff"], ["Zone", "Phase 1"], ["Expires", "Dec 31, 2026"]]} />,
  },
  embed: {
    io: { in: "Card text", does: "Turns the meaning into a list of numbers (a point on the map of meaning)", out: "A meaning fingerprint for each card" },
    preview: <TextMock where="Embedding · Card 11" lines={["[ 0.021, -0.113, 0.087, 0.004, -0.052, … ]", "1,536 numbers · cards with similar meaning get similar numbers"]} mono />,
  },
  index: {
    io: { in: "Cards + labels + meaning fingerprints", does: "Files each card by exact words and by meaning", out: "A hybrid index ready for questions" },
    preview: <ListMock where="Index status" rows={[{ l: "Keyword index", badge: "Ready" }, { l: "Meaning (vector) index", badge: "Ready" }, { l: "Permission filters", badge: "On" }]} />,
  },
};

/* ------------------------------------------------------------------ advanced RAG: answering */
export const answerOut: Record<string, Out> = {
  understand: {
    io: { in: "“What about leftover vacation?”", does: "Checks who is asking and rewrites the question clearly", out: "A clear search query + the asker's permissions" },
    preview: <RecordMock where="Query understanding" title="Rewritten question" fields={[["Asked", "What about leftover vacation?"], ["Search for", "PTO carry-over rules at year end"], ["Asker", "Care coordinator · All staff group"], ["Zone", "Phase 1 only"]]} />,
  },
  search: {
    io: { in: "Search query + filters", does: "Searches by words and meaning in allowed, current cards", out: "About 50 candidate cards" },
    preview: <ListMock where="Hybrid search · top results" rows={[{ l: "Card 11 · §3 Carry-over", r: "0.82" }, { l: "Card 12 · §3 Carry-over (cont.)", r: "0.79" }, { l: "FAQ · Unused vacation", r: "0.74" }, { l: "Card 13 · §4 Payout at separation", r: "0.61" }, { l: "SOP 12 · Leave requests", r: "0.55" }]} />,
  },
  rerank: {
    io: { in: "~50 candidates", does: "A second model reads each one against the question", out: "The best 3, in order" },
    preview: <ListMock where="Reranked" rows={[{ l: "1. Card 11 · §3 Carry-over", badge: "Keep" }, { l: "2. Card 12 · §3 Carry-over (cont.)", badge: "Keep" }, { l: "3. FAQ · Unused vacation", badge: "Keep" }, { l: "SOP 12 · Leave requests", badge: "Dropped", tone: "muted" }]} />,
  },
  context: {
    io: { in: "Top 3 cards", does: "Adds the full section, keeps newest versions, checks for conflicts", out: "A clean reading pack for the AI" },
    preview: <ListMock where="Reading pack" rows={[{ l: "HR Policy 4.2 §3, full section (v3)", badge: "Policy" }, { l: "FAQ · Unused vacation (matches policy)", badge: "FAQ" }, { l: "Conflicts found", r: "none" }]} />,
  },
  answer: {
    io: { in: "Question + reading pack", does: "Writes a short answer using only the pack, with citations", out: "A cited answer" },
    preview: <ChatMock where="Teams · Policy Assistant" from="Policy Assistant" time="10:14 AM"
      card={{ title: "Up to 5 unused PTO days carry over", body: "Anything above 5 days is not carried over. Carried days must be used by March 31.", note: "Source: HR Policy 4.2 §3, v3", actions: ["Open policy"] }} />,
  },
  check: {
    io: { in: "Draft answer + sources", does: "Confirms every sentence is supported; if not, refuses and routes", out: "Answer sent, or “no approved answer” + a task for the owner" },
    preview: <ChatMock where="Teams · Policy Assistant" from="Policy Assistant" time="10:31 AM" text="Can I carry over sick leave too?"
      card={{ title: "I couldn't find an approved answer", tone: "amber", body: "The PTO policy doesn't cover sick leave carry-over. I've sent your question to the HR policy owner.", note: "Closest related: HR Policy 4.2 §1 Scope", actions: ["See related section"] }} />,
  },
  learn: {
    io: { in: "Feedback, unanswered questions, weekly reviews", does: "Counts gaps and re-tests answers after every change", out: "A list of documents to fix or write" },
    preview: <BarsMock where="Copilot analytics · last 30 days" title="Questions with no approved answer, by topic" bars={[["Sick leave", 14], ["Mileage", 9], ["Remote work", 6], ["Uniforms", 3]]} />,
  },
};

/* ------------------------------------------------------------------ ALM: DEV → QA → PROD */
export const almOut: Record<string, Out> = {
  dev: {
    io: { in: "A change request (e.g. new escalation rule)", does: "A maker builds it inside a solution in DEV", out: "A new solution version" },
    preview: <ListMock where="DEV · HR Follow-up solution v1.3" rows={[{ l: "Flow: Escalate overdue feedback", badge: "Changed", tone: "warn" }, { l: "Table: Work item (new column: Escalation level)", badge: "Changed", tone: "warn" }, { l: "Agent topic: Snooze item", badge: "Unchanged", tone: "muted" }]} />,
  },
  review: {
    io: { in: "Solution v1.3", does: "Automatic checker + a peer review", out: "Review passed, or fixes requested" },
    preview: <ListMock where="Review · v1.3" rows={[{ l: "Solution checker: 0 errors, 1 warning", badge: "Pass" }, { l: "Security roles unchanged", badge: "Pass" }, { l: "Peer review by D. Ortiz", badge: "Approved" }]} />,
  },
  qa: {
    io: { in: "Reviewed solution", does: "Deployed to QA and tested with sample data and HR users", out: "Test results" },
    preview: <ListMock where="QA · Test run" rows={[{ l: "Reminder at 75% of due time", badge: "Pass" }, { l: "Escalation after due date", badge: "Pass" }, { l: "Agent answers: 48 / 50 grounded", badge: "Pass" }, { l: "Snooze without reason is refused", badge: "Pass" }]} />,
  },
  approve: {
    io: { in: "Passing test results", does: "The business owner approves in Teams", out: "Release approved, with name and time recorded" },
    preview: <ChatMock where="Teams · Approvals" from="Power Platform Pipelines" time="Fri 3:10 PM"
      card={{ title: "Approve release: HR Follow-up v1.3 to PROD", facts: [["Changes", "New escalation rule"], ["Tests", "All passed in QA"], ["Requested by", "D. Ortiz"]], actions: ["Approve", "Reject"] }} />,
  },
  prod: {
    io: { in: "Approved release", does: "Deploys as a locked, managed solution; keeps the previous version", out: "Live for staff, with one-click rollback" },
    preview: <ListMock where="PROD · Release history" rows={[{ l: "v1.3 · New escalation rule", r: "Fri 3:22 PM", badge: "Live" }, { l: "v1.2 · Snooze needs a reason", r: "Oct 30", badge: "Rollback ready", tone: "muted" }, { l: "v1.1 · Teams reminders", r: "Oct 16", badge: "Retired", tone: "muted" }]} />,
  },
};
