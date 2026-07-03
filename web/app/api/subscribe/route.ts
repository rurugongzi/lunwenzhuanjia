import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSubscription, getActiveSubscription, type PlanId } from "@/lib/storage";

const VALID_PLANS: PlanId[] = ["trial", "student", "scholar", "institution"];

/**
 * 订阅接口（开发模式：模拟支付即激活）
 *
 * 生产环境替换为：
 *  微信支付 v3 (商户号 + API 证书):
 *    POST /api/wechat-pay/native  → 返回二维码
 *    POST /api/wechat-pay/notify  → 接收支付回调，激活订阅
 *  Stripe Checkout:
 *    POST /api/stripe/checkout    → 创建 checkout session
 *    POST /api/stripe/webhook     → 接收 Stripe 回调
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { plan } = (await req.json()) as { plan: PlanId };
    if (!VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: "无效套餐" }, { status: 400 });
    }

    const current = await getActiveSubscription(session.user.id);
    if (current && current.plan === plan) {
      return NextResponse.json({ error: "已是该套餐" }, { status: 409 });
    }

    const sub = await createSubscription(session.user.id, plan);
    return NextResponse.json({
      ok: true,
      message: `已激活《${plan}》套餐（开发模式：模拟支付）`,
      subscription: {
        id: sub.id,
        plan: sub.plan,
        status: sub.status,
        expires_at: sub.expires_at,
        quota_total: sub.quota_total,
        quota_used: sub.quota_used,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `订阅失败: ${(err as Error).message}` },
      { status: 500 },
    );
  }
}