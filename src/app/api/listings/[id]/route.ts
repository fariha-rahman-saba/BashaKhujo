import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  status: z.enum(["ACTIVE", "RENTED"]).optional(),
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  rent: z.number().int().positive().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      lister: {
        select: {
          id: true,
          name: true,
          nidVerified: true,
          avgRating: true,
          phone: true,
          createdAt: true,
          reviewsReceived: {
            include: {
              reviewer: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
      reviews: {
        include: {
          reviewer: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json(listing);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (listing.listerId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.listing.update({
      where: { id },
      data,
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

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}
