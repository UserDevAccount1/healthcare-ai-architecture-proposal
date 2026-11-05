import type { SlideDef } from "./types";
import Pipeline, { type PipelineStep } from "@/components/Pipeline";
import { MeaningMap } from "@/components/diagrams";

const prepare: PipelineStep[] = [
  {
    key: "collect", title: "Collect & clean", hint: "Approved documents only",
    plain: "Gather only approved, current documents. Drafts, duplicates and expired versions stay out, like a librarian who only shelves the official edition.",
    tech: "SharePoint library with approval status, owner, version and effective/expiry metadata. Scans go through OCR first. Headers, footers and boilerplate are stripped.",
    tools: ["SharePoint", "Document Intelligence (OCR)"],
  },
  {
    key: "chunk", title: "Chunking", hint: "Cut into index cards",
    plain: "Long documents are cut into short passages, like index cards, each about one idea. Each card keeps its heading, so “Section 4.2 PTO” stays attached to the text under it. Cards overlap slightly so no sentence is cut in half.",
    tech: "Structure-aware chunking by headings (about 300–500 words per chunk with a small overlap). Each small chunk keeps a link to its parent section, so the full section can be pulled in later.",
    tools: ["Azure AI Search skillset", "Layout-aware splitting"],
  },
  {
    key: "label", title: "Label each card", hint: "Owner, version, who may see it",
    plain: "Every card gets a label: which document, which version, who owns it, when it expires, and who is allowed to read it.",
    tech: "Metadata fields: doc id, section, version, authority rank, audience roles (Entra ID groups), zone (Phase 1 or Phase 2), effective and expiry dates.",
    tools: ["Index metadata", "Entra ID groups"],
  },
  {
    key: "embed", title: "Embeddings", hint: "Place it on a map of meaning",
    plain: "Each card is turned into a set of numbers that places it on a “map of meaning”. Cards that mean similar things sit close together, even when they use different words.",
    tech: "Azure OpenAI embedding model converts each chunk to a vector. The vectors are stored in the index alongside the text.",
    tools: ["Azure OpenAI embeddings"], tone: "amber",
  },
  {
    key: "index", title: "Two kinds of index", hint: "Exact words + meaning",
    plain: "Cards are filed twice: once by exact words (good for form numbers and names) and once by meaning (good for everyday questions).",
    tech: "Hybrid index: keyword (BM25) and vector fields in Azure AI Search. Separate indexes per zone, so Phase 1 can never reach Phase 2 cards.",
    tools: ["Azure AI Search hybrid index"],
  },
];

const answer: PipelineStep[] = [
  {
    key: "understand", title: "Understand the question", hint: "Who is asking, what they mean",
    plain: "The assistant checks who is asking, then rewrites vague questions into clear ones. “What about weekends?” becomes “weekend shift coverage policy”.",
    tech: "Query rewriting and expansion from the conversation; the user's Entra ID groups are attached as a security filter.",
    tools: ["Copilot Studio", "Entra ID"],
  },
  {
    key: "search", title: "Search both ways", hint: "Words + meaning, with filters",
    plain: "It searches by exact words and by meaning at the same time, and only in cards the person may see, current versions only.",
    tech: "Hybrid search with metadata filters: audience role, zone, status = approved, not expired. Fused ranking of keyword and vector results.",
    tools: ["Azure AI Search"],
  },
  {
    key: "rerank", title: "Rerank", hint: "A second, careful reader",
    plain: "Search finds maybe 50 candidate cards. A second, more careful reader picks the best handful that actually answer the question.",
    tech: "Semantic reranker scores the top results; anything below a relevance threshold is dropped.",
    tools: ["Semantic ranker"], tone: "amber",
  },
  {
    key: "context", title: "Build the context", hint: "Full section, newest version",
    plain: "For the winning cards, it pulls in the surrounding section so nothing is out of context, and checks that two sources don't disagree.",
    tech: "Parent-section expansion, de-duplication, authority ranking (regulation > policy > SOP > training), conflict detection between current sources.",
    tools: ["Retrieval orchestration"],
  },
  {
    key: "answer", title: "Answer with citations", hint: "Quote the page",
    plain: "The AI writes a short answer using only those passages, and shows exactly which document, section and version each point came from.",
    tech: "Generation restricted to retrieved content; every claim carries a citation link to the SharePoint document and section.",
    tools: ["Azure OpenAI", "Copilot Studio"],
  },
  {
    key: "check", title: "Check before sending", hint: "No source, no answer",
    plain: "Before showing the answer, it checks that every sentence really appears in the sources. If not, it says “I couldn't find an approved answer” and routes the question to the policy owner.",
    tech: "Groundedness check against cited passages; failures fall back to the no-answer response and create a work item for the owner.",
    tools: ["Groundedness check", "Power Automate"], tone: "crit",
  },
  {
    key: "learn", title: "Learn from use", hint: "Feedback and gaps",
    plain: "Thumbs up or down, unanswered questions and weekly reviews show where documents are missing or unclear, so the content keeps getting better.",
    tech: "Feedback logging, an evaluation set of real questions with expected answers, re-run after every content or prompt change.",
    tools: ["Copilot Studio analytics", "Evaluation set"],
  },
];

function Plain({ children }: { children: React.ReactNode }) {
  return <div className="plain"><span className="label">In plain words</span><p>{children}</p></div>;
}

export const ragDeep: SlideDef = {
  id: "rag-deep",
  section: "How RAG works",
  title: "How the AI finds answers (RAG, in plain words)",
  content: (
    <>
      <header className="d-flex flex-column gap-2">
        <div className="eyebrow"><span>Retrieval-augmented generation, explained</span><span className="q">Advanced RAG</span></div>
        <h2>How the AI finds answers, from chunking to citations</h2>
        <p className="lede">Think of a careful librarian: cut documents into index cards, file them by words and by meaning, pull the best cards, then answer only from what&rsquo;s on them.</p>
      </header>
      <div className="row g-3">
        <div className="col-12 col-xl-7 d-flex flex-column gap-2">
          <span className="label">Part 1 · Preparing documents (once, then on every update)</span>
          <Pipeline steps={prepare} label="Preparing documents" />
        </div>
        <div className="col-12 col-xl-5">
          <MeaningMap />
        </div>
      </div>
      <span className="label">Part 2 · Answering a question (every time someone asks)</span>
      <Pipeline steps={answer} label="Answering a question" />
      <Plain>The AI doesn&rsquo;t &ldquo;know&rdquo; your policies. It looks them up every time, reads the best few passages, answers only from them and shows its source. If the passage isn&rsquo;t there, it says so.</Plain>
    </>
  ),
  notes: [
    "Simple RAG is 'search, then answer'. The advanced parts are what make it trustworthy in healthcare: structure-aware chunking, metadata and permission filters, hybrid search, reranking, parent-section context, conflict handling, the groundedness check and an evaluation set.",
    "The map of meaning is a 2D simplification. Real embeddings have hundreds of dimensions, but the idea of 'close in meaning' is the same.",
    "Every step maps to an Azure AI Search or Copilot Studio setting. No custom ML training is needed.",
  ],
};
