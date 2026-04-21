import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSetupSession } from "@/lib/session";

function secureEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request: Request) {
  const configuredToken = process.env.BOOTSTRAP_TOKEN;

  if (!configuredToken) {
    return NextResponse.json({ error: "BOOTSTRAP_TOKEN is not configured." }, { status: 500 });
  }

  const existingUser = await prisma.user.findFirst({ select: { id: true } });
  if (existingUser) {
    return NextResponse.json({ error: "Setup has already been completed." }, { status: 409 });
  }

  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  if (!body?.token || !secureEquals(body.token, configuredToken)) {
    return NextResponse.json({ error: "Invalid bootstrap token." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  await createSetupSession(response);
  return response;
}
