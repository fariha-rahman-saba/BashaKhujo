import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  listingId: z.string(),
  advanceAmount: z.number().int().positive(),
});

const updateSchema = z.object({
  transactionId: z.string(),
  action: z.enum(["confirm_move_in", "cancel"]),
});

export async function GET(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [{ seekerId: user.id }, { listerId: user.id }],
    },
    include: {
      listing: {
        select: { id: true, title: true, areaName: true, photos: true },
      },
      seeker: { select: { id: true, name: true } },
      lister: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "SEEKER") {
    return NextResponse.json(
      { error: "Only seekers can initiate advance payment" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
    });

    if (!listing || listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Listing not available" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        listingId: data.listingId,
        seekerId: user.id,
        listerId: listing.listerId,
        advanceAmount: data.advanceAmount,
        status: "HELD",
      },
      include: {
        listing: { select: { id: true, title: true } },
        lister: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const transaction = await prisma.transaction.findUnique({
      where: { id: data.transactionId },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (data.action === "confirm_move_in") {
      if (transaction.seekerId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const result = await tx.transaction.update({
          where: { id: data.transactionId },
          data: { status: "RELEASED" },
        });

        await tx.listing.update({
          where: { id: transaction.listingId },
          data: { status: "RENTED" },
        });

        return result;
      });

      return NextResponse.json(updated);
    }

    if (data.action === "cancel") {
      if (
        transaction.seekerId !== user.id &&
        transaction.listerId !== user.id
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await prisma.transaction.delete({
        where: { id: data.transactionId },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}
