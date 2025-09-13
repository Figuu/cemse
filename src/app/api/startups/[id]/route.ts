import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateStartupSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre es muy largo").optional(),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(1000, "La descripción es muy larga").optional(),
  category: z.string().min(1, "La categoría es requerida").optional(),
  subcategory: z.string().optional(),
  businessStage: z.enum(["IDEA", "STARTUP", "GROWING", "ESTABLISHED"]).optional(),
  logo: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  municipality: z.string().min(1, "El municipio es requerido").optional(),
  department: z.string().optional(),
  socialMedia: z.object({
    facebook: z.string().url().optional(),
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    instagram: z.string().url().optional(),
  }).optional(),
  founded: z.string().datetime().optional(),
  employees: z.number().int().min(0).optional(),
  annualRevenue: z.number().min(0).optional(),
  businessModel: z.string().optional(),
  targetMarket: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startup = await prisma.entrepreneurship.findUnique({
      where: {
        id: params.id,
        isActive: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            email: true,
            phone: true,
          },
        },
        businessPlan: {
          select: {
            id: true,
            executiveSummary: true,
            marketAnalysis: true,
            financialProjections: true,
            marketingStrategy: true,
            operationsPlan: true,
            riskAnalysis: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!startup) {
      return NextResponse.json(
        { error: "Startup no encontrada" },
        { status: 404 }
      );
    }

    // Check if user can view this startup
    const canView = startup.isPublic || startup.ownerId === session.user.id;
    
    if (!canView) {
      return NextResponse.json(
        { error: "No tienes permisos para ver esta startup" },
        { status: 403 }
      );
    }

    // Increment view count if not the owner
    if (startup.ownerId !== session.user.id) {
      await prisma.entrepreneurship.update({
        where: { id: params.id },
        data: { viewsCount: { increment: 1 } },
      });
    }

    return NextResponse.json({
      success: true,
      startup,
    });

  } catch (error) {
    console.error("Error fetching startup:", error);
    return NextResponse.json(
      { error: "Failed to fetch startup" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateStartupSchema.parse(body);

    // Check if startup exists and user owns it
    const existingStartup = await prisma.entrepreneurship.findUnique({
      where: {
        id: params.id,
        isActive: true,
      },
    });

    if (!existingStartup) {
      return NextResponse.json(
        { error: "Startup no encontrada" },
        { status: 404 }
      );
    }

    if (existingStartup.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permisos para editar esta startup" },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = { ...validatedData };
    if (validatedData.founded) {
      updateData.founded = new Date(validatedData.founded);
    }

    // Update startup
    const startup = await prisma.entrepreneurship.update({
      where: { id: params.id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        businessPlan: {
          select: {
            id: true,
            executiveSummary: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      startup,
      message: "Startup actualizada exitosamente",
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating startup:", error);
    return NextResponse.json(
      { error: "Failed to update startup" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if startup exists and user owns it
    const existingStartup = await prisma.entrepreneurship.findUnique({
      where: {
        id: params.id,
        isActive: true,
      },
    });

    if (!existingStartup) {
      return NextResponse.json(
        { error: "Startup no encontrada" },
        { status: 404 }
      );
    }

    if (existingStartup.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar esta startup" },
        { status: 403 }
      );
    }

    // Soft delete startup
    await prisma.entrepreneurship.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Startup eliminada exitosamente",
    });

  } catch (error) {
    console.error("Error deleting startup:", error);
    return NextResponse.json(
      { error: "Failed to delete startup" },
      { status: 500 }
    );
  }
}
