"""CiteTong 引文解析器

支持 3 种注释体系：
1. 页下注 (①② / 1) / [1])
2. 尾注   ([1] / ¹²)
3. 夹注   ((作者, 年份:页码) / (Author, Year, p.X))

输入：纯文本（Word/PDF 转换后）
输出：Citation 对象列表，含原文、检测体系、解析字段
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Optional


# ─────────────────── 数据结构 ───────────────────

@dataclass
class Citation:
    """一条解析后的引文"""
    raw: str                              # 原文
    system_detected: str                  # 检测到的体系：页下注/尾注/夹注
    marker: Optional[str] = None          # 序号（①② / [1] / ¹ 等）
    parsed: dict = field(default_factory=dict)   # 解析字段
    location: str = ""                    # 在原文中的位置（line:col 或 index）
    confidence: float = 1.0               # 解析置信度 0-1

    def to_dict(self):
        return asdict(self)


# ─────────────────── 体系 1：页下注/尾注 ───────────────────

# 匹配页下注的正文标记（①② / 1) / [1]）
INLINE_MARKERS = re.compile(
    r"(?P<marker>"
    r"[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]"  # 带圈数字
    r"|\[\d+\]"                              # [1] [2]
    r"|\(\d+\)"                              # (1) (2)
    r")"
)

# 匹配注体行（典型的"作者：..."或"[N] ..."或"① ..."等开头）
NOTE_LINE_PATTERNS = [
    # ① 贺麟：《文化与人生》...
    re.compile(
        r"^\s*[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]\s*"
        r"(?P<content>.+?)$"
    ),
    # [1] 陈平原...
    re.compile(
        r"^\s*\[(?P<n>\d+)\]\s*(?P<content>.+?)$"
    ),
    # 全角［1］
    re.compile(
        r"^\s*\uff3b(?P<n>\d+)\uff3d\s*(?P<content>.+?)$"
    ),
    # 1) 陈平原...
    re.compile(
        r"^\s*\d+\)\s*(?P<content>.+?)$"
    ),
    # 1. 陈平原...
    re.compile(
        r"^\s*\d+\.\s+(?P<content>.+?)$"
    ),
]

# 注体结构（CASS 通用）: 作者：《书名》，出版地：出版社，年份，页码。
# 简化版本：分段提取
# 著作（带出版城市）：作者：《书名》，出版地：出版社，年份，第X页
PAT_BOOK_CN_WITH_CITY = re.compile(
    r"^(?P<author>[^：:，,。；;]+?)[:：]"
    r"(?P<title>[《【\[](.+?)[》】\]])"
    r"[，,]?\s*"
    r"(?P<pub_city>[^：:,，：]+?)[:：]"
    r"(?P<publisher>[^，,]+?)[，,]\s*"
    r"(?P<year>\d{4})\s*年?[，,]\s*"
    r"第?\s*(?P<page>\d+(?:[\-—–]\d+)?)\s*页"
)

# 著作（无出版城市）：作者：《书名》［M］，出版社，年份[。|，第X页]
PAT_BOOK_CN = re.compile(
    r"^(?P<author>[^：:，,。；;]+?)[:：]"
    r"(?P<title>[《【\[](.+?)[》】\]])"
    r"(?:\uff3b[MJNCDG]\uff3d)?"  # 跳过 ［M］［J］［N］
    r"[，,]?\s*"
    r"(?P<publisher>[^，,]+?)[，,]\s*"
    r"(?P<year>\d{4})\s*年?"
    r"(?:[，,]\s*第?\s*(?P<page>\d+(?:[\-—–]\d+)?)\s*页)?"
    r"[。\.]?\s*$"
)

PAT_JOURNAL_CN = re.compile(
    r"^(?P<author>[^：:，,。；;]+?)[:：]"
    r"(?P<title>[《【\[](.+?)[》】\]])"
    r"[，,]\s*"
    r"[《【\[](?P<journal>[^》】\]]+?)[》】\]]"
    r"(?:\uff3b[A-Z]\uff3d)?"  # 跳过 ［M］［J］［N］
    r"\s*(?P<year>\d{4})\s*年?第?\s*(?P<issue>\d+)\s*期"
    r"(?:[，,]\s*第?\s*(?P<page>\d+(?:[\-—–]\d+)?)\s*页)?"
)
# 译著（无出版城市）：作者：《书名》［M］，译者译，出版社，年份
PAT_TRANSLATED_BOOK_NO_CITY = re.compile(
    r"^(?P<author>[^：:，,。；;]+?)[:：]"
    r"(?P<title>[《【\[](.+?)[》】\]])"
    r"(?:\uff3b[MJNCDG]\uff3d)?"
    r"[，,]\s*"
    r"(?P<trans>[^，,]+?)\s*译[，,]\s*"
    r"(?P<publisher>[^，,]+?)[，,]\s*"
    r"(?P<year>\d{4})\s*年?"
    r"[。\.]?\s*$"
)  # 注意：括号闭合在最后一行
# p 格式版本的译著正则（带出版城市，从之前保留）
PAT_TRANSLATED_BOOK = re.compile(
    r"^(?P<author>[^：:，,。；;]+?)[:：]"
    r"(?P<title>[《【\[](.+?)[》】\]])"
    r"[，,]\s*"
    r"(?P<trans>[^：:，,。；;]+?)\s*译[，,]\s*"
    r"(?:(?P<pub_city>[^：:,，：]+?)[:：])?"
    r"(?P<publisher>[^，,]+?)[，,]\s*"
    r"(?P<year>\d{4})\s*年?[，,]\s*"
    r"第?\s*(?P<page>\d+(?:[\-—–]\d+)?)\s*页"
)


# ─────────────────── 体系 2：夹注 ───────────────────

# 中文夹注：（张三，2020：25-27）或（张三，2020，25）
INLINE_CN = re.compile(
    r"[（(]"
    r"(?P<author>[^，,：:；;）)]+?)"
    r"[，,]\s*"
    r"(?P<year>\d{4})"
    r"(?:[a-z])?"
    r"\s*[，:：]\s*"
    r"(?P<page>\d+(?:[\-—–]\d+)?)"
    r"[）)]"
)

# 英文夹注：(Author, 2020, p.25) 或 (Author 2020: 25)
INLINE_EN = re.compile(
    r"\("
    r"(?P<author>[A-Z][a-zA-Z\u00C0-\u017F\-]+(?:,\s*[A-Z]\.[\s\-]?)*)"
    r"[,\s]+"
    r"(?P<year>\d{4})"
    r"(?:[:,]\s*p?p?\.\s*(?P<page>\d+(?:[\-—–]\d+)?))?"
    r"\)"
)


# ─────────────────── 主解析函数 ───────────────────

def parse(text: str, hint: Optional[str] = None) -> list[Citation]:
    """解析文本，返回 Citation 列表

    Args:
        text: 论文纯文本
        hint: 已知体系（页下注/尾注/夹注）；为 None 时自动检测

    Returns:
        Citation 列表
    """
    citations: list[Citation] = []

    # ─── 阶段 1：检测体系 ───
    if hint is None:
        hint = _detect_system(text)

    # ─── 阶段 2：按体系抽取 ───
    if hint == "夹注":
        citations = _extract_inline(text)
    else:
        # 页下注和尾注用同一套规则，差别仅在文末 vs 文下
        citations = _extract_notes(text, hint)

    # ─── 阶段 3：解析每条引文的内部结构 ───
    for c in citations:
        c.parsed = _parse_citation_body(c.raw)
        c.confidence = _confidence(c)

    return citations


def _detect_system(text: str) -> str:
    """自动检测注释体系"""
    # 统计三种标记的出现次数
    cn_paren = len(re.findall(r"[（(][^）)]*\d{4}[^）)]*[）)]", text))
    circled = len(re.findall(r"[①②③④⑤⑥⑦⑧⑨⑩]", text))
    bracket = len(re.findall(r"\[\d+\]", text))
    fullwidth_bracket = len(re.findall(r"\uff3b\d+\uff3d", text))

    if fullwidth_bracket > circled + bracket:
        return "尾注"
    if cn_paren > max(circled, bracket, fullwidth_bracket):
        return "夹注"
    return "页下注"


def _extract_notes(text: str, system: str) -> list[Citation]:
    """从文本抽取页下注/尾注"""
    citations: list[Citation] = []
    lines = text.splitlines()

    for i, line in enumerate(lines):
        for pat in NOTE_LINE_PATTERNS:
            m = pat.match(line)
            if m:
                content = m.group("content").strip() if "content" in m.groupdict() else line.strip()
                marker_match = re.match(
                    r"^\s*(\[?(?P<n>\d+|[\u2460-\u2473])\]?)",
                    content,
                )
                marker = marker_match.group("n") if marker_match else None
                citations.append(
                    Citation(
                        raw=content,
                        system_detected=system,
                        marker=marker,
                        location=f"L{i+1}",
                    )
                )
                break

    return citations


def _extract_inline(text: str) -> list[Citation]:
    """从文本抽取夹注"""
    citations: list[Citation] = []
    for m in INLINE_CN.finditer(text):
        citations.append(
            Citation(
                raw=m.group(0),
                system_detected="夹注",
                location=f"@ {m.start()}",
                parsed={
                    "author": m.group("author").strip(),
                    "year": m.group("year"),
                    "page": m.group("page"),
                },
            )
        )
    for m in INLINE_EN.finditer(text):
        citations.append(
            Citation(
                raw=m.group(0),
                system_detected="夹注",
                location=f"@ {m.start()}",
                parsed={
                    "author": m.group("author").strip(),
                    "year": m.group("year"),
                    "page": m.group("page") or "",
                },
            )
        )
    return citations


def _parse_citation_body(raw: str) -> dict:
    """从注体原文解析结构化字段"""
    s = raw.strip()

    # 1) 译著（有出版城市）
    m = PAT_TRANSLATED_BOOK.match(s)
    if m:
        d = m.groupdict()
        return {
            "type": "译著",
            "author": d["author"].strip(),
            "title": d["title"].strip(),
            "trans": d["trans"].strip(),
            "pub_city": (d.get("pub_city") or "").strip(),
            "publisher": d["publisher"].strip(),
            "year": d["year"],
            "page": d.get("page", ""),
        }

    # 2) 译著（无出版城市）
    m = PAT_TRANSLATED_BOOK_NO_CITY.match(s)
    if m:
        d = m.groupdict()
        return {
            "type": "译著",
            "author": d["author"].strip(),
            "title": d["title"].strip(),
            "trans": d["trans"].strip(),
            "pub_city": "",
            "publisher": d["publisher"].strip(),
            "year": d["year"],
            "page": "",
        }

    # 2) 期刊论文
    m = PAT_JOURNAL_CN.match(s)
    if m:
        d = m.groupdict()
        return {
            "type": "期刊论文",
            "author": d["author"].strip(),
            "title": d["title"].strip(),
            "journal": d["journal"].strip(),
            "year": d["year"],
            "issue": d["issue"],
            "page": (d.get("page") or "").strip(),
        }

    # 3) 普通著作（先尝试带城市格式）
    m = PAT_BOOK_CN_WITH_CITY.match(s)
    if m:
        d = m.groupdict()
        return {
            "type": "著作",
            "author": d["author"].strip(),
            "title": d["title"].strip(),
            "pub_city": (d.get("pub_city") or "").strip(),
            "publisher": d["publisher"].strip(),
            "year": d["year"],
            "page": d["page"],
        }

    # 4) 普通著作（无出版城市）
    m = PAT_BOOK_CN.match(s)
    if m:
        d = m.groupdict()
        return {
            "type": "著作",
            "author": d["author"].strip(),
            "title": d["title"].strip(),
            "pub_city": "",
            "publisher": d["publisher"].strip(),
            "year": d["year"],
            "page": d["page"],
        }

    # 5) 报纸：作者：《文章名》，《报纸名》［N］年月日
    m = re.match(
        r"^(?P<author>[^：:，,。]+?)[:：]"
        r"(?P<title>[《【\[](.+?)[》】\]])"
        r"[，,]\s*"
        r"[《【\[](?P<newspaper>[^》】\]]+)[》】\]]"
        r"(?:\uff3b[Nn]\uff3d)?\s*"
        r"(?P<year>\d{4})\s*年\s*(?P<month>\d+)\s*月\s*(?P<day>\d+)\s*日",
        s,
    )
    if m:
        d = m.groupdict()
        return {"type": "报纸", "author": d["author"].strip(),
                "title": d["title"].strip(), "newspaper": d["newspaper"].strip(),
                "date": f"{d['year']}-{d['month']}-{d['day']}"}

    # 6) 无书名号自然叙述：作者：文章名，刊名，年年第X期
    m = re.match(
        r"^(?P<author>[^：:，,。]+?)[:：]"
        r"(?P<title>[^，,。]+?)"
        r"[，,]\s*"
        r"(?P<journal>[^，,]+?)[，,]\s*"
        r"(?P<year>\d{4})\s*年\s*第\s*(?P<issue>\d+)\s*期",
        s,
    )
    if m:
        d = m.groupdict()
        return {"type": "期刊论文", "author": d["author"].strip(),
                "title": d["title"].strip(), "journal": d["journal"].strip(),
                "year": d["year"], "issue": d["issue"]}

    return {"type": "未知", "raw": s}


def _confidence(c: Citation) -> float:
    """评估解析置信度"""
    if c.system_detected == "夹注":
        return 0.95 if c.parsed.get("author") else 0.3
    p = c.parsed
    if p.get("type") == "未知":
        return 0.3
    if p.get("author") and p.get("title") and p.get("year"):
        return 0.95
    return 0.6


# ─────────────────── CLI 友好输出 ───────────────────

def summarize(citations: list[Citation]) -> dict:
    """汇总统计"""
    from collections import Counter
    types = Counter(c.parsed.get("type", "未知") for c in citations)
    systems = Counter(c.system_detected for c in citations)
    avg_conf = sum(c.confidence for c in citations) / len(citations) if citations else 0

    return {
        "total": len(citations),
        "by_type": dict(types),
        "by_system": dict(systems),
        "avg_confidence": round(avg_conf, 3),
        "low_confidence_count": sum(1 for c in citations if c.confidence < 0.5),
    }


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        text = Path(sys.argv[1]).read_text(encoding="utf-8")
    else:
        text = sys.stdin.read()

    citations = parse(text)
    import json
    print(json.dumps([c.to_dict() for c in citations], ensure_ascii=False, indent=2))
    print("---")
    print(json.dumps(summarize(citations), ensure_ascii=False, indent=2))