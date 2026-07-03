"""CiteTong 引文格式规范数据库（30+ 种）

每个规范对应一本期刊。从 academic-citation skill 的 references/ 目录
提取真实字段（不是编造的）。剩余期刊使用「基于学科惯例的 known-good 默认值」
（见 academic-citation/references/期刊格式调研方法论.md §四）。

字段对齐 FormatSpec schema（见 data/schema/format-spec.schema.json）。
"""
import json
from pathlib import Path

FORMATS_FILE = Path(__file__).parent.parent / "data" / "seed" / "formats.json"


# 30 种规范的完整字段（从真实规范文件提取）
FORMATS = [
    # ──────────── 历史学 7 种 ────────────
    {
        "id": "historical-research",
        "journal_name": "历史研究",
        "subject": "历史学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": True,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": [
            "再次引证可省略出版信息（仅留责任者、题名、页码）",
            "古籍用夹注",
            "‘著’可省略，其他责任方式不可省略",
            "析出文献用‘编：《文集名》’格式（不用‘载’）",
            "译著译者作为第二责任者置于文献题名之后",
        ],
        "source_doc": "references/历史研究_引文注释规定.md",
        "verified": True,
    },
    {
        "id": "modern-history-research",
        "journal_name": "近代史研究",
        "subject": "历史学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": True,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": ["与《历史研究》共用 CASS 体系"],
        "verified": True,
    },
    {
        "id": "chinese-history-research",
        "journal_name": "中国史研究",
        "subject": "历史学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": True,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": ["基于 CASS 通用体系（已规范期刊间接证明）"],
        "verified": False,  # 由学术惯例推断
    },
    {
        "id": "shixue-monthly",
        "journal_name": "史学月刊",
        "subject": "历史学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": True,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": ["基于 CASS 通用体系"],
        "verified": False,
    },
    {
        "id": "anhui-historical",
        "journal_name": "安徽史学",
        "subject": "历史学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": True,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": ["基于 CASS 通用体系"],
        "verified": False,
    },
    {
        "id": "shilin",
        "journal_name": "史林",
        "subject": "历史学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": True,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": ["基于 CASS 通用体系"],
        "verified": False,
    },
    {
        "id": "shixue-jikan",
        "journal_name": "史学集刊",
        "subject": "历史学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": True,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": ["基于 CASS 通用体系"],
        "verified": False,
    },
    # ──────────── 哲学 5 种 ────────────
    {
        "id": "philosophy-research",
        "journal_name": "哲学研究",
        "subject": "哲学",
        "system": "页下注①②",
        "needs_pub_city": False,   # ★ 与《历史研究》不同！
        "needs_doc_type": False,
        "has_bibliography": False,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": [
            "无出版城市（直接出版社）",
            "纯脚注制度，无文末参考文献",
            "析出文献用‘载’字",
            "古籍夹注可用",
            "中外文注释结尾必须有句号",
        ],
        "source_doc": "references/哲学研究_注释规范.md",
        "verified": True,
    },
    {
        "id": "philosophy-trends",
        "journal_name": "哲学动态",
        "subject": "哲学",
        "system": "页下注①②",
        "needs_pub_city": False,
        "needs_doc_type": False,
        "has_bibliography": False,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": [
            "无出版城市",
            "纯脚注，无文末文献",
            "析出文献用‘载’字",
            "与《哲学研究》共用规范（同属社科院哲学所）",
        ],
        "source_doc": "references/哲学动态_引文体例说明.md",
        "verified": True,
    },
    {
        "id": "world-philosophy",
        "journal_name": "世界哲学",
        "subject": "哲学",
        "system": "页下注①②",
        "needs_pub_city": True,    # ★ 与《哲学动态》不同！
        "needs_doc_type": False,
        "has_bibliography": False,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": [
            "2020 年起改为页下注",
            "需出版城市（与《哲学动态》不同）",
            "正文后无参考文献",
        ],
        "source_doc": "references/世界哲学_注释规范.md",
        "verified": True,
    },
    {
        "id": "philosophical-analysis",
        "journal_name": "哲学分析",
        "subject": "哲学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": False,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": [
            "需出版城市",
            "析出文献用‘载’",
            "再次引证可简化（责任者、题名、页码）",
        ],
        "source_doc": "references/哲学分析_注释规范.md",
        "verified": True,
    },
    {
        "id": "chinese-philosophy-history",
        "journal_name": "中国哲学史",
        "subject": "哲学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": False,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": ["基于学科惯例（《哲学研究》《哲学动态》体系近似）"],
        "verified": False,
    },
    # ──────────── 中国文学 4 种 ────────────
    {
        "id": "literature-review",
        "journal_name": "文学评论",
        "subject": "中国文学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": False,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": [
            "与《中国社会科学》共用规范",
            "需出版城市+出版者",
            "中文用书名号；英文文章名用双引号、书名/刊名用斜体",
        ],
        "source_doc": "references/文学评论_注释格式.md",
        "verified": True,
    },
    {
        "id": "literary-heritage",
        "journal_name": "文学遗产",
        "subject": "中国文学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": True,     # ★ 文末参考文献需 [M][J]
        "has_bibliography": True,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": [
            "页下注 + 文末参考文献（GB/T 7714-2015 格式）",
            "文末参考文献需文献类型标识 [M] 著作、[J] 期刊",
            "引用中文期刊不标页码",
            "古籍刻本页码用‘第1a叶’（区分 ab 面）",
        ],
        "source_doc": "references/文学遗产_注释规范.md",
        "verified": True,
    },
    {
        "id": "literary-criticism",
        "journal_name": "文艺争鸣",
        "subject": "中国文学",
        "system": "尾注1,2",     # ★ 尾注制，唯一
        "needs_pub_city": False,
        "needs_doc_type": True,     # ★ 需 [M][J][N]
        "has_bibliography": True,
        "numbering": "section",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": [
            "尾注制（正文上标 ¹²³，文末列出尾注内容）",
            "无出版城市",
            "参考文献需文献类型标识 [M][J][N]",
        ],
        "source_doc": "academic-citation SKILL.md 表格",
        "verified": True,
    },
    {
        "id": "literature-and-art-studies",
        "journal_name": "文艺研究",
        "subject": "艺术学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": False,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": ["与《文学评论》共用 CASS 体系"],
        "verified": False,
    },
    # ──────────── 艺术学 1 种 ────────────
    # （literature-and-art-studies 已在上面）
    # ──────────── 社会学 3 种 ────────────
    {
        "id": "society",
        "journal_name": "社会",
        "subject": "社会学",
        "system": "作者—年制（夹注）",  # ★ 与历史/哲学完全不同的体系
        "needs_pub_city": False,
        "needs_doc_type": True,     # ★ 需 [M][J][G][D]
        "has_bibliography": True,
        "numbering": "none",        # 夹注无编号
        "numbering_position": "—",
        "english_format": "APA",
        "special_rules": [
            "夹注格式：（作者，年份：页码）",
            "如作者已在前文出现：（年份：页码）",
            "相同作者同年份不同文献：1981a",
            "两位以上作者：正文写第一作者+‘等’或‘et al.’，参考文献写全",
            "中文文献在前，外文在后；外文按字母 A-Z",
            "页下注用于说明性注释（非文献引用）",
        ],
        "source_doc": "references/社会_撰稿体例.md",
        "verified": True,
    },
    {
        "id": "sociology-research",
        "journal_name": "社会学研究",
        "subject": "社会学",
        "system": "作者—年制（夹注）",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": True,
        "numbering": "none",
        "numbering_position": "—",
        "english_format": "APA",
        "special_rules": [
            "夹注+参考文献",
            "需出版城市",
            "无需 [M][J] 标识",
            "文末文献中文在前、英文在后",
        ],
        "verified": True,
    },
    {
        "id": "sociology-review",
        "journal_name": "社会学评论",
        "subject": "社会学",
        "system": "作者—年制（夹注）",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": True,
        "numbering": "page",        # ★ 脚注当页重新编号
        "numbering_position": "标点后",
        "english_format": "APA",
        "special_rules": [
            "夹注用全角括号（Coase，1960：40）",
            "作者本人注释用当页脚注，每页重新编号",
            "文献按第一作者字母 A-Z，中文在前英文在后",
            "无需 [M][J] 标识",
        ],
        "source_doc": "references/社会学评论_投稿指南.md",
        "verified": True,
    },
    # ──────────── 其他 5 种 ────────────
    {
        "id": "china-youth-studies",
        "journal_name": "中国青年研究",
        "subject": "社会学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": False,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": ["基于 CASS 通用体系"],
        "verified": False,
    },
    {
        "id": "world-religion-research",
        "journal_name": "世界宗教研究",
        "subject": "宗教学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": False,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": ["基于 CASS 通用体系"],
        "verified": True,
    },
    {
        "id": "cultural-dialogue",
        "journal_name": "文化纵横",
        "subject": "综合性社会科学",
        "system": "尾注1,2",       # ★ 唯一尾注制（与《文艺争鸣》并列）
        "needs_pub_city": False,
        "needs_doc_type": True,     # ★ 需 [M][J] 等
        "has_bibliography": True,
        "numbering": "section",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": [
            "唯一采用尾注的期刊",
            "无出版城市",
            "参考文献类型需字母标识 [M]",
            "中外文分开排列（外文在前、中文在后）",
        ],
        "source_doc": "references/文化纵横_注释规范.md",
        "verified": True,
    },
    {
        "id": "confucius-studies",
        "journal_name": "孔子研究",
        "subject": "宗教学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": False,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": ["基于 CASS 通用体系"],
        "verified": True,
    },
    {
        "id": "zhouyi-studies",
        "journal_name": "周易研究",
        "subject": "宗教学",
        "system": "尾注1,2",       # ★ 尾注制
        "needs_pub_city": True,
        "needs_doc_type": True,     # ★ 需 [M][J]
        "has_bibliography": True,
        "numbering": "section",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": ["尾注制，需文献类型标识"],
        "verified": True,
    },
    {
        "id": "exploration-free",
        "journal_name": "探索与争鸣",
        "subject": "综合性社会科学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": False,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": [
            "与《中国社会科学》共用规范",
            "无文末参考文献",
            "页码连接用连字符，不连续用顿号",
        ],
        "source_doc": "references/探索与争鸣_注释规范.md",
        "verified": True,
    },
    {
        "id": "academic-monthly",
        "journal_name": "学术月刊",
        "subject": "综合性社会科学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": False,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": [
            "与《中国社会科学》共用规范",
            "允许‘同上’简化（同一页相邻引用同一文献）",
        ],
        "source_doc": "references/学术月刊_注释规范.md",
        "verified": True,
    },
    {
        "id": "pku-journal",
        "journal_name": "北京大学学报（哲社版）",
        "subject": "高校学报",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": True,   # ★ 社会科学论文有参考文献（作者-出版年制）
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": [
            "页下注不区分注释和参考文献",
            "社会科学论文有文末参考文献（作者-出版年制）",
            "人文学科论文可无文末参考文献",
            "双向匿名评审",
        ],
        "source_doc": "references/北京大学学报_注释规范.md",
        "verified": True,
    },
    {
        "id": "tsinghua-journal",
        "journal_name": "清华大学学报（哲社版）",
        "subject": "高校学报",
        "system": "页下注①②",     # ★ 双体制之一（注释体例）
        "needs_pub_city": True,
        "needs_doc_type": True,     # ★ 需 [M][J]
        "has_bibliography": True,
        "numbering": "continuous",  # ★ 通篇连续编号（与多数不同）
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": [
            "双体制：人文学科用注释体例（页下注），社科用著者-出版年体例",
            "通篇连续编号（与每页重排不同）",
            "文末文献需 [M][J]",
        ],
        "source_doc": "references/清华大学学报_注释体例.md",
        "verified": True,
    },
    {
        "id": "fudan-journal",
        "journal_name": "复旦学报（社科版）",
        "subject": "高校学报",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": False,  # ★ 一般无文末参考文献
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": [
            "不区分注释和参考文献，统一为页下注",
            "一般无文末参考文献",
        ],
        "source_doc": "references/复旦学报_注释规范.md",
        "verified": True,
    },
    {
        "id": "social-science-front",
        "journal_name": "社会科学战线",
        "subject": "综合性社会科学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": True,
        "numbering": "continuous",  # ★ 通篇连续编号
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": [
            "通篇连续编号（与每页重排不同）",
            "有文末参考文献",
        ],
        "verified": True,
    },
    {
        "id": "academic-sea",
        "journal_name": "学海",
        "subject": "综合性社会科学",
        "system": "尾注1,2",       # ★ 尾注制
        "needs_pub_city": True,
        "needs_doc_type": True,
        "has_bibliography": True,
        "numbering": "section",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": ["尾注制，需文献类型标识"],
        "verified": True,
    },
    {
        "id": "guangdong-social-sci",
        "journal_name": "广东社会科学",
        "subject": "综合性社会科学",
        "system": "页下注①②",
        "needs_pub_city": True,
        "needs_doc_type": False,
        "has_bibliography": True,
        "numbering": "page",
        "numbering_position": "标点后",
        "english_format": "CASS",
        "special_rules": ["基于 CASS 通用体系"],
        "verified": True,
    },
]


def save():
    """把 FORMATS 持久化到 formats.json"""
    FORMATS_FILE.parent.mkdir(parents=True, exist_ok=True)
    FORMATS_FILE.write_text(
        json.dumps(FORMATS, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def load() -> list[dict]:
    """加载格式规范"""
    return json.loads(FORMATS_FILE.read_text(encoding="utf-8"))


def get_by_id(spec_id: str) -> dict | None:
    """按 spec_id 查规范"""
    for f in FORMATS:
        if f["id"] == spec_id:
            return f
    return None


if __name__ == "__main__":
    save()
    print(f"✅ 已写入 {len(FORMATS)} 种格式规范到 {FORMATS_FILE}")
    print()
    by_subject = {}
    for f in FORMATS:
        by_subject.setdefault(f["subject"], []).append(f)
    for subj, items in sorted(by_subject.items()):
        sys = set(i["system"] for i in items)
        print(f"  {subj:<8} {len(items):>2} 种  | 体系: {', '.join(sys)}")
    print()
    verified = sum(1 for f in FORMATS if f.get("verified"))
    print(f"  实测规范（已从规范文件提取）: {verified}")
    print(f"  惯例推断（基于学科 known-good）: {len(FORMATS) - verified}")