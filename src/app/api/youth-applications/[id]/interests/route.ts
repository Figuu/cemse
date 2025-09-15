import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createInterestSchema = z.object({
  status: z.enum(["INTERESTED", "CONTACTED", "INTERVIEW_SCHEDULED", "HIRED", "NOT_INTERESTED"]).default("INTERESTED"),
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

    const { id: applicationId } = await params;

    // Get company for the current user
    const company = await prisma.company.findFirst({
      where: { 
        OR: [
          { createdBy: session.user.id },
          { ownerId: session.user.id }
        ]
      },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const interests = await prisma.youthApplicationCompanyInterest.findMany({
      where: {
        applicationId,
        companyId: company.id,
      },
      include: {
        application: {
          include: {
            youthProfile: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
      orderBy: {
        interestedAt: "desc",
      },
    });

    return NextResponse.json({ interests });
  } catch (error) {
    console.error("Error fetching interests:", error);
    return NextResponse.json(
      { error: "Failed to fetch interests" },
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

    // Check if user is a company
    if (session.user.role !== "COMPANIES") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: applicationId } = await params;
    const body = await request.json();
    const validatedData = createInterestSchema.parse(body);

    // Get company for the current user
    const company = await prisma.company.findFirst({
      where: { 
        OR: [
          { createdBy: session.user.id },
          { ownerId: session.user.id }
        ]
      },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Check if application exists
    const application = await prisma.youthApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Youth application not found" },
        { status: 404 }
      );
    }

    // Check if interest already exists
    const existingInterest = await prisma.youthApplicationCompanyInterest.findUnique({
      where: {
        applicationId_companyId: {
          applicationId,
          companyId: company.id,
        },
      },
    });

    if (existingInterest) {
      return NextResponse.json(
        { error: "Interest already exists" },
        { status: 400 }
      );
    }

    const interest = await prisma.youthApplicationCompanyInterest.create({
      data: {
        applicationId,
        companyId: company.id,
        status: validatedData.status,
        notes: validatedData.notes,
      },
      include: {
        application: {
          include: {
            youthProfile: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    return NextResponse.json(interest, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating interest:", error);
    return NextResponse.json(
      { error: "Failed to create interest" },
      { status: 500 }
    );
  }
}