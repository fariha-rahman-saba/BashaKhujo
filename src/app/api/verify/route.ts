import { NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "LISTER") {
    return NextResponse.json(
      { error: "Only listers can request verification" },
      { status: 403 }
    );
  }

  const { nidNumber } = await request.json();

  if (!nidNumber || String(nidNumber).length < 10) {
    return NextResponse.json(
      { error: "Valid NID number required" },
      { status: 400 }
    );
  }

  // MVP: auto-approve verification (mock manual approval flow)
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { nidVerified: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      nidVerified: true,
      avgRating: true,
    },
  });

  return NextResponse.json({
    user: updated,
    message: "NID verified successfully (mock approval for MVP)",
  });
}
