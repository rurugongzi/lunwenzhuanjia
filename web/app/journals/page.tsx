"use client";

import { useState, useMemo } from "react";
import { JOURNALS } from "@/lib/journals-data";
import type { JournalRecord } from "@/lib/journals-data";

export default function JournalsPage() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState<string>("全部");
  const [onlyWithSpec, setOnlyWithSpec] = useState(false);

  const subjects = useMemo(() => {
    return Array.from(new Set(JOURNALS.map((j) => j.subject)));
  }, []);

  const filtered = useMemo(() => {
    return JOURNALS.filter((j) => {
      if (subject !== "全部" && j.subject !== subject) return false;
      if (onlyWithSpec && !j.has_format_spec) return false;
      if (search) {
        const q = search.toLowerCase();
        const inName = j.name.toLowerCase().includes(q);
        const inAlias = (j.alias || "").toLowerCase().includes(q);
        if (!inName && !inAlias) return false;
      }
      return true;
    });
  }, [search, subject, onlyWithSpec]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">期刊库</h1>
        <p className="text-sm text-gray-500 mt-1">
          CSSCI 2025-2026 · {JOURNALS.length} 种期刊覆盖 ·{" "}
          {JOURNALS.filter((j) => j.has_format_spec).length} 种已规范
        </p>
      </header>

      {/* 过滤 */}
      <div className="card space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="🔍 搜索期刊名…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="全部">全部学科</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={onlyWithSpec}
              onChange={(e) => setOnlyWithSpec(e.target.checked)}
            />
            <span className="text-sm">仅显示已规范期刊</span>
          </label>
        </div>
        <div className="text-sm text-gray-600">
          匹配 <strong className="text-primary-600">{filtered.length}</strong> 种 / 共 {JOURNALS.length} 种
        </div>
      </div>

      {/* 期刊列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((j) => (
          <JournalCard key={j.id} j={j} />
        ))}
      </div>
    </div>
  );
}

function JournalCard({ j }: { j: JournalRecord }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">
            {j.name}
            {j.alias && <span className="text-gray-500 text-sm">（{j.alias}）</span>}
          </h3>
          <div className="text-xs text-gray-500 mt-1">
            {j.subject} · {j.source === "main" ? "主目录" : "扩展版"}
          </div>
        </div>
        <div className="ml-2 shrink-0">
          {j.has_format_spec ? (
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
              ✓ 已规范
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
              待采集
            </span>
          )}
        </div>
      </div>
    </div>
  );
}