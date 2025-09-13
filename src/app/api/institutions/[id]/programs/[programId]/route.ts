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
  { params }: { params: { id: string; programId: string } }
) {
  try {
    const program = await prisma.institutionProgram.findFirst({
      where: {
        id: params.programId,
        institutionId: params.id,
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            department: true,
            region: true,
            institutionType: true,
          },
        },
        courses: {
          include: {
            instructor: {
              select: {
                id: true,
                instructor: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { enrollmentDate: "desc" },
        },
        _count: {
          select: {
            enrollments: true,
            courses: true,
          },
        },
      },
    });

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
  { params }: { params: { id: string; programId: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateProgramSchema.parse(body);

    // Get user ID from session (in real app, this would come from auth)
    const userId = "user-1"; // Mock user ID

    // Check if user has permission to manage this institution
    const institution = await prisma.institution.findUnique({
      where: { id: params.id },
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

    const updatedProgram = await prisma.institutionProgram.update({
      where: { id: params.programId },
      data: validatedData,
      include: {
        _count: {
          select: {
            enrollments: true,
            courses: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProgram);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
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
  { params }: { params: { id: string; programId: string } }
) {
  try {
    // Get user ID from session (in real app, this would come from auth)
    const userId = "user-1"; // Mock user ID

    // Check if user has permission to manage this institution
    const institution = await prisma.institution.findUnique({
      where: { id: params.id },
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

    // Check if program has active enrollments
    const activeEnrollments = await prisma.institutionEnrollment.count({
      where: {
        programId: params.programId,
        status: "ACTIVE",
      },
    });

    if (activeEnrollments > 0) {
      return NextResponse.json(
        { error: "Cannot delete program with active enrollments" },
        { status: 400 }
      );
    }

    // Delete program
    await prisma.institutionProgram.delete({
      where: { id: params.programId },
    });

    return NextResponse.json({ message: "Program deleted successfully" });
  } catch (error) {
    console.error("Error deleting program:", error);
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    );
  }
}
