import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EntrepreneurshipConnectionStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") as EntrepreneurshipConnectionStatus;
    const type = searchParams.get("type"); // "sent", "received", "all"

    const skip = (page - 1) * limit;

    const where: any = {};

    if (type === "sent") {
      where.requesterId = session.user.id;
    } else if (type === "received") {
      where.addresseeId = session.user.id;
    } else {
      where.OR = [
        { requesterId: session.user.id },
        { addresseeId: session.user.id },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [connections, total] = await Promise.all([
      prisma.entrepreneurshipConnection.findMany({
        where,
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          addressee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.entrepreneurshipConnection.count({ where }),
    ]);

    return NextResponse.json({
      connections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching entrepreneurship connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { addresseeId, message } = body;

    if (!addresseeId) {
      return NextResponse.json({ error: "Addressee ID is required" }, { status: 400 });
    }

    if (addresseeId === session.user.id) {
      return NextResponse.json({ error: "Cannot connect with yourself" }, { status: 400 });
    }
    
    // Check if addressee exists
    const addressee = await prisma.user.findUnique({
      where: { id: addresseeId },
      select: { id: true },
    });

    if (!addressee) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if connection already exists
    const existingConnection = await prisma.entrepreneurshipConnection.findFirst({
      where: {
        OR: [
          { requesterId: session.user.id, addresseeId },
          { requesterId: addresseeId, addresseeId: session.user.id },
        ],
      },
    });

    if (existingConnection) {
      return NextResponse.json({ error: "Connection already exists" }, { status: 400 });
    }

    const connection = await prisma.entrepreneurshipConnection.create({
      data: {
        requesterId: session.user.id,
        addresseeId,
        message: message || null,
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        addressee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(connection, { status: 201 });
  } catch (error) {
    console.error("Error creating entrepreneurship connection:", error);
    return NextResponse.json(
      { error: "Failed to create connection" },
      { status: 500 }
    );
  }
}
