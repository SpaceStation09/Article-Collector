import Link from "next/link";

function pageLinkClass(isActive: boolean) {
  return isActive
    ? "rounded-full border border-[var(--accent-strong)] bg-[var(--accent-strong)] px-4 py-2 text-sm font-semibold text-[#f8f5ee]"
    : "rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]";
}

function buildBrowseHref(page: number, q: string, tag: string, language: string) {
  const params = new URLSearchParams();
  params.set("tab", "browse");
  params.set("page", String(page));

  if (q) {
    params.set("q", q);
  }

  if (tag) {
    params.set("tag", tag);
  }

  if (language) {
    params.set("language", language);
  }

  return `/?${params.toString()}`;
}

export function PaginationControls({
  currentPage,
  totalPages,
  q,
  tag,
  language,
}: {
  currentPage: number;
  totalPages: number;
  q: string;
  tag: string;
  language: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const visiblePages = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link href={buildBrowseHref(currentPage - 1, q, tag, language)} className={pageLinkClass(false)}>
          Prev
        </Link>
      ) : null}

      {visiblePages.map((page) => (
        <Link key={page} href={buildBrowseHref(page, q, tag, language)} className={pageLinkClass(page === currentPage)}>
          {page}
        </Link>
      ))}

      {currentPage < totalPages ? (
        <Link href={buildBrowseHref(currentPage + 1, q, tag, language)} className={pageLinkClass(false)}>
          Next
        </Link>
      ) : null}
    </nav>
  );
}
