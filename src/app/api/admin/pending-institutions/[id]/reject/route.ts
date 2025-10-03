import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: "El motivo del rechazo es requerido" },
        { status: 400 }
      );
    }

    const institution = await prisma.institution.findUnique({
      where: { id: params.id },
    });

    if (!institution) {
      return NextResponse.json(
        { error: "Institución no encontrada" },
        { status: 404 }
      );
    }

    if (institution.approvalStatus !== "PENDING") {
      return NextResponse.json(
        { error: "Esta institución ya ha sido procesada" },
        { status: 400 }
      );
    }

    // Reject the institution
    const updatedInstitution = await prisma.institution.update({
      where: { id: params.id },
      data: {
        approvalStatus: "REJECTED",
        rejectionReason: reason,
        approvedBy: session.user.id,
        approvedAt: new Date(),
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Institución rechazada",
      institution: updatedInstitution,
    });
  } catch (error) {
    console.error("Error rejecting institution:", error);
    return NextResponse.json(
      { error: "Error al rechazar institución" },
      { status: 500 }
    );
  }
}
