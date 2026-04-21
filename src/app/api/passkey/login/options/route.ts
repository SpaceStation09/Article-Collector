import { generateAuthenticationOptions, type AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createChallenge } from "@/lib/session";
import { getRpId } from "@/lib/webauthn";

export async function POST() {
  const user = await prisma.user.findFirst({
    include: { passkeys: true },
  });

  if (!user || user.passkeys.length === 0) {
    return NextResponse.json({ error: "No passkeys have been registered yet." }, { status: 404 });
  }

  const options = await generateAuthenticationOptions({
    rpID: getRpId(),
    userVerification: "preferred",
    allowCredentials: user.passkeys.map((passkey) => ({
      id: passkey.credentialId,
      transports: passkey.transports as AuthenticatorTransportFuture[],
    })),
  });

  const response = NextResponse.json({ options });
  await createChallenge(response, {
    type: "authentication",
    challenge: options.challenge,
  });
  return response;
}
