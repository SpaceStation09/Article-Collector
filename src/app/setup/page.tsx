import { redirect } from "next/navigation";
import { PasskeySetup } from "@/components/passkey-setup";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export default async function SetupPage() {
  const [currentUser, existingUser] = await Promise.all([
    getCurrentUser(),
    prisma.user.findFirst({ select: { id: true } }),
  ]);

  if (currentUser) {
    redirect("/");
  }

  if (existingUser) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16 sm:px-10">
      <div className="grid w-full gap-8 rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
        <section className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">First-time setup</p>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Create the first passkey and keep this library entirely under your own control.
            </h1>
            <p className="max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              Enter the bootstrap token from your environment, then register the passkey you want to trust on this site.
            </p>
          </div>
        </section>

        <section className="rounded-[28px] bg-[#efe6d8] p-6">
          <div className="space-y-3 pb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Bootstrap</p>
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">This page works only once.</h2>
            <p className="text-sm leading-6 text-[var(--muted)]">
              After the first passkey is created, setup closes and future access goes through `/login` only.
            </p>
          </div>
          <PasskeySetup />
        </section>
      </div>
    </main>
  );
}
