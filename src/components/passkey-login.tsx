"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PasskeyLogin() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleLogin() {
    setIsPending(true);
    setMessage(null);

    try {
      const optionsResponse = await fetch("/api/passkey/login/options", {
        method: "POST",
      });
      const optionsText = await optionsResponse.text();
      const optionsData = optionsText ? JSON.parse(optionsText) : {};

      if (!optionsResponse.ok) {
        throw new Error(optionsData.error ?? "Unable to start passkey login.");
      }

      const authentication = await startAuthentication({ optionsJSON: optionsData.options });

      const verifyResponse = await fetch("/api/passkey/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authentication }),
      });
      const verifyText = await verifyResponse.text();
      const verifyData = verifyText ? JSON.parse(verifyText) : {};

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error ?? "Unable to verify passkey.");
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to log in with passkey.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleLogin}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Waiting for passkey..." : "Sign in with passkey"}
      </button>
      <p className="min-h-5 text-sm text-[var(--muted)]">{message}</p>
    </div>
  );
}
