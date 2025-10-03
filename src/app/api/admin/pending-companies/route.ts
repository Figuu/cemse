import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== "SUPERADMIN" && session.user.role !== "INSTITUTION")) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const pendingCompanies = await prisma.company.findMany({
      where: {
        approvalStatus: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pendingCompanies);
  } catch (error) {
    console.error("Error fetching pending companies:", error);
    return NextResponse.json(
      { error: "Error al obtener empresas pendientes" },
      { status: 500 }
    );
  }
}
