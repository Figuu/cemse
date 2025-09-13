import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const excludeConnected = searchParams.get("excludeConnected") === "true";

    const skip = (page - 1) * limit;

    const where: any = {
      id: { not: session.user.id }, // Exclude current user
      role: "YOUTH", // Only show youth users
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (excludeConnected) {
      // Exclude users who already have connections with current user
      const existingConnections = await prisma.entrepreneurshipConnection.findMany({
        where: {
          OR: [
            { requesterId: session.user.id },
            { addresseeId: session.user.id },
          ],
        },
        select: {
          requesterId: true,
          addresseeId: true,
        },
      });

      const connectedUserIds = existingConnections.map(conn => 
        conn.requesterId === session.user.id ? conn.addresseeId : conn.requesterId
      );

      where.id = {
        not: {
          in: [session.user.id, ...connectedUserIds],
        },
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          // Count posts
          _count: {
            select: {
              entrepreneurshipPosts: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Get connection status for each user
    const userIds = users.map(user => user.id);
    const connections = await prisma.entrepreneurshipConnection.findMany({
      where: {
        OR: [
          { requesterId: session.user.id, addresseeId: { in: userIds } },
          { addresseeId: session.user.id, requesterId: { in: userIds } },
        ],
      },
      select: {
        id: true,
        requesterId: true,
        addresseeId: true,
        status: true,
      },
    });

    const usersWithConnections = users.map(user => {
      const connection = connections.find(conn => 
        conn.requesterId === user.id || conn.addresseeId === user.id
      );

      return {
        ...user,
        connectionStatus: connection ? {
          id: connection.id,
          status: connection.status,
          isRequester: connection.requesterId === session.user.id,
        } : null,
      };
    });

    return NextResponse.json({
      users: usersWithConnections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching entrepreneurship users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
