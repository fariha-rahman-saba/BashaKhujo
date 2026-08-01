import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getAuthUserFromRequest,
  updateUserAvgRating,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  revieweeId: z.string(),
  listingId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const listingId = searchParams.get("listingId");

  const where: Record<string, string> = {};
  if (userId) where.revieweeId = userId;
  if (listingId) where.listingId = listingId;

  const reviews = await prisma.review.findMany({
    where,
    include: {
      reviewer: { select: { id: true, name: true } },
      reviewee: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

export async function POST(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = reviewSchema.parse(body);

    if (data.revieweeId === user.id) {
      return NextResponse.json(
        { error: "Cannot review yourself" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        listingId: data.listingId,
        status: "RELEASED",
        OR: [
          { seekerId: user.id, listerId: data.revieweeId },
          { listerId: user.id, seekerId: data.revieweeId },
        ],
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "You can only review after move-in is confirmed" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        reviewerId: user.id,
        revieweeId: data.revieweeId,
        listingId: data.listingId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        reviewer: { select: { id: true, name: true } },
      },
    });

    await updateUserAvgRating(data.revieweeId);

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return NextResponse.json(
        { error: "You have already reviewed this user for this listing" },
        { status: 400 }
      );
    }
    console.error("Review error:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
