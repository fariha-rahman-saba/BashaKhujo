import { NextResponse } from "next/server";
import { getAuthUser, getTokenFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getAuthUser();
  const token = getTokenFromRequest(request);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user, token });
}
