import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  logo: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
  size: z.enum(["STARTUP", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]).optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  socialMedia: z.record(z.string(), z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  culture: z.string().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  values: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  remoteWork: z.boolean().optional(),
  hybridWork: z.boolean().optional(),
  officeWork: z.boolean().optional(),
  totalEmployees: z.number().int().positive().optional(),
  isPublic: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        creator: {
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
          },
        },
        jobOffers: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            location: true,
            contractType: true,
            experienceLevel: true,
            salaryMin: true,
            salaryMax: true,
            salaryCurrency: true,
            featured: true,
            createdAt: true,
            _count: {
              select: {
                applications: true,
              },
            },
          },
        },
        _count: {
          select: {
            jobOffers: true,
            employees: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // View count functionality not implemented in schema
    // Would need to add viewsCount field to Company model

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
    const body = await request.json();
    const validatedData = updateCompanySchema.parse(body);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Check if user owns the company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true, createdBy: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Check if user owns the company or is admin
    if (company.ownerId !== userId && company.createdBy !== userId && session.user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: validatedData,
      include: {
        creator: {
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
          },
        },
        _count: {
          select: {
            jobOffers: true,
            employees: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Check if user owns the company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true, createdBy: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Check if user owns the company or is admin
    if (company.ownerId !== userId && company.createdBy !== userId && session.user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.company.update({
      where: { id: companyId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { error: "Failed to delete company" },
      { status: 500 }
    );
  }
}
