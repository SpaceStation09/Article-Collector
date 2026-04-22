"use client";

import { FormEvent, useState } from "react";
import type { ArticleListItem } from "@/lib/article-types";
import { parseTagInput } from "@/lib/tags";

function languageButtonClass(isActive: boolean) {
  return isActive
    ? "rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
    : "rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]";
}

export function ArticleCardActions({
  article,
  onArticleUpdated,
  onArticleDeleted,
}: {
  article: ArticleListItem;
  onArticleUpdated: (article: ArticleListItem) => void;
  onArticleDeleted: (articleId: string) => void;
}) {
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
      onArticleUpdated({
        id: data.article.id,
        url: data.article.url,
        title: data.article.title,
        language: data.article.language,
        titleSource: data.article.titleSource,
        createdAt: new Date(data.article.createdAt).toISOString(),
        tags: data.article.tags.map(({ tag }: { tag: { id: string; name: string } }) => ({
          id: tag.id,
          name: tag.name,
        })),
      });
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

      onArticleDeleted(article.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete article.");
    } finally {
      setIsPending(false);
    }
  }

  if (isEditing) {
    return (
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
    );
  }

  return (
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
  );
}
