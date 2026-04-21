import { redirect } from "next/navigation";
import { PasskeyLogin } from "@/components/passkey-login";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [currentUser, existingUser] = await Promise.all([
    getCurrentUser(),
    prisma.user.findFirst({ select: { id: true } }),
  ]);
  const { error } = await searchParams;

  if (currentUser) {
    redirect("/");
  }

  if (!existingUser) {
    redirect("/setup");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16 sm:px-10">
      <div className="grid w-full gap-8 rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
        <section className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">Private library</p>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Keep the articles worth revisiting, without building another messy bookmark pile.
            </h1>
            <p className="max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              Save a link, fetch its title, add tags, then find it later by keyword or topic from any device.
            </p>
          </div>
        </section>

        <section className="flex flex-col justify-between rounded-[28px] bg-[#efe6d8] p-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Access</p>
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">Only the passkeys you registered on this site can enter.</h2>
            <p className="text-sm leading-6 text-[var(--muted)]">
              No third-party OAuth provider is involved. Login stays limited to the passkeys stored for this single-user app.
            </p>
            {error ? (
              <p className="rounded-2xl border border-[#d6a6a6] bg-[#fff1f1] px-4 py-3 text-sm text-[#8b3d3d]">
                {error}
              </p>
            ) : null}
          </div>
          <div className="mt-8">
            <PasskeyLogin />
          </div>
        </section>
      </div>
    </main>
  );
}
