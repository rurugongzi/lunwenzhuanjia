# 引用通 / CiteTong

> **CSSCI 期刊引文格式自动校验 · 271 种期刊覆盖 · 1 分钟拿到改稿建议**
> 投稿前最后一公里。学者 SaaS。

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

---

## 项目结构

```
lunwenzhuanjia/
├── README.md                 本文件
├── PRD.md                    产品需求（1 页）
├── STACK.md                  技术栈决策
├── ROADMAP.md                5 天路线图（D1-D5 任务卡）
├── D2_DEMO.md                D2 引擎验证报告
├── D2_REPORT.json            D2 引擎 JSON 报告
├── data/
│   ├── schema/               JSON Schema 定义（期刊 / 格式规范）
│   ├── seed/                 271 期刊 + 32 规范 种子数据
│   ├── scripts/              解析脚本
│   └── formats_db.py         规范数据库（Python 源）
├── engine/                   D2 核心引擎（Python CLI）
│   ├── parser.py             引文解析器
│   ├── validator.py          格式校验器
│   ├── cli.py                CLI 入口
│   └── __main__.py
├── tests/
│   └── test_parser.py        单元测试（10 项全过）
├── docs/
│   ├── wechat-article-1.md   公众号软文 1（痛点+引流）
│   └── wechat-article-2.md   公众号软文 2（产品介绍）
├── web/                      D3-D4 Next.js 应用
│   ├── app/                  页面 + API
│   ├── components/           组件
│   ├── lib/                  工具（engine TS 版 + auth + storage + sentry）
│   ├── data/                 期刊 + 规范（运行时加载）
│   ├── vercel.json           Vercel 部署配置
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── package.json
├── .github/workflows/
│   └── deploy.yml            GitHub Actions CI/CD
└── D5_*.md                   D5 部署文档
```

---

## 快速启动（本地开发）

### 前置要求
- Node.js ≥ 20.19
- Python ≥ 3.10（仅 CLI 引擎需要，Web 用 TS 版）
- npm 或 pnpm

### 启动 Web 应用

```bash
cd web
npm install
cp .env.example .env.local      # 默认 dev 配置即可
npm run dev                      # → http://localhost:3000
```

### 启动 Python CLI（可选）

```bash
# 仅在 docs/research/*.md 跑离线校验时使用
cd ../  # 项目根
python3 engine/cli.py \
  --input path/to/paper.txt \
  --journal "历史研究" \
  --markdown
```

---

## 部署到 Vercel（生产）

### 一次性配置

1. **注册域名**（如 `lunwenzhuanjia.cn`）
   - 推荐：阿里云 / 腾讯云 / Cloudflare Registrar
   - DNS 用 Cloudflare 代理（免费 SSL + 加速）

2. **创建 Vercel 账号**
   - https://vercel.com（GitHub 登录）
   - 新建 Project → Import 你的 GitHub repo

3. **配置 GitHub Secrets**（项目 → Settings → Secrets）
   ```
   VERCEL_TOKEN
   VERCEL_ORG_ID
   VERCEL_PROJECT_ID
   AUTH_SECRET              # openssl rand -base64 32
   AUTH_URL                 # https://lunwenzhuanjia.cn
   NEXT_PUBLIC_SITE_URL     # https://lunwenzhuanjia.cn
   NEXT_PUBLIC_SITE_NAME    # 引用通 / CiteTong
   ```

4. **首次部署**
   - GitHub push main 分支 → 自动触发 `.github/workflows/deploy.yml`
   - Vercel 自动 build + 部署 + 绑定域名

5. **DNS 配置**（Cloudflare）
   - A 记录 `@` → `76.76.21.21`（Vercel IP）
   - CNAME `www` → `cname.vercel-dns.com`

### 验证清单

- [ ] `https://lunwenzhuanjia.cn` 打开正常
- [ ] `/sitemap.xml` 返回 200
- [ ] `/robots.txt` 返回 200
- [ ] 注册 → 登录 → 升级 → dashboard 跑通
- [ ] `/admin` role=user 时显示 403
- [ ] 微信支付回调（如已接入）

---

## 支付集成（生产）

### 微信支付 v3

1. 申请商户号：https://pay.weixin.qq.com/
2. 配置 API v3 密钥 + 证书
3. 填入 `.env.local`：
   ```
   WECHAT_PAY_MCH_ID="your-merchant-id"
   WECHAT_PAY_API_V3_KEY="your-32-char-api-v3-key"
   WECHAT_PAY_APP_ID="wx..."
   WECHAT_PAY_CERT_PATH="/path/to/apiclient_cert.pem"
   WECHAT_PAY_KEY_PATH="/path/to/apiclient_key.pem"
   ```
