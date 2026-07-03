// 期刊数据 — 从 ../../data/seed/journals-271.json 导入
// 部署到 Vercel 时 Next.js 会自动打包 JSON 文件

import journalsData from "@/data/journals-271.json";
import formatsData from "@/data/formats.json";

import type { JournalSpec } from "./engine";

export interface JournalRecord {
  id: string;
  name: string;
  alias: string | null;
  subject: string;
  subject_id: string;
  source: "main" | "ext";
  cssci_year: string;
  rank_in_subject: number;
  has_format_spec: boolean;
  format_spec_id: string | null;
}

export const JOURNALS: JournalRecord[] = journalsData as JournalRecord[];
export const FORMATS: JournalSpec[] = formatsData as JournalSpec[];

export function getJournalByName(name: string): JournalRecord | null {
  const base = name.replace(/[（(][^）)]*[）)]/, "").trim();
  return JOURNALS.find((j) => j.name === name || j.name === base) || null;
}

export function getSpecById(id: string): JournalSpec | null {
  return FORMATS.find((f) => f.id === id) || null;
}

export function getSpecForJournal(journalName: string): JournalSpec | null {
  const j = getJournalByName(journalName);
  if (!j || !j.format_spec_id) return null;
  return getSpecById(j.format_spec_id);
}

export function groupBySubject() {
  const groups: Record<string, JournalRecord[]> = {};
  for (const j of JOURNALS) {
    if (!groups[j.subject]) groups[j.subject] = [];
    groups[j.subject].push(j);
  }
  return Object.entries(groups).map(([subject, items]) => ({
    subject,
    count: items.length,
    items,
  }));
}