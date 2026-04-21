import { verifyAuthenticationResponse, type AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applySession, clearChallenge, readChallenge } from "@/lib/session";
import { getAppOrigin, getRpId } from "@/lib/webauthn";

export async function POST(request: Request) {
  try {
    const challenge = await readChallenge("authentication");
    if (!challenge?.challenge) {
      return NextResponse.json({ error: "Authentication challenge is missing or expired." }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as {
      authentication?: Parameters<typeof verifyAuthenticationResponse>[0]["response"];
    } | null;

    if (!body?.authentication?.id) {
      return NextResponse.json({ error: "Authentication response is required." }, { status: 400 });
    }

    const passkey = await prisma.passkey.findUnique({
      where: { credentialId: body.authentication.id },
      include: { user: true },
    });

    if (!passkey) {
      return NextResponse.json({ error: "Unknown passkey." }, { status: 404 });
    }

    const verification = await verifyAuthenticationResponse({
      response: body.authentication,
      expectedChallenge: challenge.challenge,
      expectedOrigin: getAppOrigin(),
      expectedRPID: getRpId(),
      requireUserVerification: false,
      credential: {
        id: passkey.credentialId,
        publicKey: new Uint8Array(passkey.publicKey),
        counter: passkey.counter,
        transports: passkey.transports as AuthenticatorTransportFuture[],
      },
    });

    if (!verification.verified) {
      return NextResponse.json({ error: "Passkey verification failed." }, { status: 400 });
    }

    await prisma.passkey.update({
      where: { id: passkey.id },
      data: {
        counter: verification.authenticationInfo.newCounter,
        lastUsedAt: new Date(),
      },
    });

    const response = NextResponse.json({ ok: true });
    await applySession(response, passkey.userId);
    clearChallenge(response);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify passkey login.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
