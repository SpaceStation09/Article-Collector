import Link from "next/link";

type TabKey = "add" | "browse";

function tabClass(isActive: boolean) {
  return isActive
    ? "rounded-full border border-[var(--accent-strong)] bg-[var(--accent-strong)] px-4 py-2 text-sm font-semibold !text-[#f8f5ee] shadow-sm"
    : "rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:bg-[#f7f1e6] hover:text-[var(--accent)]";
}

export function HomeTabs({
  currentTab,
  q,
  tag,
  language,
}: {
  currentTab: TabKey;
  q: string;
  tag: string;
  language: string;
}) {
  const browseParams = new URLSearchParams();
  browseParams.set("tab", "browse");

  if (q) {
    browseParams.set("q", q);
  }

  if (tag) {
    browseParams.set("tag", tag);
  }

  if (language) {
    browseParams.set("language", language);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/?tab=add" className={tabClass(currentTab === "add")}>
        Add article
      </Link>
      <Link href={`/?${browseParams.toString()}`} className={tabClass(currentTab === "browse")}>
        Browse articles
      </Link>
    </div>
  );
}
