import type { ArticleListItem } from "@/lib/article-types";
import { ArticleCardActions } from "@/components/article-card-actions";

function formatLanguage(language: "ZH" | "EN" | undefined) {
  return (language ?? "ZH").toLowerCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function ArticleList({
  articles,
  onArticleUpdated,
  onArticleDeleted,
}: {
  articles: ArticleListItem[];
  onArticleUpdated: (article: ArticleListItem) => void;
  onArticleDeleted: (articleId: string) => void;
}) {
  if (articles.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
        No articles yet. Add your first link above.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {articles.map((article) => (
        <article key={article.id} className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  {article.titleSource === "AUTO" ? "Auto title" : "Manual title"} · {formatLanguage(article.language)}
                </p>
                <h3 className="text-xl font-semibold leading-8 text-[var(--foreground)]">{article.title}</h3>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm text-[var(--accent)] underline-offset-4 hover:underline"
                >
                  {article.url}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <span>{formatDate(article.createdAt)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {article.tags.length > 0 ? (
                article.tags.map((tag) => (
                  <span key={tag.id} className="rounded-full bg-[#ebe3d4] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
                    #{tag.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--muted)]">No tags</span>
              )}
            </div>

            <ArticleCardActions article={article} onArticleUpdated={onArticleUpdated} onArticleDeleted={onArticleDeleted} />
          </div>
        </article>
      ))}
    </div>
  );
}
