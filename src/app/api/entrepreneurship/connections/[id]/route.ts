import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConnectionStatus } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: connectionId } = await params;
    const connection = await prisma.entrepreneurshipConnection.findUnique({
      where: { id: connectionId },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
        addressee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
    });

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // Check if user is part of this connection
    if (connection.requesterId !== session.user.id && connection.addresseeId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(connection);
  } catch (error) {
    console.error("Error fetching entrepreneurship connection:", error);
    return NextResponse.json(
      { error: "Failed to fetch connection" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: connectionId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !Object.values(ConnectionStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Check if connection exists and user is the addressee
    const existingConnection = await prisma.entrepreneurshipConnection.findUnique({
      where: { id: connectionId },
      select: { 
        id: true, 
        addresseeId: true, 
        status: true 
      },
    });

    if (!existingConnection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    if (existingConnection.addresseeId !== session.user.id) {
      return NextResponse.json({ error: "Only the addressee can respond to connection requests" }, { status: 403 });
    }

    if (existingConnection.status !== ConnectionStatus.PENDING) {
      return NextResponse.json({ error: "Connection request has already been responded to" }, { status: 400 });
    }

    const connection = await prisma.entrepreneurshipConnection.update({
      where: { id: connectionId },
      data: {
        status,
        acceptedAt: status === ConnectionStatus.ACCEPTED ? new Date() : null,
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
        addressee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(connection);
  } catch (error) {
    console.error("Error updating entrepreneurship connection:", error);
    return NextResponse.json(
      { error: "Failed to update connection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: connectionId } = await params;
    // Check if connection exists and user is part of it
    const existingConnection = await prisma.entrepreneurshipConnection.findUnique({
      where: { id: connectionId },
      select: { 
        id: true, 
        requesterId: true, 
        addresseeId: true 
      },
    });

    if (!existingConnection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    if (existingConnection.requesterId !== session.user.id && existingConnection.addresseeId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.entrepreneurshipConnection.delete({
      where: { id: connectionId },
    });

    return NextResponse.json({ message: "Connection deleted successfully" });
  } catch (error) {
    console.error("Error deleting entrepreneurship connection:", error);
    return NextResponse.json(
      { error: "Failed to delete connection" },
      { status: 500 }
    );
  }
}
