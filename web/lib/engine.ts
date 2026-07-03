/**
 * CiteTong 引擎（TypeScript 简化版）
 *
 * 覆盖 D3 MVP 必需的 3 体系解析 + 5 条核心校验规则。
 * Python 版（engine/parser.py + engine/validator.py）是参考实现，
 * 用于 CLI demo + 离线脚本；本文件是 Web 端运行的等价实现。
 *
 * 5 条核心规则：
 *   1. 体系一致性（页下注/尾注/夹注）
 *   2. 出版城市（著作/译著）
 *   3. 文献类型标识 [M][J][N]
 *   4. 同上注禁用
 *   5. 英文文献格式提示
 */

export type CitationSystem = "页下注" | "尾注" | "夹注";

export interface Citation {
  raw: string;
  system: CitationSystem;
  marker?: string;
  parsed: {
    type?: "著作" | "译著" | "期刊论文" | "报纸";
    author?: string;
    title?: string;
    publisher?: string;
    pub_city?: string;
    year?: string;
    issue?: string;
    page?: string;
    journal?: string;
    newspaper?: string;
    date?: string;
    trans?: string;
  };
}

export interface ValidationResult {
  citation_index: number;
  raw: string;
  parsed_type: string;
  status: "ok" | "warn" | "fail";
  errors: Array<{ rule: string; message: string; severity: string }>;
  warnings: Array<{ rule: string; message: string; severity: string }>;
  suggestions: Array<{ field: string; current: string; suggested: string }>;
}

export interface JournalSpec {
  id: string;
  journal_name: string;
  subject: string;
  system: string;
  needs_pub_city: boolean;
  needs_doc_type: boolean;
  has_bibliography: boolean;
  numbering: string;
  numbering_position: string;
  english_format: string;
}

// ─────────────────── 解析 ───────────────────

const RE_BOOK_WITH_CITY =
  /^(?<author>[^：:，,。；;]+?)[:：](?<title>[《【\[](.+?)[》】\]])[，,]?\s*(?<pub_city>[^：:,，：]+?)[:：](?<publisher>[^，,]+?)[，,]\s*(?<year>\d{4})\s*年?(?:[，,]\s*第?\s*(?<page>\d+(?:[\-—–]\d+)?)\s*页)?/;

const RE_BOOK_NO_CITY =
  /^(?<author>[^：:，,。；;]+?)[:：](?<title>[《【\[](.+?)[》】\]])(?:［[MJNCDG]］)?[，,]?\s*(?<publisher>[^，,]+?)[，,]\s*(?<year>\d{4})\s*年?(?:[，,]\s*第?\s*(?<page>\d+(?:[\-—–]\d+)?)\s*页)?/;

const RE_TRANSLATED_NO_CITY =
  /^(?<author>[^：:，,。；;]+?)[:：](?<title>[《【\[](.+?)[》】\]])(?:［[MJNCDG]］)?[，,]\s*(?<trans>[^，,]+?)\s*译[，,]\s*(?<publisher>[^，,]+?)[，,]\s*(?<year>\d{4})\s*年?/;

const RE_JOURNAL =
  /^(?<author>[^：:，,。；;]+?)[:：](?<title>[《【\[](.+?)[》】\]])[，,]\s*[《【\[](?<journal>[^》】\]]+?)[》】\]](?:［[A-Z]］)?\s*(?<year>\d{4})\s*年?第?\s*(?<issue>\d+)\s*期(?:[，,]\s*第?\s*(?<page>\d+(?:[\-—–]\d+)?)\s*页)?/;

const RE_NEWSPAPER =
  /^(?<author>[^：:，,。]+?)[:：](?<title>[《【\[](.+?)[》】\]])[，,]\s*[《【\[](?<newspaper>[^》】\]]+)[》】\]]\s*(?<year>\d{4})\s*年\s*(?<month>\d+)\s*月\s*(?<day>\d+)\s*日/;

const RE_NARRATIVE =
  /^(?<author>[^：:，,。]+?)[:：](?<title>[^，,。]+?)[，,]\s*(?<journal>[^，,]+?)[，,]\s*(?<year>\d{4})\s*年\s*第\s*(?<issue>\d+)\s*期/;

const RE_INLINE_CN =
  /[（(](?<author>[^，,：:；;）)]+?)[，,]\s*(?<year>\d{4})(?:[a-z])?\s*[，:：]\s*(?<page>\d+(?:[\-—–]\d+)?)[）)]/;

