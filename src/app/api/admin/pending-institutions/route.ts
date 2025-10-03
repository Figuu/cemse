import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const pendingInstitutions = await prisma.institution.findMany({
      where: {
        approvalStatus: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pendingInstitutions);
  } catch (error) {
    console.error("Error fetching pending institutions:", error);
    return NextResponse.json(
      { error: "Error al obtener instituciones pendientes" },
      { status: 500 }
    );
  }
}
