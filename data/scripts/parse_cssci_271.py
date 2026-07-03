#!/usr/bin/env python3
"""
parse_cssci_271.py — 从 ~/Downloads/cssci_8学科_271种.md 解析出结构化 JSON

用法：
    python3 parse_cssci_271.py

输出：
    data/seed/journals-271.json   (271 种期刊)
    data/seed/subjects-8.json     (8 学科)
    data/seed/stats.json          (统计)

依赖：仅 Python 标准库
"""
import json
import re
import sys
from pathlib import Path

# 源文件
SRC = Path.home() / "Downloads" / "cssci_8学科_271种.md"
OUT = Path(__file__).parent.parent / "seed"
OUT.mkdir(parents=True, exist_ok=True)

# 学科 code（8 学科，ID 友好）
SUBJECT_CODES = {
    "哲学":      "philosophy",
    "历史学":    "history",
    "中国文学":  "chinese-literature",
    "外国文学":  "foreign-literature",
    "艺术学":    "arts",
    "社会学":    "sociology",
    "政治学":    "political-science",
    "法学":      "law",
}

# 41 种已规范期刊（来自 academic-citation skill SKILL.md 表格）
# 映射：期刊名 → format_spec_id
FORMATTED_JOURNALS = {
    "世界宗教研究": "world-religion-research",
    "近代史研究": "modern-history-research",
    "文史哲": "wen-shi-zhe",
    "世界哲学": "world-philosophy",
    "哲学分析": "philosophical-analysis",
    "文学评论": "literature-review",
    "文学遗产": "literary-heritage",
    "探索与争鸣": "exploration-free",
    "学术月刊": "academic-monthly",
    "文化纵横": "cultural-dialogue",
    "北京大学学报（哲社版）": "pku-journal",
    "清华大学学报（哲社版）": "tsinghua-journal",
    "复旦学报（社科版）": "fudan-journal",
    "社会科学战线": "social-science-front",
    "文艺争鸣": "literary-criticism",
    "孔子研究": "confucius-studies",
    "周易研究": "zhouyi-studies",
    "中国青年研究": "china-youth-studies",
    "学海": "academic-sea",
    "广东社会科学": "guangdong-social-sci",
    "社会": "society",
    "社会学研究": "sociology-research",
    "社会学评论": "sociology-review",
    "中国社会科学": "cass-social-sciences",       # 推断
    "历史研究": "historical-research",            # 推断
    "中国哲学史": "chinese-philosophy-history",    # 推断
    "哲学动态": "philosophy-trends",              # 推断
    "哲学研究": "philosophy-research",            # 推断
    "文艺研究": "literature-and-art-studies",      # 推断
    "中国史研究": "chinese-history-research",      # 推断
    "中国史研究动态": "chinese-history-research-trends",  # 推断
    "史学史研究": "historical-sciences-history",  # 推断
    "史学理论研究": "historical-theory-research",  # 推断
    "安徽史学": "anhui-historical",               # 推断
    "史林": "shilin",                             # 推断
    "史学集刊": "shixue-jikan",                   # 推断
    "史学月刊": "shixue-monthly",                 # 推断
}


def slugify(name: str) -> str:
    """生成 ID 友好的 slug
    保留中文 + 拉丁字符，去标点和括号副标题，转小写
    """
    s = re.sub(r"[（(][^）)]*[）)]", "", name)  # 去括号副标题
    s = re.sub(r"[\s·—\-_/.,，；:：'\"!?]", "-", s)
    s = re.sub(r"-+", "-", s).strip("-").lower()
    return s or "unknown"


def parse_source(md_text: str):
    """解析 markdown，yield (subject, source, rank, name)"""
    lines = md_text.splitlines()
    current_subject = None
    current_source = None  # 'main' | 'ext'
    for ln in lines:
        s = ln.strip()
        # 学科标题（剥 "（N 种）" 后缀）
        m = re.match(r"^##\s+\d+\.\s+(.+?)$", s)
        if m:
            raw_subject = m.group(1).strip()
            raw_subject = re.sub(r"[（(]\d+\s*种[）)]\s*$", "", raw_subject)
            if raw_subject in SUBJECT_CODES:
                current_subject = raw_subject
                current_source = None
                continue
        # 主目录/扩展版
        if "CSSCI 主目录" in s or "**主目录**" in s:
            current_source = "main"
            continue
        if "CSSCI 扩展版" in s or "**扩展版**" in s:
            current_source = "ext"
            continue
        # 期刊行
        m = re.match(r"^(\d+)\.\s+(.+?)$", s)
        if m and current_subject and current_source:
            rank = int(m.group(1))
            name = m.group(2).strip()
            if name and not name.startswith("---") and "汇总" not in name:
                yield current_subject, current_source, rank, name


