"""test_parser.py — 引文解析器单元测试"""
import sys
sys.path.insert(0, str(__file__).rsplit("/", 3)[0])  # 到项目根

from engine.parser import parse, _detect_system, summarize

SAMPLE_WENYI = open("tests/fixtures/sample-wenyi.txt").read()


def test_parse_count():
    c = parse(SAMPLE_WENYI)
    assert len(c) == 17, f"应解析 17 条，实得 {len(c)}"


def test_parse_types():
    c = parse(SAMPLE_WENYI)
    types = set(x.parsed.get("type") for x in c)
    assert "期刊论文" in types
    assert "著作" in types
    assert "译著" in types
    assert "报纸" in types
    assert "未知" not in types


def test_parse_all_known():
    c = parse(SAMPLE_WENYI)
    unknown = [x for x in c if x.parsed.get("type") == "未知"]
    assert len(unknown) == 0, f"仍有 {len(unknown)} 条未解析"


def test_detect_system_wenyi():
    sys_detected = _detect_system(SAMPLE_WENYI)
    assert sys_detected == "尾注", f"应为尾注，实得 {sys_detected}"


def test_summary():
    c = parse(SAMPLE_WENYI)
    s = summarize(c)
    assert s["total"] == 17
    assert s["avg_confidence"] >= 0.8


class TestSpecificCitations:
    def _parse(self, raw: str) -> dict:
        from engine.parser import _parse_citation_body
        return _parse_citation_body(raw)

    def test_book(self):
        p = self._parse("汪涌豪：《范畴论》［M］，复旦大学出版社，1999年。")
        assert p.get("type") == "著作"
        assert p.get("author") == "汪涌豪"

    def test_journal(self):
        p = self._parse("袁济喜：《疏野与诗话》，《北京大学学报》［J］2023年第6期。")
        assert p.get("type") == "期刊论文"
        assert p.get("journal") == "北京大学学报"

    def test_translated(self):
        p = self._parse("尼采：《悲剧的诞生》［M］，周国平译，三联书店，1986年。")
        assert p.get("type") == "译著"
        assert p.get("trans") == "周国平"

    def test_newspaper(self):
        p = self._parse("吴中胜：《陶渊明的内修与自得》，《光明日报》［N］2023年3月14日。")
        assert p.get("type") == "报纸"
        assert p.get("newspaper") == "光明日报"

    def test_narrative_journal(self):
        p = self._parse("张振谦：论\"野\"作为诗学范畴，学术界，2015年第4期。")
        assert p.get("type") == "期刊论文"
        assert p.get("author") == "张振谦"


def test_detect_system_mixed():
    assert _detect_system("（鲁迅，2020：23）") == "夹注"
    assert _detect_system("① 赵景深：《文坛忆旧》") == "页下注"
    assert _detect_system("［1］　袁济喜：xxx）") == "尾注"