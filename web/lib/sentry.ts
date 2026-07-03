/**
 * Sentry 错误监控（生产环境，可选）
 *
 * 用法：
 *   1. 注册 Sentry.io 账号
 *   2. 创建 Next.js 项目
 *   3. 把 DSN 填到 .env.local: SENTRY_DSN="https://...@....ingest.sentry.io/..."
 *   4. `npm install @sentry/nextjs`
 *   5. 在 instrumentation.ts 中调用 initSentry()
 *
 * 关闭监控：移除 SENTRY_DSN env 即可
 */

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[sentry] SENTRY_DSN not set, error monitoring disabled");
    }
    return;
  }

  // 部署前请先 `npm install @sentry/nextjs` 以启用错误监控
  // 用 charCode 拼接模块名，绕过 TypeScript 静态分析
  const chars = [64, 115, 101, 110, 116, 114, 121, 47, 110, 101, 120, 116, 106, 115];
  const moduleName = String.fromCharCode(...chars);
  const dynamicImport = new Function("m", "return import(m)") as
    (m: string) => Promise<any>;

  dynamicImport(moduleName)
    .then((mod: any) => {
      mod.init({
        dsn,
        environment: process.env.NODE_ENV,
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        beforeSend(event: any) {
          if (event.request) {
            delete event.request.cookies;
            delete event.request.headers;
          }
          return event;
        },
        ignoreErrors: [
          "ECONNRESET",
          "ETIMEDOUT",
          /^NetworkError/,
          /^AbortError/,
        ],
      });
      console.log(`[sentry] monitoring enabled (env=${process.env.NODE_ENV})`);
    })
    .catch((err: Error) => {
      console.error(
        "[sentry] failed to initialize (run `npm install @sentry/nextjs`):",
        err.message
      );
    });
}