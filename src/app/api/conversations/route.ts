import { NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ seekerId: user.id }, { listerId: user.id }],
    },
    include: {
      listing: {
        select: { id: true, title: true, photos: true, areaName: true },
      },
      seeker: { select: { id: true, name: true } },
      lister: { select: { id: true, name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = await request.json();

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (listing.listerId === user.id) {
    return NextResponse.json(
      { error: "Cannot contact your own listing" },
      { status: 400 }
    );
  }

  const conversation = await prisma.conversation.upsert({
    where: {
      listingId_seekerId: {
        listingId,
        seekerId: user.id,
      },
    },
    create: {
      listingId,
      seekerId: user.id,
      listerId: listing.listerId,
    },
    update: {},
    include: {
      listing: {
        select: { id: true, title: true, photos: true, areaName: true },
      },
      seeker: { select: { id: true, name: true } },
      lister: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(conversation, { status: 201 });
}
