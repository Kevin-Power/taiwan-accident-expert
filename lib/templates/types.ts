export interface DocumentTemplate {
  id: string;
  name: string;
  category: '現場' | '警方互動' | '保險' | '證據' | '調解' | '和解' | '鑑定' | '覆議';
  description: string;
  /** What data the system needs to generate this document */
  requiredInputs: string[];
  /** What the system outputs */
  outputDescription: string;
  /** Priority for MVP: P0 = must have, P1 = next, P2 = later */
  priority: 'P0' | 'P1' | 'P2';
  /** Disclaimer to show on the generated document */
  disclaimer: string;
}

export interface GeneratedSection {
  title: string;
  content: string;
  isEditable: boolean;
}

export interface GeneratedDocument {
  template: DocumentTemplate;
  sections: GeneratedSection[];
  generatedAt: Date;
  caseId: string;
  disclaimer: string;
}
