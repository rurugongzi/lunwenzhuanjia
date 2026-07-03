import Link from "next/link";
import { SubscribeButton } from "@/components/SubscribeButton";

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">定价方案</h1>
        <p className="text-sm text-gray-500 mt-1">
          ¥1 体验 7 天 · 年付 8 折 · 推荐返 ¥20
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Plan
          name="体验"
          price="¥1"
          period="/7 天"
          features={[
            "5 篇校验",
            "271 种期刊",
            "32 种已规范",
            "基础报告",
          ]}
          cta="立即体验"
          planId="trial"
          href="/check"
          accent="bg-gray-50"
        />
        <Plan
          name="学生"
          price="¥39"
          period="/月"
          features={[
            "30 篇校验",
            "导出 Word 报告",
            "改稿建议（diff）",
            "期刊推荐",
            "邮箱支持",
          ]}
          cta="学生订阅"
          planId="student"
          href="/check"
          accent="bg-blue-50 border-blue-200"
          highlight
        />
        <Plan
          name="学者"
          price="¥99"
          period="/月"
          features={[
            "100 篇校验",
            "全部学生功能",
            "优先解析（LLM 兜底）",
            "微信公众号提醒",
            "工单支持（24h）",
          ]}
          cta="学者订阅"
          planId="scholar"
          href="/check"
          accent="bg-primary-50 border-primary-300"
          highlight
        />
        <Plan
          name="机构"
          price="¥399"
          period="/月"
          features={[
            "500 篇校验",
            "5 个席位",
            "团队协作",
            "API 接入",
            "定制格式采集",
            "专属客服",
          ]}
          cta="联系销售"
          planId="institution"
          href="/check"
          accent="bg-purple-50 border-purple-200"
        />
      </div>

      {/* 对比 */}
      <section className="card">
        <h2 className="text-xl font-bold mb-4">功能对比</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2">功能</th>
              <th className="text-center py-2">体验</th>
              <th className="text-center py-2">学生</th>
              <th className="text-center py-2">学者</th>
              <th className="text-center py-2">机构</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <Row feature="论文月配额" cells={["5", "30", "100", "500"]} />
            <Row feature="期刊库访问" cells={["✓", "✓", "✓", "✓"]} />
            <Row feature="导出 Word 报告" cells={["—", "✓", "✓", "✓"]} />
            <Row feature="改稿建议" cells={["—", "✓", "✓", "✓"]} />
            <Row feature="LLM 兜底解析" cells={["—", "—", "✓", "✓"]} />
            <Row feature="团队席位" cells={["—", "—", "—", "5"]} />
            <Row feature="API 接入" cells={["—", "—", "—", "✓"]} />
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Plan({
  name,
  price,
  period,
  features,
  cta,
  planId,
  href,
  accent,
  highlight,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  planId: "trial" | "student" | "scholar" | "institution";
  href: string;
  accent?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`card relative ${accent || ""}`}>
      {highlight && (
        <div className="absolute top-0 right-0 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-bl">
          推荐
        </div>
      )}
      <div className="text-center">
        <div className="text-sm text-gray-500">{name}</div>
        <div className="text-4xl font-bold mt-1">
          {price}
          <span className="text-sm text-gray-500 font-normal">{period}</span>
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="text-primary-600 mt-0.5">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <SubscribeButton
          planId={planId}
          name={name}
          price={price}
          period={period}
          cta={cta}
          highlight={highlight}
        />
        <div className="text-center mt-2">
          <Link href={href} className="text-xs text-gray-500 hover:text-primary-600">
            先免费体验 →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ feature, cells }: { feature: string; cells: string[] }) {
  return (
    <tr>
      <td className="py-2 text-gray-700">{feature}</td>
      {cells.map((c, i) => (
        <td
          key={i}
          className={`text-center py-2 ${
            c === "✓" ? "text-green-600" : c === "—" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {c}
        </td>
      ))}
    </tr>
  );
}