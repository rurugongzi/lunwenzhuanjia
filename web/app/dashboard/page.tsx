import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  getActiveSubscription,
  listUsage,
  planConfig,
  type PlanId,
} from "@/lib/storage";

const PLAN_NAMES: Record<PlanId, string> = {
  trial: "体验 ¥1/7 天",
  student: "学生 ¥39/月",
  scholar: "学者 ¥99/月",
  institution: "机构 ¥399/月",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sub = await getActiveSubscription(session.user.id);
  const usage = await listUsage(session.user.id).then((u) => u.slice(-20).reverse());
  const cfg = sub ? planConfig(sub.plan) : null;
  const quotaLeft = sub && cfg ? cfg.quota - sub.quota_used : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          欢迎，{session.user.name} · {session.user.email}
        </p>
      </header>

      {/* 订阅状态 */}
      <section className="card">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold">当前订阅</h2>
            {sub ? (
              <div className="mt-2 space-y-1 text-sm">
                <div>
                  套餐：<strong className="text-primary-700">{PLAN_NAMES[sub.plan]}</strong>
                </div>
                <div>到期：{new Date(sub.expires_at).toLocaleDateString("zh-CN")}</div>
                <div>
                  配额：<strong>{sub.quota_used}</strong> / {sub.quota_total}
                  （剩 {quotaLeft} 篇）
                </div>
                {/* 进度条 */}
                <div className="mt-2 h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-primary-500 rounded"
                    style={{ width: `${Math.min(100, (sub.quota_used / sub.quota_total) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-600">无有效订阅</p>
            )}
          </div>
          <Link href="/pricing" className="btn-primary !text-sm !py-1.5 !px-4">
            {sub ? "升级套餐" : "立即订阅"}
          </Link>
        </div>
      </section>

      {/* 快捷入口 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/check" className="card hover:shadow-md transition-shadow">
          <div className="text-2xl mb-1">📝</div>
          <h3 className="font-semibold">校验论文</h3>
          <p className="text-xs text-gray-500 mt-1">上传 → 选刊 → 拿报告</p>
        </Link>
        <Link href="/journals" className="card hover:shadow-md transition-shadow">
          <div className="text-2xl mb-1">📚</div>
          <h3 className="font-semibold">期刊库</h3>
          <p className="text-xs text-gray-500 mt-1">271 种 CSSCI 期刊</p>
        </Link>
        <Link href="/pricing" className="card hover:shadow-md transition-shadow">
          <div className="text-2xl mb-1">💎</div>
          <h3 className="font-semibold">查看定价</h3>
          <p className="text-xs text-gray-500 mt-1">学生 / 学者 / 机构</p>
        </Link>
      </section>

      {/* 用量历史 */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-3">最近 20 次校验</h2>
        {usage.length === 0 ? (
          <p className="text-sm text-gray-500">暂无使用记录</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">时间</th>
                <th className="text-right py-2">引文数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usage.map((u) => (
                <tr key={u.id}>
                  <td className="py-2 text-gray-600">
                    {new Date(u.at).toLocaleString("zh-CN")}
                  </td>
                  <td className="py-2 text-right font-mono">{u.citations_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}