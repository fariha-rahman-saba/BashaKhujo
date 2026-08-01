import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma, RoomType, ListingStatus } from "@prisma/client";

const createListingSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  rent: z.number().int().positive(),
  areaName: z.string().min(2),
  latitude: z.number(),
  longitude: z.number(),
  roomType: z.enum(["SINGLE_ROOM", "SUBLET", "FULL_FLAT"]),
  bachelorFriendly: z.boolean(),
  photos: z.array(z.string()).default([]),
  videoUrl: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area");
  const minRent = searchParams.get("minRent");
  const maxRent = searchParams.get("maxRent");
  const roomType = searchParams.get("roomType");
  const bachelorFriendly = searchParams.get("bachelorFriendly");
  const status = searchParams.get("status") || "ACTIVE";
  const listerId = searchParams.get("listerId");
  const q = searchParams.get("q");

  const where: Prisma.ListingWhereInput = {
    status: status as ListingStatus,
  };

  if (area) where.areaName = { contains: area };
  if (minRent || maxRent) {
    where.rent = {};
    if (minRent) where.rent.gte = parseInt(minRent);
    if (maxRent) where.rent.lte = parseInt(maxRent);
  }
  if (roomType) where.roomType = roomType as RoomType;
  if (bachelorFriendly === "true") where.bachelorFriendly = true;
  if (listerId) where.listerId = listerId;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { areaName: { contains: q } },
    ];
  }

  const listings = await prisma.listing.findMany({
    where,
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
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(listings);
}

export async function POST(request: Request) {
  const user = await getAuthUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "LISTER" && user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Only listers can create listings" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const data = createListingSchema.parse(body);

    const listing = await prisma.listing.create({
      data: {
        ...data,
        listerId: user.id,
      },
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
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Create listing error:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
