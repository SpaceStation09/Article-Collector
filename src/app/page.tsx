import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { ArticleForm } from "@/components/article-form";
import { ArticleBrowsePanel } from "@/components/article-browse-panel";
import { HomeTabs } from "@/components/home-tabs";
import { SearchFilters } from "@/components/search-filters";
import { SignOutButton } from "@/components/sign-out-button";
import type { ArticleListItem } from "@/lib/article-types";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type TabKey = "add" | "browse";

type HomePageProps = {
  searchParams: Promise<{
    tab?: string;
    page?: string;
    q?: string;
    tag?: string;
    language?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const [currentUser, existingUser] = await Promise.all([
    getCurrentUser(),
    prisma.user.findFirst({ select: { id: true } }),
  ]);

  if (!existingUser) {
    redirect("/setup");
  }

  if (!currentUser) {
    redirect("/login");
  }

  const { tab = "browse", page = "1", q = "", tag = "", language = "" } = await searchParams;
  const currentTab: TabKey = tab === "add" ? "add" : "browse";
  const selectedLanguage = language === "ZH" || language === "EN" ? language : "";
  const pageSize = 20;
  const parsedPage = Number.parseInt(page, 10);
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const browseStateKey = [currentPage, q, tag, selectedLanguage].join("::");
  let tags: { id: string; name: string }[] = [];
  let serializedArticles: ArticleListItem[] = [];
  let totalArticles = 0;
  let totalPages = 1;

  if (currentTab === "browse") {
    const where: Prisma.ArticleWhereInput = {
      title: {
        contains: q,
        mode: "insensitive",
      },
      ...(selectedLanguage
        ? {
            language: selectedLanguage,
          }
        : {}),
      ...(tag
        ? {
            tags: {
              some: {
                tag: {
                  name: tag,
                },
              },
            },
          }
        : {}),
    };

    const [tagRecords, articles, articleCount] = await Promise.all([
      prisma.tag.findMany({ orderBy: { name: "asc" } }),
      prisma.article.findMany({
        where,
        include: {
          tags: {
            include: {
              tag: true,
            },
            orderBy: {
              tag: {
                name: "asc",
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),
      prisma.article.count({ where }),
    ]);

    tags = tagRecords.map((record) => ({
      id: record.id,
      name: record.name,
    }));
    totalArticles = articleCount;
    totalPages = Math.max(1, Math.ceil(articleCount / pageSize));

    serializedArticles = articles.map((article) => ({
      id: article.id,
      url: article.url,
      title: article.title,
      language: article.language,
      titleSource: article.titleSource,
      createdAt: article.createdAt.toISOString(),
      tags: article.tags.map(({ tag: currentTag }) => ({
        id: currentTag.id,
        name: currentTag.name,
      })),
    }));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
      <header className="rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">Article Collector</p>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">Your private reading shelf.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                Save links, label them with tags, and pull them back later by title keyword or topic.
              </p>
            </div>
            <HomeTabs currentTab={currentTab} q={q} tag={tag} language={selectedLanguage} />
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <p className="text-sm text-[var(--muted)]">Signed in with passkey</p>
            <SignOutButton />
          </div>
        </div>
      </header>

      {currentTab === "add" ? (
        <section className="w-full">
          <ArticleForm />
        </section>
      ) : (
        <section className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div className="space-y-6">
            <SearchFilters q={q} tag={tag} language={selectedLanguage} tags={tags} />
          </div>

          <ArticleBrowsePanel
            key={browseStateKey}
            articles={serializedArticles}
            totalArticles={totalArticles}
            currentPage={currentPage}
            totalPages={totalPages}
            q={q}
            tag={tag}
            language={selectedLanguage}
          />
        </section>
      )}
    </main>
  );
}
