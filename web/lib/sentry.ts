/**
 * Sentry 错误监控（生产环境）
 *
 * 用法：
 *   1. 注册 Sentry.io 账号
 *   2. 创建 Next.js 项目
 *   3. 把 DSN 填到 .env.local: SENTRY_DSN="https://...@....ingest.sentry.io/..."
 *   4. 在 next.config.js 引入此文件
 *   5. 在 instrumentation.ts 中调用 initSentry()
 *
 * 关闭监控：移除 SENTRY_DSN env 即可
 */

import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[sentry] SENTRY_DSN not set, error monitoring disabled");
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // 不要在 Sentry 上记录敏感信息
    beforeSend(event) {
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      return event;
    },
    // 忽略低价值错误
    ignoreErrors: [
      "ECONNRESET",
      "ETIMEDOUT",
      /^NetworkError/,
      /^AbortError/,
    ],
  });

  console.log(`[sentry] monitoring enabled (env=${process.env.NODE_ENV})`);
}