4. 实现 `app/api/wechat-pay/native/route.ts`（创建订单 + 返回二维码）
5. 实现 `app/api/wechat-pay/notify/route.ts`（接收回调 + 激活订阅）

参考代码：`/api/subscribe/route.ts` 当前是开发模式模拟支付

### Stripe（海外 / 出海）

1. https://dashboard.stripe.com/apikeys
2. 填入 `.env.local`：
   ```
   STRIPE_SECRET_KEY="sk_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```
3. 实现 `/api/stripe/checkout/route.ts`
4. 实现 `/api/stripe/webhook/route.ts`

---

## 数据库迁移（生产）

当前用 JSON 文件存储（dev only）。生产环境建议迁移到 Postgres：

1. 注册 Neon：https://neon.tech（免费层 0.5GB）
2. 创建数据库 → 获取 `DATABASE_URL`
3. 实现 `lib/db.ts`（用 Drizzle ORM）：
   ```typescript
   // 已有 storage.ts 接口稳定，迁移只需替换实现
   import { drizzle } from 'drizzle-orm/postgres-js';
   ```
4. 数据迁移脚本：`scripts/migrate-from-json.ts`

---

## 监控（生产）

### Vercel Analytics（内置）
- 项目 → Analytics 标签 → Enable
- 免费层足够 MVP

### Sentry（错误监控）

1. 注册：https://sentry.io
2. 创建 Next.js 项目 → 获取 DSN
3. 填入 `.env.local`：
   ```
   SENTRY_DSN="https://...@....ingest.sentry.io/..."
   ```
4. 安装：`cd web && npm install @sentry/nextjs`
5. 包装 `next.config.js`（参考 `lib/sentry.ts` 注释）
6. `instrumentation.ts` 已写好，会自动启用

---

## 引流策略

### 公众号 + SEO
- 软文 1（痛点）：见 `docs/wechat-article-1.md`
- 软文 2（产品介绍）：见 `docs/wechat-article-2.md`
- 推送时间：早 7:30 / 晚 21:00

### 14 篇论文 → 长尾流量
- 在 14 篇学术论文的脚注里加 1-2 处引流：
  > "本文部分引文格式校验使用了 CiteTong（https://lunwenzhuanjia.cn）"
- 不破坏学术严肃性，又能持续带来学术同侪

### 小红书 / 知乎
- 「博士论文投稿被退稿」话题
- 「CSSCI 投稿经验」话题

---

## 测试

### Python 引擎测试

```bash
cd ../  # 项目根
python3 engine/cli.py --input tests/fixtures/sample-wenyi.txt --journal "文艺争鸣"
python3 -c "
import sys; sys.path.insert(0, '.')
from tests.test_parser import *
test_parse_count(); test_parse_types(); ...
print('✅ all 10 tests passed')
"
```

### Web 应用测试

```bash
cd web
npm install
npm run dev  # 手动验证
# 或：
curl -X POST http://localhost:3000/api/check \
  -H "Content-Type: application/json" \
  -d '{"text":"［1］　袁济喜：《疏野与诗话》","journal":"文艺争鸣"}'
```

---

## 5 天冲刺进度

| Day | 主题 | 状态 | 产物 |
|-----|------|:----:|------|
| D1 | 数据地基 | ✅ | 271 期刊 + schema |
| D2 | 核心引擎 | ✅ | parser + validator + CLI |
| D3 | Web UI | ✅ | 4 页面 + 2 API + 组件 |
| D4 | 商业闭环 | ✅ | Auth + Subscribe + Dashboard + Admin |
| D5 | 部署上线 | ✅ | Vercel 配置 + GitHub Actions + Sentry + SEO + 软文 |

---

## 商业模型

| 套餐 | 月费 | 配额 |
|------|------|------|
| 体验 | ¥1 / 7 天 | 5 篇 |
| 学生 | ¥39 / 月 | 30 篇 |
| 学者 | ¥99 / 月 | 100 篇 |
| 机构 | ¥399 / 月 | 500 篇 + 5 席位 |

年付 8 折 / 推荐返 ¥20 / 团购 9 折。

详见 `PRD.md`。

---

## 后续路线（M2+）

- **M2（7 月）**：英文期刊格式（APA / Chicago / MLA）
- **M3（9 月）**：投稿信 / Cover Letter 生成器
- **M4（11 月）**：API 开放（高校图书馆 / 学术编辑 SaaS）
- **M5（明年 1 月）**：英文 ↔ 中文 双向改写

---

## License

MIT © 2026 CiteTong Team

---

## 联系

- 项目主页：https://lunwenzhuanjia.cn（待上线）
- 邮箱：team@lunwenzhuanjia.cn
- GitHub Issues：提交问题和建议