import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const businessPlanSchema = z.object({
  executiveSummary: z.string().min(50, "El resumen ejecutivo debe tener al menos 50 caracteres").max(2000, "El resumen ejecutivo es muy largo").optional(),
  marketAnalysis: z.string().min(100, "El análisis de mercado debe tener al menos 100 caracteres").max(5000, "El análisis de mercado es muy largo").optional(),
  financialProjections: z.object({
    revenue: z.array(z.object({
      year: z.number().int().min(2024),
      amount: z.number().min(0),
    })),
    expenses: z.array(z.object({
      year: z.number().int().min(2024),
      amount: z.number().min(0),
    })),
    profit: z.array(z.object({
      year: z.number().int().min(2024),
      amount: z.number(),
    })),
    funding: z.object({
      required: z.number().min(0),
      current: z.number().min(0),
      sources: z.array(z.string()),
    }),
  }).optional(),
  marketingStrategy: z.string().min(100, "La estrategia de marketing debe tener al menos 100 caracteres").max(3000, "La estrategia de marketing es muy larga").optional(),
  operationsPlan: z.string().min(100, "El plan de operaciones debe tener al menos 100 caracteres").max(3000, "El plan de operaciones es muy largo").optional(),
  riskAnalysis: z.string().min(100, "El análisis de riesgos debe tener al menos 100 caracteres").max(2000, "El análisis de riesgos es muy largo").optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if startup exists and user can access it
    const startup = await prisma.entrepreneurship.findUnique({
      where: {
        id,
        isActive: true,
      },
      select: {
        id: true,
        ownerId: true,
        isPublic: true,
      },
    });

    if (!startup) {
      return NextResponse.json(
        { error: "Startup no encontrada" },
        { status: 404 }
      );
    }

    const canAccess = startup.isPublic || startup.ownerId === session.user.id;
    
    if (!canAccess) {
      return NextResponse.json(
        { error: "No tienes permisos para ver este plan de negocios" },
        { status: 403 }
      );
    }

    // Get business plan
    const businessPlan = await prisma.businessPlan.findUnique({
      where: {
        entrepreneurshipId: id,
      },
    });

    return NextResponse.json({
      success: true,
      businessPlan,
    });

  } catch (error) {
    console.error("Error fetching business plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch business plan" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = businessPlanSchema.parse(body);

    // Check if startup exists and user owns it
    const startup = await prisma.entrepreneurship.findUnique({
      where: {
        id,
        isActive: true,
      },
      select: {
        id: true,
        ownerId: true,
      },
    });

    if (!startup) {
      return NextResponse.json(
        { error: "Startup no encontrada" },
        { status: 404 }
      );
    }

    if (startup.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permisos para crear este plan de negocios" },
        { status: 403 }
      );
    }

    // Check if business plan already exists
    const existingPlan = await prisma.businessPlan.findUnique({
      where: {
        entrepreneurshipId: id,
      },
    });

    if (existingPlan) {
      return NextResponse.json(
        { error: "Ya existe un plan de negocios para esta startup" },
        { status: 400 }
      );
    }

    // Create business plan
    const businessPlan = await prisma.businessPlan.create({
      data: {
        entrepreneurshipId: id,
        content: validatedData,
      },
    });

    return NextResponse.json({
      success: true,
      businessPlan,
      message: "Plan de negocios creado exitosamente",
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating business plan:", error);
    return NextResponse.json(
      { error: "Failed to create business plan" },
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

    const { id } = await params;
    const body = await request.json();
    const validatedData = businessPlanSchema.parse(body);

    // Check if startup exists and user owns it
    const startup = await prisma.entrepreneurship.findUnique({
      where: {
        id,
        isActive: true,
      },
      select: {
        id: true,
        ownerId: true,
      },
    });

    if (!startup) {
      return NextResponse.json(
        { error: "Startup no encontrada" },
        { status: 404 }
      );
    }

    if (startup.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permisos para editar este plan de negocios" },
        { status: 403 }
      );
    }

    // Check if business plan exists
    const existingPlan = await prisma.businessPlan.findUnique({
      where: {
        entrepreneurshipId: id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Plan de negocios no encontrado" },
        { status: 404 }
      );
    }

    // Update business plan
    const businessPlan = await prisma.businessPlan.update({
      where: {
        entrepreneurshipId: id,
      },
      data: {
        content: validatedData,
      },
    });

    return NextResponse.json({
      success: true,
      businessPlan,
      message: "Plan de negocios actualizado exitosamente",
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating business plan:", error);
    return NextResponse.json(
      { error: "Failed to update business plan" },
      { status: 500 }
    );
  }
}
