import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateEmployeeSchema = z.object({
  status: z.enum(["ACTIVE", "TERMINATED", "ON_LEAVE"]).optional(),
  position: z.string().optional(),
  salary: z.number().positive().optional(),
  contractType: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "VOLUNTEER", "FREELANCE"]).optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; employeeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only COMPANIES role can access this endpoint
    if (session.user.role !== "COMPANIES") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: companyId, employeeId } = await params;
    // Verify the user owns this company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { createdBy: true },
    }) as any;

    if (!company || company.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const employee = await prisma.companyEmployee.findUnique({
      where: { id: employeeId },
      include: {
        employee: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
                phone: true,
                address: true,
                city: true,
                skillsWithLevel: true,
                workExperience: true,
                educationLevel: true,
              },
            },
          } as any,
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }) as any;

    if (!employee || employee.companyId !== companyId) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      employee,
    }) as any;

  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; employeeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only COMPANIES role can update employees
    if (session.user.role !== "COMPANIES") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: companyId, employeeId } = await params;
    // Verify the user owns this company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { createdBy: true },
    }) as any;

    if (!company || company.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateEmployeeSchema.parse(body);

    // Check if employee exists and belongs to this company
    const existingEmployee = await prisma.companyEmployee.findUnique({
      where: { id: employeeId },
    }) as any;

    if (!existingEmployee || existingEmployee.companyId !== companyId) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = { ...validatedData };

    // Set termination date if status is TERMINATED
    if (validatedData.status === "TERMINATED" && existingEmployee.status !== "TERMINATED") {
      updateData.terminatedAt = new Date();
    }

    // Clear termination date if status is changed from TERMINATED
    if (validatedData.status && validatedData.status !== "TERMINATED" && existingEmployee.status === "TERMINATED") {
      updateData.terminatedAt = null;
    }

    const updatedEmployee = await prisma.companyEmployee.update({
      where: { id: employeeId },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          } as any,
        },
      },
    }) as any;

    return NextResponse.json({
      success: true,
      employee: updatedEmployee,
    }) as any;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; employeeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only COMPANIES role can delete employees
    if (session.user.role !== "COMPANIES") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: companyId, employeeId } = await params;
    // Verify the user owns this company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { createdBy: true },
    }) as any;

    if (!company || company.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if employee exists and belongs to this company
    const employee = await prisma.companyEmployee.findUnique({
      where: { id: employeeId },
    }) as any;

    if (!employee || employee.companyId !== companyId) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting status to TERMINATED instead of actually deleting
    await prisma.companyEmployee.update({
      where: { id: employeeId },
      data: { 
        status: "TERMINATED",
        terminatedAt: new Date(),
      },
    }) as any;

    return NextResponse.json({
      success: true,
      message: "Employee terminated successfully",
    }) as any;

  } catch (error) {
    console.error("Error terminating employee:", error);
    return NextResponse.json(
      { error: "Failed to terminate employee" },
      { status: 500 }
    );
  }
}
