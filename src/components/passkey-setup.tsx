"use client";

import { startRegistration } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function PasskeySetup() {
  const router = useRouter();
  const [bootstrapToken, setBootstrapToken] = useState("");
  const [deviceName, setDeviceName] = useState("Primary passkey");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);

    try {
      const unlockResponse = await fetch("/api/setup/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: bootstrapToken }),
      });
      const unlockText = await unlockResponse.text();
      const unlockData = unlockText ? JSON.parse(unlockText) : {};

      if (!unlockResponse.ok) {
        throw new Error(unlockData.error ?? "Unable to unlock setup.");
      }

      const optionsResponse = await fetch("/api/setup/passkey/options", {
        method: "POST",
      });
      const optionsText = await optionsResponse.text();
      const optionsData = optionsText ? JSON.parse(optionsText) : {};

      if (!optionsResponse.ok) {
        throw new Error(optionsData.error ?? "Unable to create registration options.");
      }

      const registration = await startRegistration({ optionsJSON: optionsData.options });

      const verifyResponse = await fetch("/api/setup/passkey/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration, deviceName }),
      });
      const verifyText = await verifyResponse.text();
      const verifyData = verifyText ? JSON.parse(verifyText) : {};

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error ?? "Unable to finish setup.");
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to finish passkey setup.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
        Bootstrap token
        <input
          type="password"
          value={bootstrapToken}
          onChange={(event) => setBootstrapToken(event.target.value)}
          placeholder="Paste the one-time setup token"
          className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
        Passkey label
        <input
          value={deviceName}
          onChange={(event) => setDeviceName(event.target.value)}
          placeholder="iPhone, MacBook, 1Password"
          className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating passkey..." : "Create first passkey"}
      </button>

      <p className="min-h-5 text-sm text-[var(--muted)]">{message}</p>
    </form>
  );
}
