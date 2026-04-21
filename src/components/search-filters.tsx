"use client";

import Link from "next/link";
import { useState } from "react";

function languageButtonClass(isActive: boolean) {
  return isActive
    ? "rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
    : "rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]";
}

export function SearchFilters({
  q,
  tag,
  language,
  tags,
}: {
  q: string;
  tag: string;
  language: "ZH" | "EN" | "";
  tags: { id: string; name: string }[];
}) {
  const [selectedLanguage, setSelectedLanguage] = useState<"ZH" | "EN" | "">(language);

  function toggleLanguage(nextLanguage: "ZH" | "EN") {
    setSelectedLanguage((currentLanguage) => (currentLanguage === nextLanguage ? "" : nextLanguage));
  }

  return (
    <form className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Find articles</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Filter your library fast.</h2>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Search title
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by keyword"
            className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Tag
          <select
            name="tag"
            defaultValue={tag}
            className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          >
            <option value="">All tags</option>
            {tags.map((item) => (
              <option key={item.id} value={item.name}>
                #{item.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-2 text-sm font-medium">
          <span>Language</span>
          <input type="hidden" name="language" value={selectedLanguage} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => toggleLanguage("ZH")}
              className={languageButtonClass(selectedLanguage === "ZH")}
            >
              zh
            </button>
            <button
              type="button"
              onClick={() => toggleLanguage("EN")}
              className={languageButtonClass(selectedLanguage === "EN")}
            >
              en
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            Apply filters
          </button>
          <Link
            href="/"
            className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Clear
          </Link>
        </div>
      </div>
    </form>
  );
}
