# 引用通 / CiteTong — 技术栈选型

> 2026-06-16 v1 · MVP 范围 · 5 天冲刺前提：单人 + DeepSeek 主模型 + 多平台免费额度

## 推荐栈（一句话）

**Next.js 14 (App Router) + TypeScript + Postgres (Neon/Supabase) + Drizzle ORM + Tailwind + shadcn/ui + Vercel + DeepSeek API（推理）+ 微信支付 v3（结算）**

## 各层决策表

| 层 | 推荐 | 理由 | 替代 |
|----|------|------|------|
| **前端框架** | Next.js 14 App Router | 全栈一体、SSR/SEO 友好、用户上传/SSR 渲染/Vercel 部署一条龙 | SvelteKit / Remix |
| **类型系统** | TypeScript (strict) | 数据 schema 复杂（271 期刊 × 41 规范），TS 编译期抓错 | — |
| **样式** | Tailwind CSS + shadcn/ui | 学习曲线短、可复制性强、shadcn 组件按需复制（无版本锁定） | Chakra UI / MUI |
| **数据库** | Postgres (Neon serverless) | 关系型适合 271 × N 结构化数据；Neon 免费层 0.5GB 够 MVP；serverless 不用运维 | Supabase / PlanetScale |
| **ORM** | Drizzle ORM | TypeScript-first、SQL 透明、edge runtime 兼容 | Prisma（更重） |
| **认证** | Auth.js (NextAuth) v5 | 内置 GitHub/Google/微信 OAuth；credential provider 支持邮箱密码 | Clerk（贵）/ 自建 |
| **支付（国内）** | 微信支付 v3 + 收款码 | 学者用户首选微信；H5/小程序支付都可 | 支付宝（次选） |
| **支付（海外）** | Stripe Checkout | 国际信用卡；后续 M2 留学生用得上 | Creem（新兴中国团队出海） |
| **文件存储** | Vercel Blob / S3 | 上传 Word/PDF → 解析后存 JSON 报告 | Cloudflare R2 |
| **AI 推理** | DeepSeek API（主） | 价格低、中文强、用户已付费 | OpenAI GPT-4o / Claude / SiliconFlow / GLM / Agnes（免费额度） |
| **Word 解析** | mammoth.js + pdf-parse | Word→HTML / PDF→text 纯 JS，部署无依赖 | python-docx（需 serverless Python） |
| **引文解析** | 自写 regex + heuristics | 注释体例 23 种，每种一套 regex；穷举法比 LLM 更准且便宜 | LLM 抽取（贵/慢） |
| **部署** | Vercel | Next.js 原生支持、CI/CD 一键、CDN 全球 | Cloudflare Pages / 自建 VPS |
| **域名/DNS** | Cloudflare | 免费代理 + 简单配置；lunwenzhuanjia.cn 待注册 | 阿里云（国内快但贵） |
| **监控** | Vercel Analytics + Sentry | 性能/错误日志免费层够用 | Plausible / Umami |

## 关键依赖（package.json 草案）

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "typescript": "^5.5.0",
    "drizzle-orm": "^0.33.0",
    "postgres": "^3.4.0",
    "next-auth": "^5.0.0-beta",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest",
    "mammoth": "^1.8.0",
    "pdf-parse": "^1.1.1",
    "zod": "^3.23.0",
    "ioredis": "^5.4.0"
  }
}
```

## 5 天工程预算（人天）

| 天 | 前端 | 后端 | 数据 | 部署 |
|----|------|------|------|------|
| D1 | — | — | ✅ 271 期刊 + schema | — |
| D2 | — | CLI 解析器 + 校验器 | 23→30 规范扩 | — |
| D3 | Next.js 上传/报告 UI | API routes | — | Vercel init |
| D4 | 订阅 UI + 微信支付回调 | Auth.js + 订单系统 | — | — |
| D5 | 公众号引流页 + SEO | 软文 CMS | — | 正式上线 |

## 不选 / 暂缓

| 技术 | 不选原因 |
|------|---------|
| ❌ React Native/Flutter | 无移动端 MVP 必要 |
| ❌ GraphQL | REST 足够，省学习曲线 |
| ❌ 微服务架构 | 单体 Next.js + serverless functions 撑得住 |
| ❌ 自建 AI 模型 | DeepSeek/OpenAI API 足够便宜，自建 5 天跑不通 |
| ❌ WebSocket | 校验报告无需实时，可 HTTP 异步 |
| ❌ Redis Cluster | 单实例 KV（订阅计数/限流）MVP 阶段够用 |

## 风险与备选

| 风险 | 备选方案 |
|------|---------|
| DeepSeek 限流/宕机 | 配置 SiliconFlow + GLM 双 fallback（已有免费额度） |
| 微信支付主体限制（个人开发者） | 用"第三方代收"（如 Creem/Yepay）或挂靠机构 |
| Vercel 国内访问慢 | 国内加一层阿里云/腾讯云 CDN 静态加速 |
| 引文解析准确率不足 | 引入 LLM 二次校验（DeepSeek） + 人工 review 界面 |

## 决策原则（5 天冲刺）

1. **优先选熟悉技术** — 不学新框架
2. **优先选 serverless** — 不运维
3. **优先选有免费层** — 不烧钱
4. **优先选中文社区活跃** — 学者用户是中文群体
5. **拒绝过度设计** — 单体优先，复杂留到 M2

## 实施入口

```bash
# D3 开始时初始化
cd ~/hermes-projects/lunwenzhuanjia/web
pnpm create next-app@latest . --typescript --tailwind --app --src-dir
# → 选 No（不用 ESLint/默认 import alias）
pnpm add drizzle-orm postgres next-auth @auth/drizzle-adapter zod mammoth pdf-parse
```