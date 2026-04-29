import type { ReactNode } from "react";

export type LegalSection = {
  id: string;
  number: string;
  title: string;
  body: ReactNode;
};

export type LegalContent = {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
};
