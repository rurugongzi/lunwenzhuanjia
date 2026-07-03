# engine — 核心引擎（D2）

> 状态：D2 即将开工 · 占位

## 计划模块

| 模块 | 文件 | 状态 |
|------|------|:----:|
| 引文解析器 | `parser.py` | ⬜ |
| 格式校验器 | `validator.py` | ⬜ |
| 期刊推荐器 | `recommender.py` | ⬜ |
| 改稿建议器 | `suggester.py` | ⬜ |
| CLI 入口 | `cli.py` | ⬜ |

## 设计原则

1. **纯 Python · 零外部依赖**（除标准库）— 便于嵌入 Next.js API route
2. **数据驱动** — 期刊规范存在 `data/seed/formats.json`，引擎只读不改
3. **可测试** — 每个模块独立输入输出，便于 unit test
4. **可降级** — regex 解析失败时，可 fallback 到 LLM（DeepSeek API）

## D2 入口

```bash
cd ~/hermes-projects/lunwenzhuanjia
python3 -m engine.cli \
  --input tests/fixtures/sample.txt \
  --journal "历史研究" \
  --output report.json
```

详见 `../ROADMAP.md` D2 任务卡。