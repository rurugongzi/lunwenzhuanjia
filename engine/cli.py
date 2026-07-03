"""CiteTong CLI 入口

用法：
    python3 -m engine.cli \
        --input path/to/paper.txt \
        --journal "历史研究" \
        [--output report.json]

或者通过 __main__.py:
    python3 -m engine \
        --input paper.txt \
        --journal "历史研究"
"""
from __future__ import annotations

import argparse
import json
import sys
import os
from pathlib import Path

# 确保项目根在 path 上
_project_root = Path(__file__).resolve().parent.parent
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))

from engine.parser import parse, summarize as parser_summarize
from engine.validator import validate, summarize as validator_summarize


def run(paper_path: str, journal_name: str) -> dict:
    """完整流水线：解析 → 校验 → 报告"""
    text = Path(paper_path).read_text(encoding="utf-8")
    citations = parse(text)
    results = validate(citations, journal_name)

    parser_report = parser_summarize(citations)
    validator_report = validator_summarize(results)

    return {
        "meta": {
            "paper": paper_path,
            "journal": journal_name,
            "citations_found": len(citations),
        },
        "parser": parser_report,
        "validator": validator_report,
        "results": [r.to_dict() for r in results],
    }


def format_markdown(report: dict) -> str:
    """生成人类可读的 Markdown 报告"""
    m = report["meta"]
    v = report["validator"]
    p = report["parser"]

    lines = [
        f"# CiteTong 格式校验报告",
        f"",
        f"**论文**: `{m['paper']}`",
        f"**目标期刊**: 《{m['journal']}》",
        f"**抽取引文**: {m['citations_found']} 条",
        f"",
        f"## 概览",
        f"",
        f"| 状态 | 数量 |",
        f"|------|------|",
        f"| ✅ 通过 | {v['ok']} |",
        f"| ⚠️ 警告 | {v['warn']} |",
        f"| ❌ 错误 | {v['fail']} |",
        f"| 总体错误率 | {v['fail_rate']*100:.1f}% |",
        f"",
        f"**解析报告**:",
        f"- 引文类型分布: {json.dumps(p.get('by_type', {}), ensure_ascii=False)}",
        f"- 平均置信度: {p.get('avg_confidence', 0):.2f}",
        f"- 低置信引文: {p.get('low_confidence_count', 0)} 条",
        f"",
        f"## 常见错误",
        f"",
    ]

    if v.get("top_fail_rules"):
        lines.append("| 规则 | 次数 |")
        lines.append("|------|------|")
        for rule, count in v["top_fail_rules"].items():
            lines.append(f"| {rule} | {count} |")

    lines.append("")
    lines.append("## 引文明细")
    lines.append("")

    for r in report["results"]:
        icon = {"ok": "✅", "warn": "⚠️", "fail": "❌"}.get(r["status"], "❓")
        lines.append(f"### {icon} 第 {r['citation_index']+1} 条")
        lines.append(f"")
        lines.append(f"> `{r['raw'][:80]}{'...' if len(r['raw']) > 80 else ''}`")
        lines.append(f"")
        lines.append(f"- 类型: {r['parsed_type']}")
        lines.append(f"- 状态: **{'通过' if r['status']=='ok' else '警告' if r['status']=='warn' else '错误'}**")
        if r.get("errors"):
            lines.append(f"- 错误:")
            for e in r["errors"]:
                lines.append(f"  - ❌ {e['message']}")
        if r.get("warnings"):
            lines.append(f"- 警告:")
            for w in r["warnings"]:
                lines.append(f"  - ⚠️ {w['message']}")
        if r.get("suggestions"):
            lines.append(f"- 建议:")
            for s in r["suggestions"]:
                lines.append(f"  - 💡 {s['suggested']}")
        lines.append("")

    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(description="CiteTong 引文格式校验")
    ap.add_argument("--input", "-i", required=True, help="论文 .txt 路径")
    ap.add_argument("--journal", "-j", required=True, help="目标期刊名（中文，如 历史研究）")
    ap.add_argument("--output", "-o", default=None, help="输出 JSON 路径（缺省输出到 stdout）")
    ap.add_argument("--markdown", "-m", action="store_true", help="输出 Markdown 报告（默认 JSON）")
    args = ap.parse_args()

    report = run(args.input, args.journal)

    if args.markdown:
        output = format_markdown(report)
    else:
        output = json.dumps(report, ensure_ascii=False, indent=2)

    if args.output:
        Path(args.output).write_text(output, encoding="utf-8")
        print(f"✅ 报告已写入 {args.output}")
    else:
        print(output)


if __name__ == "__main__":
    main()