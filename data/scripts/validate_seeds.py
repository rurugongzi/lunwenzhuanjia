#!/usr/bin/env python3
"""
validate_seeds.py — 校验种子数据是否符合 JSON Schema

用法：
    python3 validate_seeds.py

依赖：jsonschema（轻量）
    pip install jsonschema
"""
import json
import sys
from pathlib import Path

try:
    import jsonschema
except ImportError:
    print("❌ 缺少依赖：jsonschema")
    print("   pip install jsonschema")
    sys.exit(1)

ROOT = Path(__file__).parent.parent
SCHEMA_DIR = ROOT / "schema"
SEED_DIR = ROOT / "seed"


def validate(name, schema_path, data_path):
    schema = json.loads(schema_path.read_text(encoding="utf-8"))
    data = json.loads(data_path.read_text(encoding="utf-8"))

    if isinstance(data, list):
        errors = []
        for i, item in enumerate(data):
            try:
                jsonschema.validate(instance=item, schema=schema)
            except jsonschema.ValidationError as e:
                errors.append(f"  [{i}] {e.message}")
        if errors:
            print(f"❌ {name}: {len(errors)} 项不符")
            for e in errors[:5]:
                print(e)
            if len(errors) > 5:
                print(f"  ... 共 {len(errors)} 项错误")
            return False
        print(f"✅ {name}: {len(data)} 项全部合规")
        return True
    else:
        try:
            jsonschema.validate(instance=data, schema=schema)
            print(f"✅ {name}: 1 项合规")
            return True
        except jsonschema.ValidationError as e:
            print(f"❌ {name}: {e.message}")
            return False


def main():
    print("=== 种子数据 Schema 校验 ===\n")
    ok = True
    ok &= validate(
        "journals-271.json",
        SCHEMA_DIR / "journal.schema.json",
        SEED_DIR / "journals-271.json",
    )
    print()
    print("=== 完成 ===")
    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()