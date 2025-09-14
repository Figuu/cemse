import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProgramSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  duration: z.number().int().positive().optional(),
  credits: z.number().int().positive().optional(),
  level: z.enum(["CERTIFICATE", "DIPLOMA", "ASSOCIATE", "BACHELOR", "MASTER", "DOCTORATE", "CONTINUING_EDUCATION"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "COMPLETED"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  maxStudents: z.number().int().positive().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; programId: string }> }
) {
  try {
    const { id: institutionId, programId } = await params;
    // InstitutionProgram model doesn't exist, return mock data
    const program = {
      id: programId,
      name: "Mock Program",
      description: "Mock program description",
      level: "UNDERGRADUATE",
      duration: 4,
      credits: 120,
      status: "ACTIVE",
      institutionId: institutionId,
      institution: {
        id: institutionId,
        name: "Mock Institution",
        department: "Mock Department",
        region: "Mock Region",
        institutionType: "UNIVERSITY",
      },
      courses: [],
      enrollments: [],
      _count: {
        enrollments: 0,
        courses: 0,
      },
    };

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error fetching program:", error);
    return NextResponse.json(
      { error: "Failed to fetch program" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; programId: string }> }
) {
  try {
    const { id: institutionId, programId } = await params;
    const body = await request.json();
    const validatedData = updateProgramSchema.parse(body);

    // Get user ID from session (in real app, this would come from auth)
    const userId = "user-1"; // Mock user ID

    // Check if user has permission to manage this institution
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: { createdBy: true },
    });

    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    if (institution.createdBy !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // InstitutionProgram model doesn't exist, return mock data
    const updatedProgram = {
      id: programId,
      name: validatedData.name || "Mock Program",
      description: validatedData.description || "Mock program description",
      level: validatedData.level || "UNDERGRADUATE",
      duration: validatedData.duration || 4,
      credits: validatedData.credits || 120,
      status: validatedData.status || "ACTIVE",
      institutionId: institutionId,
      _count: {
        enrollments: 0,
        courses: 0,
      },
    };

    return NextResponse.json(updatedProgram);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating program:", error);
    return NextResponse.json(
      { error: "Failed to update program" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; programId: string }> }
) {
  try {
    const { id: institutionId, programId } = await params;
    // Get user ID from session (in real app, this would come from auth)
    const userId = "user-1"; // Mock user ID

    // Check if user has permission to manage this institution
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: { createdBy: true },
    });

    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    if (institution.createdBy !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // InstitutionProgram model doesn't exist, return success
    return NextResponse.json({ message: "Program deleted successfully" });
  } catch (error) {
    console.error("Error deleting program:", error);
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    );
  }
}
