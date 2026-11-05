import type { ReactNode } from "react";

export type SlideDef = {
  id: string;
  /** short label shown in the bar and overview, e.g. "Q3 · Architecture" */
  section: string;
  title: string;
  content: ReactNode;
  /** speaker notes, one paragraph per entry */
  notes: string[];
};
