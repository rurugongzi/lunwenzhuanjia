import { NextResponse } from "next/server";
import { JOURNALS, FORMATS, groupBySubject } from "@/lib/journals-data";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const subject = url.searchParams.get("subject");
  const hasSpec = url.searchParams.get("has_spec");
  const search = url.searchParams.get("search")?.toLowerCase();

  let items = [...JOURNALS];

  if (subject) items = items.filter((j) => j.subject === subject);
  if (hasSpec === "true") items = items.filter((j) => j.has_format_spec);
  if (search) {
    items = items.filter(
      (j) =>
        j.name.toLowerCase().includes(search) ||
        (j.alias || "").toLowerCase().includes(search),
    );
  }

  return NextResponse.json({
    total: items.length,
    total_journals: JOURNALS.length,
    total_formats: FORMATS.length,
    by_subject: groupBySubject().map((g) => ({
      subject: g.subject,
      count: g.count,
    })),
    items: items.slice(0, 200),
  });
}