function detectSystem(text: string): CitationSystem {
  const cnParen = (text.match(/[（(][^）)]*\d{4}[^）)]*[）)]/g) || []).length;
  const circled = (text.match(/[①②③④⑤⑥⑦⑧⑨⑩]/g) || []).length;
  const bracket = (text.match(/\[\d+\]/g) || []).length;
  const fwBracket = (text.match(/［\d+］/g) || []).length;
  if (fwBracket > circled + bracket) return "尾注";
  if (cnParen > Math.max(circled, bracket, fwBracket)) return "夹注";
  return "页下注";
}

function extractNotes(text: string, system: CitationSystem): string[] {
  const lines = text.split(/\n/);
  const notes: string[] = [];
  const patterns = [
    /^\s*[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]\s*(.+?)$/,
    /^\s*\[(\d+)\]\s*(.+?)$/,
    /^\s*［(\d+)］\s*(.+?)$/,
    /^\s*\d+\)\s*(.+?)$/,
    /^\s*\d+\.\s+(.+?)$/,
  ];
  for (const ln of lines) {
    for (const p of patterns) {
      const m = ln.match(p);
      if (m) {
        const content = (m[2] || m[1]).trim();
        if (content && !content.startsWith("---")) notes.push(content);
        break;
      }
    }
  }
  return notes;
}

function extractInline(text: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(RE_INLINE_CN.source, "g");
  while ((m = re.exec(text)) !== null) out.push(m[0]);
  return out;
}

function parseBody(raw: string): Citation["parsed"] {
  const s = raw.trim();
  // 译著（无出版城市）
  let m = s.match(RE_TRANSLATED_NO_CITY);
  if (m && m.groups) {
    return {
      type: "译著",
      author: m.groups.author?.trim(),
      title: m.groups.title?.trim(),
      trans: m.groups.trans?.trim(),
      publisher: m.groups.publisher?.trim(),
      year: m.groups.year,
      page: m.groups.page,
      pub_city: "",
    };
  }
  // 期刊论文
  m = s.match(RE_JOURNAL);
  if (m && m.groups) {
    return {
      type: "期刊论文",
      author: m.groups.author?.trim(),
      title: m.groups.title?.trim(),
      journal: m.groups.journal?.trim(),
      year: m.groups.year,
      issue: m.groups.issue,
      page: m.groups.page,
    };
  }
  // 著作（带出版城市）
  m = s.match(RE_BOOK_WITH_CITY);
  if (m && m.groups) {
    return {
      type: "著作",
      author: m.groups.author?.trim(),
      title: m.groups.title?.trim(),
      publisher: m.groups.publisher?.trim(),
      year: m.groups.year,
      page: m.groups.page,
      pub_city: m.groups.pub_city?.trim(),
    };
  }
  // 著作（无出版城市）
  m = s.match(RE_BOOK_NO_CITY);
  if (m && m.groups) {
    return {
      type: "著作",
      author: m.groups.author?.trim(),
      title: m.groups.title?.trim(),
      publisher: m.groups.publisher?.trim(),
      year: m.groups.year,
      page: m.groups.page,
      pub_city: "",
    };
  }
  // 报纸
  m = s.match(RE_NEWSPAPER);
  if (m && m.groups) {
    return {
      type: "报纸",
      author: m.groups.author?.trim(),
      title: m.groups.title?.trim(),
      newspaper: m.groups.newspaper?.trim(),
      date: `${m.groups.year}-${m.groups.month}-${m.groups.day}`,
    };
  }
  // 无书名号自然叙述式
  m = s.match(RE_NARRATIVE);
  if (m && m.groups) {
    return {
      type: "期刊论文",
      author: m.groups.author?.trim(),
      title: m.groups.title?.trim(),
      journal: m.groups.journal?.trim(),
      year: m.groups.year,
      issue: m.groups.issue,
    };
  }
  return {};
}

export function parse(text: string): Citation[] {
  const system = detectSystem(text);
  const raws = system === "夹注" ? extractInline(text) : extractNotes(text, system);
  return raws.map((raw) => ({
    raw,
    system,
    parsed: parseBody(raw),
  }));
}

// ─────────────────── 校验 ───────────────────

export function validate(citations: Citation[], spec: JournalSpec | null): ValidationResult[] {
  return citations.map((c, idx) => _validateOne(idx, c, spec));
}

