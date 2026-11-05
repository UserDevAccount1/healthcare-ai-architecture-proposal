import type { ReactNode } from "react";

export type SlideDef = {
  id: string;
  /** short label shown in the bar and overview, e.g. "Architecture" */
  section: string;
  title: string;
  content: ReactNode;
};
