import { generateRegistrationOptions } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createChallenge, hasSetupSession } from "@/lib/session";
import { getRpId, getRpName } from "@/lib/webauthn";

export async function POST() {
  const existingUser = await prisma.user.findFirst({ select: { id: true } });
  if (existingUser) {
    return NextResponse.json({ error: "Setup has already been completed." }, { status: 409 });
  }

  if (!(await hasSetupSession())) {
    return NextResponse.json({ error: "Setup session is missing or expired." }, { status: 401 });
  }

  const pendingWebauthnUserId = crypto.randomUUID();
  const options = await generateRegistrationOptions({
    rpID: getRpId(),
    rpName: getRpName(),
    userName: "owner",
    userDisplayName: "Owner",
    userID: new TextEncoder().encode(pendingWebauthnUserId),
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  const response = NextResponse.json({ options });
  await createChallenge(response, {
    type: "registration",
    challenge: options.challenge,
    pendingWebauthnUserId,
  });
  return response;
}
