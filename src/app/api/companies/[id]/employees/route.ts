import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createEmployeeSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  position: z.string().min(1, "Position is required"),
  applicationId: z.string().optional(),
  salary: z.number().positive().optional(),
  contractType: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "VOLUNTEER", "FREELANCE"]).optional(),
  notes: z.string().optional(),
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

    // Only COMPANIES role can access this endpoint
    if (session.user.role !== "COMPANIES") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: companyId } = await params;
    // Verify the user owns this company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true },
    });

    if (!company || company.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      companyId: companyId,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    const [employees, total] = await Promise.all([
      prisma.companyEmployee.findMany({
        where,
        orderBy: { hiredAt: "desc" },
        skip,
        take: limit,
        include: {
          employee: {
            select: {
              id: true,
              user: {
                select: {
                  email: true,
                },
              },
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
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.companyEmployee.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      employees,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
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

    // Only COMPANIES role can create employees
    if (session.user.role !== "COMPANIES") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: companyId } = await params;
    // Verify the user owns this company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true },
    });

    if (!company || company.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createEmployeeSchema.parse(body);

    // Check if employee profile exists
    const employeeProfile = await prisma.profile.findUnique({
      where: { userId: validatedData.employeeId },
      select: { id: true },
    });

    if (!employeeProfile) {
      return NextResponse.json(
        { error: "Employee profile not found" },
        { status: 404 }
      );
    }

    // Check if employee is already hired by this company
    const existingEmployee = await prisma.companyEmployee.findUnique({
      where: {
        companyId_employeeId: {
          companyId: companyId,
          employeeId: validatedData.employeeId,
        },
      },
    });

    if (existingEmployee && existingEmployee.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Employee is already active in this company" },
        { status: 400 }
      );
    }

    // Create or reactivate employee record
    const employee = existingEmployee
        ? await prisma.companyEmployee.update({
          where: { id: existingEmployee.id },
          data: {
            status: "ACTIVE",
            position: validatedData.position,
            salary: validatedData.salary,
            contractType: validatedData.contractType,
            notes: validatedData.notes,
            hiredAt: new Date(),
            terminatedAt: null,
          },
          include: {
            employee: {
              select: {
                id: true,
                user: {
                  select: {
                    email: true,
                  },
                },
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        })
      : await prisma.companyEmployee.create({
          data: {
            companyId: companyId,
            employeeId: validatedData.employeeId,
            position: validatedData.position,
            salary: validatedData.salary,
            contractType: validatedData.contractType,
            notes: validatedData.notes,
            status: "ACTIVE",
          },
          include: {
            employee: {
              select: {
                id: true,
                user: {
                  select: {
                    email: true,
                  },
                },
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        });

    // If this was created from an application, update the application status
    if (validatedData.applicationId) {
      await prisma.jobApplication.update({
        where: { id: validatedData.applicationId },
        data: {
          status: "HIRED",
          hiredAt: new Date(),
          employeeStatus: "ACTIVE",
        },
      });
    }

    return NextResponse.json({
      success: true,
      employee,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating employee:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
