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

    if (!session?.user || (session.user.role !== "SUPERADMIN" && session.user.role !== "INSTITUTION")) {
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

    const company = await prisma.company.findUnique({
      where: { id: params.id },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      );
    }

    if (company.approvalStatus !== "PENDING") {
      return NextResponse.json(
        { error: "Esta empresa ya ha sido procesada" },
        { status: 400 }
      );
    }

    // Reject the company
    const updatedCompany = await prisma.company.update({
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
      message: "Empresa rechazada",
      company: updatedCompany,
    });
  } catch (error) {
    console.error("Error rejecting company:", error);
    return NextResponse.json(
      { error: "Error al rechazar empresa" },
      { status: 500 }
    );
  }
}
