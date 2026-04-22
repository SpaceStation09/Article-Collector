"use client";

import { useState } from "react";
import { ArticleList } from "@/components/article-list";
import { PaginationControls } from "@/components/pagination-controls";
import type { ArticleListItem } from "@/lib/article-types";

export function ArticleBrowsePanel({
  articles,
  totalArticles,
  currentPage,
  totalPages,
  q,
  tag,
  language,
}: {
  articles: ArticleListItem[];
  totalArticles: number;
  currentPage: number;
  totalPages: number;
  q: string;
  tag: string;
  language: string;
}) {
  const [currentArticles, setCurrentArticles] = useState(articles);
  const [currentTotal, setCurrentTotal] = useState(totalArticles);

  function handleArticleUpdated(updatedArticle: ArticleListItem) {
    setCurrentArticles((existingArticles) =>
      existingArticles.map((article) => (article.id === updatedArticle.id ? updatedArticle : article)),
    );
  }

  function handleArticleDeleted(articleId: string) {
    setCurrentArticles((existingArticles) => existingArticles.filter((article) => article.id !== articleId));
    setCurrentTotal((count) => Math.max(0, count - 1));
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Saved articles</h2>
        <p className="text-sm text-[var(--muted)]">{currentTotal} results</p>
      </div>
      <ArticleList articles={currentArticles} onArticleUpdated={handleArticleUpdated} onArticleDeleted={handleArticleDeleted} />
      <PaginationControls currentPage={currentPage} totalPages={totalPages} q={q} tag={tag} language={language} />
    </section>
  );
}
