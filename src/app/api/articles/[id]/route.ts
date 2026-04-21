import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { deleteUnusedTags } from "@/lib/tag-maintenance";
import { normalizeTagName } from "@/lib/tags";
import { articleInputSchema } from "@/lib/validators";

async function connectTags(tagNames: string[]) {
  if (tagNames.length === 0) {
    return [];
  }

  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  return tags.map((tag) => ({ tagId: tag.id }));
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = articleInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid article payload" }, { status: 400 });
  }

  const { id } = await context.params;
  const tagNames = [...new Set(parsed.data.tags.map(normalizeTagName).filter(Boolean))];
  const tagConnections = await connectTags(tagNames);

  try {
    const article = await prisma.article.update({
      where: { id },
      data: {
        url: parsed.data.url,
        title: parsed.data.title,
        language: parsed.data.language,
        titleSource: parsed.data.titleSource,
        tags: {
          deleteMany: {},
          create: tagConnections,
        },
      },
      include: {
        tags: { include: { tag: true }, orderBy: { tag: { name: "asc" } } },
      },
    });

    await deleteUnusedTags();

    return NextResponse.json({ article });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "This URL is already saved on another article." }, { status: 409 });
    }

    throw error;
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  await prisma.article.delete({ where: { id } });
  await deleteUnusedTags();

  return new NextResponse(null, { status: 204 });
}
