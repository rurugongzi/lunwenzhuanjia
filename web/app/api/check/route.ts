import { NextRequest, NextResponse } from "next/server";
import { parse, validate, summarize } from "@/lib/engine";
import { getSpecForJournal } from "@/lib/journals-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, journal } = body as { text: string; journal: string };

    if (!text || !journal) {
      return NextResponse.json(
        { error: "需要 text 和 journal 参数" },
        { status: 400 },
      );
    }

    if (text.length > 500_000) {
      return NextResponse.json(
        { error: "文本过长（>500KB），请分批上传" },
        { status: 413 },
      );
    }

    const citations = parse(text);
    const spec = getSpecForJournal(journal);
    const results = validate(citations, spec);
    const summary = summarize(results);

    return NextResponse.json({
      target_journal: journal,
      spec_found: !!spec,
      summary,
      results,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `解析失败: ${(err as Error).message}` },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    usage: "POST { text: string, journal: string }",
    note: "POST 接口调用 CiteTong 引擎校验论文引文格式",
  });
}