import { NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await prisma.savedListing.findMany({
    where: { userId: user.id },
    include: {
      listing: {
        include: {
          lister: {
            select: {
              id: true,
              name: true,
              nidVerified: true,
              avgRating: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(saved.map((s) => s.listing));
}

export async function POST(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = await request.json();

  const saved = await prisma.savedListing.upsert({
    where: {
      userId_listingId: { userId: user.id, listingId },
    },
    create: { userId: user.id, listingId },
    update: {},
  });

  return NextResponse.json(saved, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = await request.json();

  await prisma.savedListing.deleteMany({
    where: { userId: user.id, listingId },
  });

  return NextResponse.json({ success: true });
}
