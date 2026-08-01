import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const reportSchema = z.object({
  listingId: z.string().optional(),
  reportedUserId: z.string().optional(),
  reason: z.string().min(10),
});

export async function GET(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const reports = await prisma.report.findMany({
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      listing: { select: { id: true, title: true } },
      reportedUser: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reports);
}

export async function PUT(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { reportId, status } = await request.json();

  const report = await prisma.report.update({
    where: { id: reportId },
    data: { status },
  });

  return NextResponse.json(report);
}

export async function POST(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = reportSchema.parse(body);

    if (!data.listingId && !data.reportedUserId) {
      return NextResponse.json(
        { error: "Must specify listing or user to report" },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        listingId: data.listingId,
        reportedUserId: data.reportedUserId,
        reason: data.reason,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
