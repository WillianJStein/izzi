export type ProjectType = 'sistema' | 'website' | 'automação';

export interface HistoryEntry {
  date: string;
  observation: string;
  userName?: string;
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  priority: 'baixa' | 'média' | 'alta';
  type: 'funcional' | 'não-funcional';
  createdAt?: string;
  updatedAt?: string;
  history?: HistoryEntry[];
}

export interface BusinessRule {
  id: string;
  description: string;
}

export interface ProjectData {
  id?: string;
  ownerUid?: string;
  name: string;
  client: string;
  type: ProjectType;
  description: string;
  what: string;
  why: string;
  objectives: string[];
  requirements: Requirement[];
  businessRules: BusinessRule[];
  showBusinessRules: boolean;
  stakeholders: string[];
  timeline: string;
  budget: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  lastChangeDescription?: string;
  projectHistory?: HistoryEntry[];
}

export type Theme = 'light' | 'dark' | 'system';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  themePreference: Theme;
  photoURL?: string;
  updatedAt: string;
}
