"use client";

import { useState } from "react";
import { ReportTable } from "./ReportTable";
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

export function UploadForm() {
  const [text, setText] = useState("");
  const [journal, setJournal] = useState("文艺争鸣");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");

  const sample = `［1］　袁济喜：《疏野与诗话》，《北京大学学报》［J］2023年第6期。
［2］　汪涌豪：《范畴论》［M］，复旦大学出版社，1999年。
［3］　肖鹰：《庄子美学辨正——对流行误解的批驳》，《文学评论》［J］2023年第5期。
［4］　尼采：《悲剧的诞生》［M］，周国平译，三联书店，1986年。
［5］　利奥波德：《沙乡年鉴》［M］，侯文蕙译，吉林人民出版社，1997年。`;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const buf = await f.text();
    setText(buf);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !journal.trim()) {
      setError("请填写论文文本和目标期刊");
      return;
    }
    setLoading(true);
    setError("");
    setReport(null);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, journal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "请求失败");
      setReport(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function loadSample() {
    setText(sample);
    setJournal("文艺争鸣");
    setFileName("(示例数据)");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            目标期刊
          </label>
          <input
            type="text"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="如：文艺争鸣 / 历史研究 / 哲学研究"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            共支持 271 种 CSSCI 期刊 · 32 种有完整格式规范
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            论文文本（含注释段）
          </label>
          <div className="flex items-center gap-2 mb-2">
            <label className="cursor-pointer text-sm text-primary-600 hover:text-primary-700">
              <input type="file" onChange={onFile} className="hidden" accept=".txt,.md,.docx,.pdf" />
              📎 上传文件
            </label>
            <button
              type="button"
              onClick={loadSample}
              className="text-sm text-gray-600 hover:text-primary-600"
            >
              🎯 加载示例
            </button>
            {fileName && (
              <span className="text-xs text-gray-500">已选：{fileName}</span>
            )}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="粘贴论文全文或注释段…"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
            rows={10}
          />
          <p className="text-xs text-gray-500 mt-1">
            字符数：{text.length.toLocaleString()}（限 500KB）
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            ❌ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "校验中…" : "🚀 开始校验"}
        </button>
      </form>

      {report && <ReportTable report={report} />}
    </div>
  );
}