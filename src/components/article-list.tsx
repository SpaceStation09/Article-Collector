"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { parseTagInput } from "@/lib/tags";

function languageButtonClass(isActive: boolean) {
  return isActive
    ? "rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
    : "rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]";
}

export type ArticleListItem = {
  id: string;
  url: string;
  title: string;
  language?: "ZH" | "EN";
  titleSource: "AUTO" | "MANUAL";
  createdAt: string;
  tags: { id: string; name: string }[];
};

function formatLanguage(language: "ZH" | "EN" | undefined) {
  return (language ?? "ZH").toLowerCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function ArticleCard({ article }: { article: ArticleListItem }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [url, setUrl] = useState(article.url);
  const [title, setTitle] = useState(article.title);
  const [language, setLanguage] = useState<"ZH" | "EN">(article.language ?? "ZH");
  const [tags, setTags] = useState(article.tags.map((tag) => tag.name).join(", "));

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          title,
          language,
          titleSource: "MANUAL",
          tags: parseTagInput(tags),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update article.");
      }

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update article.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete() {
    setIsPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/articles/${article.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete article.");
      }

      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete article.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <article className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
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

        {isEditing ? (
          <form onSubmit={handleUpdate} className="grid gap-3 border-t border-[var(--border)] pt-4">
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            />
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setLanguage("ZH")}
                className={languageButtonClass(language === "ZH")}
              >
                zh
              </button>
              <button
                type="button"
                onClick={() => setLanguage("EN")}
                className={languageButtonClass(language === "EN")}
              >
                en
              </button>
            </div>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)]"
              >
                Cancel
              </button>
            </div>
            <p className="min-h-5 text-sm text-[var(--muted)]">{message}</p>
          </form>
        ) : (
          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-full border border-[#d6a6a6] px-4 py-2 text-sm font-medium text-[#8b3d3d] transition hover:bg-[#fff1f1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Delete
            </button>
            <p className="min-h-5 text-sm text-[var(--muted)]">{message}</p>
          </div>
        )}
      </div>
    </article>
  );
}

export function ArticleList({ articles }: { articles: ArticleListItem[] }) {
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
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
