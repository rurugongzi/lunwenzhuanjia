import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  listUsers,
  listSubscriptions,
  getStats,
  type PlanId,
} from "@/lib/storage";

const PLAN_NAMES: Record<PlanId, string> = {
  trial: "体验",
  student: "学生",
  scholar: "学者",
  institution: "机构",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") {
    return (
      <div className="card text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">403 Forbidden</h1>
        <p className="text-sm text-gray-500 mt-2">需要管理员权限</p>
      </div>
    );
  }

  const stats = await getStats();
  const users = await listUsers();
  const subs = await listSubscriptions();

  // 找出每个用户的最新订阅
  const subByUser = new Map<string, typeof subs[number]>();
  for (const s of subs.sort((a, b) => b.started_at.localeCompare(a.started_at))) {
    if (!subByUser.has(s.user_id)) subByUser.set(s.user_id, s);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">用户与订阅概览</p>
      </header>

      {/* 统计 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="用户总数" value={stats.user_count} />
        <Stat label="活跃订阅" value={stats.active_subscription_count} />
        <Stat label="总用量" value={stats.usage_count} />
        <Stat label="套餐分布" value={Object.entries(stats.by_plan).map(([k, v]) => `${PLAN_NAMES[k as PlanId]}:${v}`).join(" · ") || "—"} small />
      </section>

      {/* 用户列表 */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-3">用户列表（{users.length}）</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2">邮箱</th>
                <th className="text-left py-2 px-2">昵称</th>
                <th className="text-left py-2 px-2">角色</th>
                <th className="text-left py-2 px-2">注册时间</th>
                <th className="text-left py-2 px-2">订阅</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const s = subByUser.get(u.id);
                return (
                  <tr key={u.id}>
                    <td className="py-2 px-2 font-mono">{u.email}</td>
                    <td className="py-2 px-2">{u.name}</td>
                    <td className="py-2 px-2">
                      {u.role === "admin" ? (
                        <span className="text-orange-600 font-medium">admin</span>
                      ) : (
                        <span className="text-gray-500">user</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-500">
                      {new Date(u.created_at).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="py-2 px-2">
                      {s ? (
                        <span className="text-xs">
                          {PLAN_NAMES[s.plan]}
                          <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                            s.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {s.status}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">无</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 订阅列表 */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-3">订阅流水（{subs.length}）</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2">套餐</th>
                <th className="text-left py-2 px-2">用户 ID</th>
                <th className="text-left py-2 px-2">状态</th>
                <th className="text-left py-2 px-2">开始</th>
                <th className="text-left py-2 px-2">到期</th>
                <th className="text-right py-2 px-2">用量</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subs
                .sort((a, b) => b.started_at.localeCompare(a.started_at))
                .slice(0, 50)
                .map((s) => (
                  <tr key={s.id}>
                    <td className="py-2 px-2">{PLAN_NAMES[s.plan]}</td>
                    <td className="py-2 px-2 font-mono text-xs">{s.user_id.slice(0, 8)}…</td>
                    <td className="py-2 px-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        s.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-500">
                      {new Date(s.started_at).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-500">
                      {new Date(s.expires_at).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      {s.quota_used} / {s.quota_total}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, small }: { label: string; value: number | string; small?: boolean }) {
  return (
    <div className="card text-center">
      <div className={`${small ? "text-sm" : "text-3xl"} font-bold text-primary-600`}>
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}