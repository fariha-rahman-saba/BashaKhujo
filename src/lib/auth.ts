import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-dev-secret";
const COOKIE_NAME = "bashakhujo_token";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  nidVerified: boolean;
  avgRating: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      nidVerified: true,
      avgRating: true,
    },
  });

  return user;
}

export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}

export async function getAuthUserFromRequest(
  request: Request
): Promise<AuthUser | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      nidVerified: true,
      avgRating: true,
    },
  });

  return user;
}

export async function updateUserAvgRating(userId: string) {
  const result = await prisma.review.aggregate({
    where: { revieweeId: userId },
    _avg: { rating: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { avgRating: result._avg.rating ?? 0 },
  });
}
