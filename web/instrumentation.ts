/**
 * Next.js Instrumentation（启动钩子）
 * 文档：https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initSentry } = await import("./lib/sentry");
    initSentry();
  }
}