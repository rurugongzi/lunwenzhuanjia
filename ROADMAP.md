# 引用通 / CiteTong — 5 天路线图（D2-D5 任务卡）

## 状态总览

| Day | 主题 | 状态 | 关键产出 |
|-----|------|:----:|----------|
| D1 | 数据地基 | ✅ | 271 期刊 + Schema + PRD + STACK |
| D2 | 核心引擎 | ⏳ | CLI demo + 引文解析器 + 校验器 |
| D3 | Web UI | ⬜ | Next.js 上传/报告界面 |
| D4 | 商业闭环 | ⬜ | 注册/订阅/微信支付 |
| D5 | 部署上线 | ⬜ | Vercel + 公众号引流页 |

---

## D2 任务卡：核心引擎（CLI demo）

> 目标：跑通 "上传文本 → 解析引文 → 按目标期刊校验 → 输出报告" 全流程，10 篇真实论文验证准确率 ≥ 80%。

### D2.1 数据扩展：23 → 30 种规范

- [ ] 从 `~/.hermes/skills/academic-citation/references/` 选 7 种高频期刊，补全格式规范
- [ ] 重点对象：历史研究、哲学研究、文艺争鸣、社会学研究、文学评论、文学遗产、文艺研究
- [ ] 写入 `data/seed/formats.json`，按 `format-spec.schema.json` 校验
- [ ] 时间预算：2 小时

### D2.2 引文解析器（`engine/parser.py`）

- [ ] 支持 3 种体系：页下注 `①②`、尾注 `[1]`、夹注 `(作者 年)`
- [ ] 正则覆盖：著作 / 期刊 / 析出文献 / 译著 / 古籍 / 英文文献
- [ ] 输出 JSONL：`{raw, type, parsed: {author, year, title, ...}}`
- [ ] 测试：人工标注 5 篇论文（每篇 ~30 条）作为 ground truth
- [ ] 时间预算：6 小时

### D2.3 格式校验器（`engine/validator.py`）

- [ ] 按目标期刊 spec 逐条规则：
  - 页下注位置（标点前/后）
  - 是否需要出版城市
  - 是否需要 [M][J] 文献类型标识
  - 再次引用是否省略出版信息
  - 英文文献格式（CASS/Chicago/APA）
- [ ] 输出：每条引文的 ✓/✗ + 错因 + 修复建议
- [ ] 时间预算：4 小时

### D2.4 CLI 入口（`engine/cli.py`）

```bash
python3 -m engine.cli \
  --input path/to/paper.txt \
  --journal "历史研究" \
  --output report.json
```

- [ ] 输入：纯文本（Word/PDF 解析留 D3）
- [ ] 输出：JSON 报告 + Markdown 报告
- [ ] 时间预算：1 小时

### D2.5 真实论文验证

- [ ] 拿用户已有的 14 篇论文（research/ 目录）抽 3 篇作为验证集
- [ ] 标注 ground truth（用户 30 分钟）
- [ ] 跑解析 + 校验，记录误判类型
- [ ] 调整 regex 直到准确率 ≥ 80%
- [ ] 时间预算：3 小时

### D2 产出物清单

- [ ] `engine/__init__.py`
- [ ] `engine/parser.py` (~300 行)
- [ ] `engine/validator.py` (~250 行)
- [ ] `engine/cli.py` (~50 行)
- [ ] `data/seed/formats.json` (30 种规范)
- [ ] `tests/test_parser.py` (10 用例)
- [ ] `tests/test_validator.py` (10 用例)
- [ ] `tests/fixtures/` (5 篇标注论文)
- [ ] `D2_DEMO.md` (D2 完成的 demo 录屏/截图)

### D2 验收标准

| 指标 | 目标 |
|------|------|
| 解析准确率 | ≥ 80%（F1） |
| 校验准确率 | ≥ 85% |
| CLI 跑通 | `python3 -m engine.cli --input tests/fixtures/sample.txt --journal "历史研究"` 输出一份可读报告 |
| 覆盖期刊 | ≥ 30 种有规范 |

---

## D3 任务卡：Web UI（Next.js）

> 目标：用户可上传手稿 → 看到校验报告 → 一键导出改稿 Word。

### D3.1 Next.js 项目初始化

```bash
cd ~/hermes-projects/lunwenzhuanjia/web
pnpm create next-app@latest . --typescript --tailwind --app
```

### D3.2 页面骨架

- `/` 首页（产品介绍 + 上传入口）
- `/check` 校验页（上传 → 选目标刊 → 报告）
- `/journals` 期刊库（271 种浏览）
- `/login` `/signup` `/dashboard` `/pricing`

### D3.3 核心组件

- `<UploadBox />` — 拖拽上传 Word/PDF
- `<JournalPicker />` — 271 种搜索选择
- `<ReportTable />` — 校验报告表格（✓/✗ + 改稿建议）
- `<DiffView />` — 改稿前后对比
- `<ExportButton />` — 导出 Word 报告

### D3 产出

- [ ] 4 个核心页面
- [ ] 5 个核心组件
- [ ] API routes：`/api/upload`、`/api/check`、`/api/journals`
- [ ] 部署到 Vercel preview

---

## D4 任务卡：商业闭环

### D4.1 认证系统

- Auth.js (NextAuth) v5
- 微信扫码登录（学者首选）+ 邮箱密码兜底

### D4.2 订阅系统

- 4 个套餐：¥1/¥39/¥99/¥399
- 微信支付 v3 集成
- 用量配额 + 限流

### D4.3 管理后台

- 用户列表 / 订单列表 / 用量统计
- 数据导出 CSV

---

## D5 任务卡：部署上线

### D5.1 域名 + DNS

- 注册 `lunwenzhuanjia.cn`（如可用）+ `lunwenzhuanjia.com`
- Cloudflare 代理 + SSL

### D5.2 部署

- Vercel 生产环境
- 环境变量：DeepSeek API、DB URL、WeChat Pay Key
- 自定义域名绑定

### D5.3 引流内容

- 公众号软文 1 篇（基于"投稿被退稿的 7 个引文错误"）
- 14 篇论文中挑 1-2 篇加脚注引流到 CiteTong
- 小红书/知乎 SEO 软文 3 篇

### D5.4 监控

- Sentry 错误监控
- Vercel Analytics 性能
- 微信支付回调监控（重试队列）

---

## 总里程碑

- D2 EOD：CLI demo 可跑
- D3 EOD：可上传看报告
- D4 EOD：可下单
- D5 EOD：正式上线 + 首篇软文