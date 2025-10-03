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

    // Approve the company
    const updatedCompany = await prisma.company.update({
      where: { id: params.id },
      data: {
        approvalStatus: "APPROVED",
        approvedBy: session.user.id,
        approvedAt: new Date(),
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Empresa aprobada exitosamente",
      company: updatedCompany,
    });
  } catch (error) {
    console.error("Error approving company:", error);
    return NextResponse.json(
      { error: "Error al aprobar empresa" },
      { status: 500 }
    );
  }
}
