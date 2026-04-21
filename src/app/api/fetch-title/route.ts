import { NextResponse } from "next/server";
import { fetchArticleTitle } from "@/lib/fetch-title";
import { requireUser } from "@/lib/session";
import { fetchTitleSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = fetchTitleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const title = await fetchArticleTitle(parsed.data.url);

    if (!title) {
      return NextResponse.json({ title: null, requiresManualInput: true });
    }

    return NextResponse.json({ title, requiresManualInput: false });
  } catch {
    return NextResponse.json({ title: null, requiresManualInput: true });
  }
}
