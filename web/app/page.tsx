import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center pt-8 pb-12">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-4">
          学术论文投稿前最后一公里
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          CSSCI 期刊引文格式自动校验 · 271 种期刊覆盖
        </p>
        <p className="text-sm text-gray-400 mb-8">
          1 分钟拿到改稿建议 · 避免因注释体例被退稿
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/check" className="btn-primary text-base">
            🚀 立即校验
          </Link>
          <Link href="/pricing" className="btn-secondary text-base">
            查看定价
          </Link>
        </div>
      </section>

      {/* 数据 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600">271</div>
          <div className="text-sm text-gray-600 mt-1">CSSCI 期刊覆盖</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600">8</div>
          <div className="text-sm text-gray-600 mt-1">人文学科</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600">32</div>
          <div className="text-sm text-gray-600 mt-1">已规范体例</div>
        </div>
      </section>

      {/* 用户痛点 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">为什么需要 CiteTong？</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-semibold text-lg mb-1">投稿被退稿 7 大原因之一</h3>
            <p className="text-sm text-gray-600">
              注释体例不符是博士生投稿最高频的退稿原因之一。每本期刊的页下注格式、文献类型标识、出版城市要求都不同。
            </p>
          </div>
          <div className="card">
            <div className="text-2xl mb-2">⏰</div>
            <h3 className="font-semibold text-lg mb-1">人工核对费时</h3>
            <p className="text-sm text-gray-600">
              一篇 2 万字论文常有 80+ 条引文。逐条对照目标期刊的《投稿须知》平均要花 3-5 小时。
            </p>
          </div>
          <div className="card">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-lg mb-1">同时投 2-3 本期刊</h3>
            <p className="text-sm text-gray-600">
              青年学者常同时投多本期刊。每本的体例要求都不同——CiteTong 一次校验多本。
            </p>
          </div>
          <div className="card">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-semibold text-lg mb-1">LLM 不会查体例</h3>
            <p className="text-sm text-gray-600">
              ChatGPT/Claude 能改稿不会查注释体例。CiteTong 把 41 种期刊的精确规则做成数据库。
            </p>
          </div>
        </div>
      </section>

      {/* 怎么用 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">3 步完成校验</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="text-4xl font-bold text-primary-500 mb-2">1</div>
            <h3 className="font-semibold mb-1">上传手稿</h3>
            <p className="text-sm text-gray-600">支持 Word / PDF / 纯文本，秒级解析</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-primary-500 mb-2">2</div>
            <h3 className="font-semibold mb-1">选目标期刊</h3>
            <p className="text-sm text-gray-600">271 种 CSSCI 期刊任选，或上传摘要让 AI 推荐</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-primary-500 mb-2">3</div>
            <h3 className="font-semibold mb-1">拿到改稿建议</h3>
            <p className="text-sm text-gray-600">逐条显示 ✓/✗ + 错因 + 修复建议，导出 Word 报告</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center card bg-primary-50 border-primary-200">
        <h2 className="text-2xl font-bold text-primary-900 mb-2">立即开始</h2>
        <p className="text-primary-700 mb-4">¥1 体验 7 天 / 5 篇 · 学生 ¥39/月 · 学者 ¥99/月</p>
        <Link href="/check" className="btn-primary">
          🚀 开始校验
        </Link>
      </section>
    </div>
  );
}
