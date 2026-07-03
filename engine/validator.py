"""CiteTong 格式校验器

输入：parsed citations + target journal spec
输出：每条引文的校验结果（status / errors / suggestions）
"""
from __future__ import annotations

from dataclasses import dataclass, field, asdict
from pathlib import Path
import sys
import re
from typing import Optional

# 让脚本可以从项目根运行
sys.path.insert(0, str(Path(__file__).parent.parent))

from engine.parser import Citation
from data.formats_db import get_by_id as get_spec_by_id


@dataclass
class ValidationResult:
    """一条引文的校验结果"""
    citation_index: int
    raw: str
    parsed_type: str
    status: str  # 'ok' | 'warn' | 'fail'
    errors: list[dict] = field(default_factory=list)
    warnings: list[dict] = field(default_factory=list)
    suggestions: list[dict] = field(default_factory=list)

    def to_dict(self):
        return asdict(self)


def validate(
    citations: list[Citation],
    target_journal: str,
    spec_id: Optional[str] = None,
) -> list[ValidationResult]:
    """校验一组引文是否符合目标期刊规范

    Args:
        citations: 已解析的引文列表
        target_journal: 目标期刊名（中文）
        spec_id: 规范的 ID（如 historical-research）；为 None 时按期刊名查

    Returns:
        ValidationResult 列表
    """
    # 找规范
    if spec_id:
        spec = get_spec_by_id(spec_id)
    else:
        spec = _find_spec_by_name(target_journal)

    if spec is None:
        return [
            ValidationResult(
                citation_index=i,
                raw=c.raw,
                parsed_type=c.parsed.get("type", "未知"),
                status="warn",
                warnings=[{
                    "rule": "spec_missing",
                    "message": f"未找到《{target_journal}》的格式规范，已按 CASS 通用体系校验",
                    "severity": "warn",
                }],
            )
            for i, c in enumerate(citations)
        ]

    results = []
    for i, c in enumerate(citations):
        results.append(_validate_one(i, c, spec, target_journal))
    return results


def _find_spec_by_name(journal_name: str):
    """按期刊中文名查规范"""
    from data.formats_db import FORMATS
    # 精确匹配
    for f in FORMATS:
        if f["journal_name"] == journal_name:
            return f
    # 模糊匹配（去副标题）
    base = re.sub(r"[（(][^）)]*[）)]", "", journal_name).strip()
    for f in FORMATS:
        if f["journal_name"] == base:
            return f
    return None


def _validate_one(idx: int, c: Citation, spec: dict, journal_name: str) -> ValidationResult:
    """校验单条引文"""
    result = ValidationResult(
        citation_index=idx,
        raw=c.raw,
        parsed_type=c.parsed.get("type", "未知"),
        status="ok",
    )

    # ──────── 规则 1: 体系一致性 ────────
    expected_system = spec["system"]
    detected = c.system_detected
    # 兼容：页下注和尾注共用提取器，只在结尾区分
    actual_system = detected if detected != "页下注" or expected_system == "页下注①②" else detected
    if not _systems_match(detected, expected_system):
        result.errors.append({
            "rule": "system_mismatch",
            "message": f"目标期刊《{journal_name}》要求「{expected_system}」，但检测到「{detected}」",
            "severity": "fail",
        })
        result.status = "fail"

    # ──────── 规则 2: 出版城市（仅著作/译著） ────────
    if c.parsed.get("type") in ("著作", "译著"):
        needs_city = spec.get("needs_pub_city", True)
        has_city = bool(c.parsed.get("pub_city"))
        if needs_city and not has_city:
            result.errors.append({
                "rule": "needs_pub_city",
                "message": f"《{journal_name}》要求著作标注出版城市，但未找到",
                "severity": "fail",
            })
            result.status = "fail"
            result.suggestions.append({
                "field": "pub_city",
                "current": "(缺失)",
                "suggested": "请补全（常见：北京/上海/南京/香港...）",
            })
        elif not needs_city and has_city:
            result.warnings.append({
                "rule": "no_pub_city",
                "message": f"《{journal_name}》不要求出版城市（直接出版社），但当前含出版城市",
                "severity": "warn",
            })
            if result.status == "ok":
                result.status = "warn"

    # ──────── 规则 3: 文献类型标识 ────────
    if spec.get("needs_doc_type"):
        has_type = bool(re.search(r"\[\s*[MJNCDG]\s*\]", c.raw)) or \
                   bool(re.search(r"\uff3b\s*[MJNCDG]\s*\uff3d", c.raw))
        if not has_type:
            # 著作/期刊类应有标识
            if c.parsed.get("type") in ("著作", "译著"):
                tag = "[M]"
            elif c.parsed.get("type") == "期刊论文":
                tag = "[J]"
            else:
                tag = "[M]/[J]"
            result.errors.append({
                "rule": "needs_doc_type",
                "message": f"《{journal_name}》要求文献类型标识，但未找到",
                "severity": "fail",
            })
            result.status = "fail"
            result.suggestions.append({
                "field": "doc_type_tag",
                "current": "(缺失)",
                "suggested": f"在出版者后加 {tag}",
            })

    # ──────── 规则 4: 同上/同前注使用 ────────
    if re.search(r"(同上(书|注|引|文)?|同前注|前引书|前引文)", c.raw):
        # 学术月刊允许"同上"
        if "学术月刊" not in journal_name:
            result.warnings.append({
                "rule": "no_tongshang",
                "message": "《{0}》禁用「同上/同前注」，应直接标注作者+书名+页码".format(journal_name),
                "severity": "warn",
            })
            if result.status == "ok":
                result.status = "warn"

    # ──────── 规则 5: 英文文献格式提示 ────────
    if _looks_english(c.raw) and spec.get("english_format"):
        result.warnings.append({
            "rule": "english_format",
            "message": f"英文文献应使用 {spec['english_format']} 格式",
            "severity": "info",
        })

    return result


def _systems_match(detected: str, expected: str) -> bool:
    """检测体系与期望体系是否兼容"""
    if "页下注" in expected and detected == "页下注":
        return True
    if "尾注" in expected and detected == "尾注":
        return True
    if "夹注" in expected and detected == "夹注":
        return True
    if "作者—年制" in expected and detected == "夹注":
        return True
    return False


def _looks_english(text: str) -> bool:
    """粗判是否英文文献（含作者-出版商-年份格式）"""
    return bool(re.search(r"[A-Z][a-z]+,\s+[A-Z\.]+", text))


def summarize(results: list[ValidationResult]) -> dict:
    """汇总校验结果"""
    from collections import Counter
    statuses = Counter(r.status for r in results)
    rules = Counter()
    for r in results:
        for e in r.errors:
            rules[e["rule"]] += 1

    return {
        "total": len(results),
        "ok": statuses.get("ok", 0),
        "warn": statuses.get("warn", 0),
        "fail": statuses.get("fail", 0),
        "fail_rate": round(statuses.get("fail", 0) / len(results), 3) if results else 0,
        "top_fail_rules": dict(rules.most_common(5)),
    }


if __name__ == "__main__":
    from engine.parser import parse
    import json

    if len(sys.argv) < 3:
        print("用法: python3 -m engine.validator <paper.txt> <journal_name>")
        sys.exit(1)

    text = Path(sys.argv[1]).read_text(encoding="utf-8")
    journal = sys.argv[2]

    citations = parse(text)
    results = validate(citations, journal)

    out = {
        "target_journal": journal,
        "summary": summarize(results),
        "results": [r.to_dict() for r in results],
    }
    print(json.dumps(out, ensure_ascii=False, indent=2))