def main():
    if not SRC.exists():
        print(f"❌ 源文件不存在: {SRC}", file=sys.stderr)
        sys.exit(1)

    md_text = SRC.read_text(encoding="utf-8")
    journals = []
    subjects = {name: {"main": [], "ext": []} for name in SUBJECT_CODES}

    for subject, source, rank, name in parse_source(md_text):
        subject_id = SUBJECT_CODES[subject]
        # 分离主名 + 括号副标题
        m = re.match(r"^(.+?)([（(]([^）)]+)[）)])\s*$", name)
        if m:
            base_name = m.group(1).strip()
            alias = m.group(3).strip()
        else:
            base_name = name
            alias = None

        has_spec = name in FORMATTED_JOURNALS or base_name in FORMATTED_JOURNALS
        spec_id = FORMATTED_JOURNALS.get(name) or FORMATTED_JOURNALS.get(base_name)

        journal = {
            "id": f"{subject_id}-{slugify(base_name)}",
            "name": base_name,
            "alias": alias,
            "subject": subject,
            "subject_id": subject_id,
            "source": source,
            "cssci_year": "2025-2026",
            "rank_in_subject": rank,
            "has_format_spec": has_spec,
            "format_spec_id": spec_id,
        }
        journals.append(journal)
        subjects[subject][source].append(journal["id"])

    # 输出 journals.json
    journals_path = OUT / "journals-271.json"
    journals_path.write_text(
        json.dumps(journals, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # 输出 subjects.json
    subjects_out = []
    for name, code in SUBJECT_CODES.items():
        s = subjects[name]
        subjects_out.append({
            "id": code,
            "name": name,
            "name_en": {
                "哲学": "Philosophy",
                "历史学": "History",
                "中国文学": "Chinese Literature",
                "外国文学": "Foreign Literature",
                "艺术学": "Arts",
                "社会学": "Sociology",
                "政治学": "Political Science",
                "法学": "Law",
            }.get(name),
            "count_main": len(s["main"]),
            "count_ext": len(s["ext"]),
            "count_total": len(s["main"]) + len(s["ext"]),
        })
    subjects_path = OUT / "subjects-8.json"
    subjects_path.write_text(
        json.dumps(subjects_out, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # 统计
    stats = {
        "total_journals": len(journals),
        "main_count": sum(1 for j in journals if j["source"] == "main"),
        "ext_count": sum(1 for j in journals if j["source"] == "ext"),
        "with_format_spec": sum(1 for j in journals if j["has_format_spec"]),
        "without_format_spec": sum(1 for j in journals if not j["has_format_spec"]),
        "by_subject": {
            s["name"]: {
                "main": s["count_main"],
                "ext": s["count_ext"],
                "total": s["count_total"],
            }
            for s in subjects_out
        },
        "by_source_year": "CSSCI 2025-2026",
        "source_file": str(SRC),
    }
    stats_path = OUT / "stats.json"
    stats_path.write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")

    # 报告
    print(f"✅ journals-271.json  : {len(journals)} 期刊")
    print(f"✅ subjects-8.json    : {len(subjects_out)} 学科")
    print(f"✅ stats.json         : 统计")
    print()
    print(f"主目录：{stats['main_count']} | 扩展版：{stats['ext_count']} | 合计：{stats['total_journals']}")
    print(f"已规范：{stats['with_format_spec']} | 待规范：{stats['without_format_spec']}")
    print()
    print("各学科分布：")
    for s in subjects_out:
        bar = "█" * s["count_total"]
        print(f"  {s['name']:<8} {s['count_main']:>3}+{s['count_ext']:<2} = {s['count_total']:>3}  {bar}")


if __name__ == "__main__":
    main()
