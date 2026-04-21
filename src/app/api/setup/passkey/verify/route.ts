import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applySession, clearChallenge, clearSetupSession, hasSetupSession, readChallenge } from "@/lib/session";
import { getAppOrigin, getRpId } from "@/lib/webauthn";

export async function POST(request: Request) {
  try {
    const existingUser = await prisma.user.findFirst({ select: { id: true } });
    if (existingUser) {
      return NextResponse.json({ error: "Setup has already been completed." }, { status: 409 });
    }

    if (!(await hasSetupSession())) {
      return NextResponse.json({ error: "Setup session is missing or expired." }, { status: 401 });
    }

    const challenge = await readChallenge("registration");
    if (!challenge?.challenge || !challenge.pendingWebauthnUserId) {
      return NextResponse.json({ error: "Registration challenge is missing or expired." }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as {
      registration?: Parameters<typeof verifyRegistrationResponse>[0]["response"];
      deviceName?: string;
    } | null;

    if (!body?.registration) {
      return NextResponse.json({ error: "Registration response is required." }, { status: 400 });
    }

    const verification = await verifyRegistrationResponse({
      response: body.registration,
      expectedChallenge: challenge.challenge,
      expectedOrigin: getAppOrigin(),
      expectedRPID: getRpId(),
      requireUserVerification: false,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: "Passkey verification failed." }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        webauthnUserId: challenge.pendingWebauthnUserId,
        passkeys: {
          create: {
            name: body.deviceName?.trim() || "Primary passkey",
            credentialId: verification.registrationInfo.credential.id,
            publicKey: Buffer.from(verification.registrationInfo.credential.publicKey),
            counter: verification.registrationInfo.credential.counter,
            transports: verification.registrationInfo.credential.transports ?? [],
          },
        },
      },
    });

    const response = NextResponse.json({ ok: true });
    await applySession(response, user.id);
    clearChallenge(response);
    clearSetupSession(response);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify passkey registration.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
