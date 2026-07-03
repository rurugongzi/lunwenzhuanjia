"use client";

import type { ValidationResult } from "@/lib/engine";

interface ApiResponse {
  target_journal: string;
  spec_found: boolean;
  summary: {
    total: number;
    ok: number;
    warn: number;
    fail: number;
    fail_rate: number;
    top_fail_rules: Record<string, number>;
  };
  results: ValidationResult[];
}

export function ReportTable({ report }: { report: ApiResponse }) {
  const { target_journal, spec_found, summary, results } = report;
  return (
    <div className="space-y-4">
      {/* 概览 */}
      <div className="card">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              校验报告 · 《{target_journal}》
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {spec_found
                ? "✓ 已找到该期刊的格式规范"
                : "⚠️ 未找到该期刊的格式规范，按 CASS 通用体系校验"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <StatBox label="总共" value={summary.total} />
          <StatBox label="✅ 通过" value={summary.ok} color="green" />
          <StatBox label="⚠️ 警告" value={summary.warn} color="yellow" />
          <StatBox label="❌ 错误" value={summary.fail} color="red" />
        </div>

        {Object.keys(summary.top_fail_rules).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-2">常见错误规则</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.top_fail_rules).map(([rule, count]) => (
                <span
                  key={rule}
                  className="text-xs px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded"
                >
                  {rule}: {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 详细列表 */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-3">引文明细</h2>
        <div className="space-y-3">
          {results.map((r) => (
            <CitationCard key={r.citation_index} r={r} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: "green" | "yellow" | "red" | "gray";
}) {
  const cls = {
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
  }[color || "gray"];
  return (
    <div className={`rounded-lg border px-2 py-2 ${cls}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs mt-0.5">{label}</div>
    </div>
  );
}

function CitationCard({ r }: { r: ValidationResult }) {
  const icon = { ok: "✅", warn: "⚠️", fail: "❌" }[r.status];
  return (
    <div
      className={`border rounded-lg p-3 ${
        r.status === "fail"
          ? "border-red-200 bg-red-50/30"
          : r.status === "warn"
          ? "border-yellow-200 bg-yellow-50/30"
          : "border-green-200 bg-green-50/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-xs text-gray-800 break-all">
            {r.raw}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            类型: {r.parsed_type} · 状态: {r.status}
          </div>
          {r.errors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {r.errors.map((e, i) => (
                <li key={i} className="text-xs text-red-700">
                  ❌ {e.message}
                </li>
              ))}
            </ul>
          )}
          {r.warnings.length > 0 && (
            <ul className="mt-2 space-y-1">
              {r.warnings.map((w, i) => (
                <li key={i} className="text-xs text-yellow-700">
                  ⚠️ {w.message}
                </li>
              ))}
            </ul>
          )}
          {r.suggestions.length > 0 && (
            <ul className="mt-2 space-y-1">
              {r.suggestions.map((s, i) => (
                <li key={i} className="text-xs text-primary-700">
                  💡 {s.suggested}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}