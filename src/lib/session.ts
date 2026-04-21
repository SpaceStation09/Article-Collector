import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "article-collector-session";
const CHALLENGE_COOKIE = "article-collector-challenge";
const SETUP_COOKIE = "article-collector-setup";

type SessionPayload = {
  type: "session";
  sub: string;
};

type ChallengePayload = {
  type: "registration" | "authentication";
  challenge: string;
  pendingWebauthnUserId?: string;
};

type SetupPayload = {
  type: "setup";
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

async function signToken(payload: SessionPayload | ChallengePayload | SetupPayload, expiresIn: string) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getAuthSecret());
}

async function verifyToken<T>(token: string | undefined, expectedType: T extends { type: infer U } ? U : never) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getAuthSecret());

    if (payload.type !== expectedType) {
      return null;
    }

    return payload as T;
  } catch {
    return null;
  }
}

function applyCookie(response: NextResponse, name: string, value: string, maxAge: number) {
  response.cookies.set({
    name,
    value,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

function clearCookie(response: NextResponse, name: string) {
  response.cookies.set({
    name,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function createSessionToken(userId: string) {
  return signToken({ type: "session", sub: userId }, "30d");
}

export async function applySession(response: NextResponse, userId: string) {
  const token = await createSessionToken(userId);
  applyCookie(response, SESSION_COOKIE, token, 60 * 60 * 24 * 30);
}

export function clearSession(response: NextResponse) {
  clearCookie(response, SESSION_COOKIE);
}

export async function createChallenge(response: NextResponse, payload: Omit<ChallengePayload, "type"> & { type: ChallengePayload["type"] }) {
  const token = await signToken(payload, "10m");
  applyCookie(response, CHALLENGE_COOKIE, token, 60 * 10);
}

export function clearChallenge(response: NextResponse) {
  clearCookie(response, CHALLENGE_COOKIE);
}

export async function readChallenge(expectedType: ChallengePayload["type"]) {
  const cookieStore = await cookies();
  const token = cookieStore.get(CHALLENGE_COOKIE)?.value;
  return verifyToken<ChallengePayload>(token, expectedType);
}

export async function createSetupSession(response: NextResponse) {
  const token = await signToken({ type: "setup" }, "15m");
  applyCookie(response, SETUP_COOKIE, token, 60 * 15);
}

export async function hasSetupSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SETUP_COOKIE)?.value;
  return Boolean(await verifyToken<SetupPayload>(token, "setup"));
}

export function clearSetupSession(response: NextResponse) {
  clearCookie(response, SETUP_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = await verifyToken<SessionPayload>(token, "session");

  if (!payload?.sub) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: payload.sub },
    include: { passkeys: { orderBy: { createdAt: "asc" } } },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { user, response: null };
}