function _validateOne(idx: number, c: Citation, spec: JournalSpec | null): ValidationResult {
  const r: ValidationResult = {
    citation_index: idx,
    raw: c.raw,
    parsed_type: c.parsed.type || "未知",
    status: "ok",
    errors: [],
    warnings: [],
    suggestions: [],
  };

  if (!spec) {
    r.warnings.push({
      rule: "spec_missing",
      message: "未找到该期刊的格式规范，已按 CASS 通用体系校验",
      severity: "warn",
    });
    return r;
  }

  // 规则 1：体系一致性
  const detected = c.system;
  const expected = spec.system;
  let systemMatch = false;
  if (expected.includes("页下注") && detected === "页下注") systemMatch = true;
  if (expected.includes("尾注") && detected === "尾注") systemMatch = true;
  if (expected.includes("夹注") && detected === "夹注") systemMatch = true;
  if (expected.includes("作者—年制") && detected === "夹注") systemMatch = true;
  if (!systemMatch) {
    r.errors.push({
      rule: "system_mismatch",
      message: `目标期刊《${spec.journal_name}》要求「${expected}」，但检测到「${detected}」`,
      severity: "fail",
    });
    r.status = "fail";
  }

  // 规则 2：出版城市
  if (c.parsed.type === "著作" || c.parsed.type === "译著") {
    const hasCity = !!c.parsed.pub_city;
    if (spec.needs_pub_city && !hasCity) {
      r.errors.push({
        rule: "needs_pub_city",
        message: `《${spec.journal_name}》要求著作标注出版城市，但未找到`,
        severity: "fail",
      });
      r.status = "fail";
      r.suggestions.push({
        field: "pub_city",
        current: "(缺失)",
        suggested: "请补全（常见：北京/上海/南京/香港...）",
      });
    } else if (!spec.needs_pub_city && hasCity) {
      r.warnings.push({
        rule: "no_pub_city",
        message: `《${spec.journal_name}》不要求出版城市，但当前含出版城市`,
        severity: "warn",
      });
      if (r.status === "ok") r.status = "warn";
    }
  }

  // 规则 3：文献类型标识
  if (spec.needs_doc_type) {
    const hasType = /[\[［]\s*[MJNCDG]\s*[\]］]/.test(c.raw);
    if (!hasType && (c.parsed.type === "著作" || c.parsed.type === "译著" || c.parsed.type === "期刊论文")) {
      const tag = c.parsed.type === "期刊论文" ? "[J]" : "[M]";
      r.errors.push({
        rule: "needs_doc_type",
        message: `《${spec.journal_name}》要求文献类型标识，但未找到`,
        severity: "fail",
      });
      r.status = "fail";
      r.suggestions.push({
        field: "doc_type_tag",
        current: "(缺失)",
        suggested: `在出版者后加 ${tag}`,
      });
    }
  }

  // 规则 4：同上注禁用
  if (/(同上(书|注|引|文)?|同前注|前引书|前引文)/.test(c.raw) && !spec.journal_name.includes("学术月刊")) {
    r.warnings.push({
      rule: "no_tongshang",
      message: `《${spec.journal_name}》禁用「同上/同前注」，应直接标注作者+书名+页码`,
      severity: "warn",
    });
    if (r.status === "ok") r.status = "warn";
  }

  // 规则 5：英文文献格式提示
  if (/[A-Z][a-z]+,\s+[A-Z\.]+/.test(c.raw) && spec.english_format) {
    r.warnings.push({
      rule: "english_format",
      message: `英文文献应使用 ${spec.english_format} 格式`,
      severity: "info",
    });
  }

  return r;
}

export function summarize(results: ValidationResult[]) {
  const ok = results.filter((r) => r.status === "ok").length;
  const warn = results.filter((r) => r.status === "warn").length;
  const fail = results.filter((r) => r.status === "fail").length;
  const rules: Record<string, number> = {};
  for (const r of results) {
    for (const e of r.errors) rules[e.rule] = (rules[e.rule] || 0) + 1;
  }
  return {
    total: results.length,
    ok,
    warn,
    fail,
    fail_rate: results.length ? fail / results.length : 0,
    top_fail_rules: Object.fromEntries(
      Object.entries(rules).sort(([, a], [, b]) => b - a).slice(0, 5),
    ),
  };
}