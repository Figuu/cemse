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
    const type = searchParams.get("type") || "all"; // all, sent, received
    const status = searchParams.get("status"); // PENDING, ACCEPTED, DECLINED
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    // Build where clause based on type and status
    let whereClause: any = {};
    
    if (type === "sent") {
      whereClause.requesterId = session.user.id;
    } else if (type === "received") {
      whereClause.addresseeId = session.user.id;
    } else {
      // all connections where user is either requester or addressee
      whereClause.OR = [
        { requesterId: session.user.id },
        { addresseeId: session.user.id }
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    const [connections, total] = await Promise.all([
      prisma.entrepreneurshipConnection.findMany({
        where: whereClause,
        include: {
          requester: {
            select: {
              id: true,
              userId: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          },
          addressee: {
            select: {
              id: true,
              userId: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.entrepreneurshipConnection.count({ where: whereClause })
    ]);

    // Transform connections to include user info
    const transformedConnections = connections.map(conn => ({
      id: conn.id,
      requesterId: conn.requesterId,
      addresseeId: conn.addresseeId,
      status: conn.status,
      message: conn.message,
      createdAt: conn.createdAt.toISOString(),
      updatedAt: conn.updatedAt.toISOString(),
      acceptedAt: conn.acceptedAt?.toISOString(),
      requester: {
        id: conn.requester.userId, // Use userId instead of profile id
        name: `${conn.requester.firstName} ${conn.requester.lastName}`,
        email: conn.requester.user.email,
        image: conn.requester.avatarUrl
      },
      addressee: {
        id: conn.addressee.userId, // Use userId instead of profile id
        name: `${conn.addressee.firstName} ${conn.addressee.lastName}`,
        email: conn.addressee.user.email,
        image: conn.addressee.avatarUrl
      }
    }));

    return NextResponse.json({
      connections: transformedConnections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("=== POST REQUEST RECEIVED ===");
  
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session?.user?.id);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Body:", body);
    
    const { addresseeId, message } = body;

    if (!addresseeId) {
      return NextResponse.json({ error: "Addressee ID required" }, { status: 400 });
    }

    // Check if both users exist and have profiles
    const [requesterProfile, addresseeProfile] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: session.user.id } }),
      prisma.profile.findUnique({ where: { userId: addresseeId } })
    ]);

    if (!requesterProfile) {
      console.log("Requester profile not found for user:", session.user.id);
      return NextResponse.json({ 
        error: "Tu perfil no está completo. Por favor, completa tu perfil antes de enviar solicitudes de conexión." 
      }, { status: 400 });
    }

    if (!addresseeProfile) {
      console.log("Addressee profile not found for user:", addresseeId);
      return NextResponse.json({ 
        error: "El usuario no tiene un perfil completo. No se puede enviar la solicitud de conexión." 
      }, { status: 400 });
    }

    // Check if users are trying to connect with themselves
    if (session.user.id === addresseeId) {
      return NextResponse.json({ 
        error: "No puedes enviar una solicitud de conexión a ti mismo." 
      }, { status: 400 });
    }

    // Check if connection already exists
    const existingConnection = await prisma.entrepreneurshipConnection.findFirst({
      where: {
        OR: [
          { requesterId: session.user.id, addresseeId: addresseeId },
          { requesterId: addresseeId, addresseeId: session.user.id }
        ]
      }
    });

    if (existingConnection) {
      if (existingConnection.status === "PENDING") {
        return NextResponse.json({ 
          error: "Ya existe una solicitud de conexión pendiente entre estos usuarios." 
        }, { status: 400 });
      } else if (existingConnection.status === "ACCEPTED") {
        return NextResponse.json({ 
          error: "Ya estás conectado con este usuario." 
        }, { status: 400 });
      }
    }

    console.log("Both profiles found, proceeding with connection creation");

    console.log("Creating connection...");
    const connection = await prisma.entrepreneurshipConnection.create({
      data: {
        requesterId: session.user.id,
        addresseeId,
        message: message || null,
      },
    });

    console.log("Connection created successfully:", connection);
    return NextResponse.json({ success: true, connection });
    
  } catch (error) {
    console.error("=== ERROR ===", error);
    return NextResponse.json(
      { error: "Failed to create connection", details: error.message },
      { status: 500 }
    );
  }
}