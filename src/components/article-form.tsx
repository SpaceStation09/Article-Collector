"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { parseTagInput } from "@/lib/tags";

function languageButtonClass(isActive: boolean) {
  return isActive
    ? "rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
    : "rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]";
}

export function ArticleForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<"ZH" | "EN">("ZH");
  const [titleSource, setTitleSource] = useState<"AUTO" | "MANUAL">("MANUAL");
  const [tags, setTags] = useState("");
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFetchTitle() {
    if (!url.trim()) {
      setMessage("Please enter a valid URL first.");
      return;
    }

    setIsFetchingTitle(true);
    setMessage(null);

    try {
      const response = await fetch("/api/fetch-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to fetch title.");
      }

      if (data.title) {
        setTitle(data.title);
        setTitleSource("AUTO");
        setMessage("Title fetched successfully.");
        return;
      }

      setTitleSource("MANUAL");
      setMessage("Could not fetch title. Please enter it manually.");
    } catch (error) {
      setTitleSource("MANUAL");
      setMessage(error instanceof Error ? error.message : "Unable to fetch title.");
    } finally {
      setIsFetchingTitle(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          title,
          language,
          titleSource,
          tags: parseTagInput(tags),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save article.");
      }

      setUrl("");
      setTitle("");
      setLanguage("ZH");
      setTitleSource("MANUAL");
      setTags("");
      setMessage(data.created ? "Article saved." : "Existing article updated.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save article.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Add article</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Save a link before it disappears into your tabs.</h2>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium">
          URL
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/article"
            className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 flex flex-col gap-2 text-sm font-medium">
            Title
            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setTitleSource("MANUAL");
              }}
              placeholder="Fetched title or your own note"
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          <button
            type="button"
            onClick={handleFetchTitle}
            disabled={isFetchingTitle}
            className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--accent)] transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetchingTitle ? "Fetching..." : "Fetch title"}
          </button>
        </div>

        <div className="flex flex-col gap-2 text-sm font-medium">
          <span>Language</span>
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
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Tags
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="ai, product, reading-list"
            className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-h-6 text-sm text-[var(--muted)]">{message}</p>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save article"}
          </button>
        </div>
      </div>
    </form>
  );
}
