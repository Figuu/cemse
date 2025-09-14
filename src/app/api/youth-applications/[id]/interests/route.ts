import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const expressInterestSchema = z.object({
  notes: z.string().optional(),
});

const updateInterestSchema = z.object({
  status: z.enum(["INTERESTED", "CONTACTED", "INTERVIEW_SCHEDULED", "HIRED", "NOT_INTERESTED"]).optional(),
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

    const { id } = await params;

    // Check if application exists
    const application = await prisma.youthApplication.findUnique({
      where: { id },
      select: { youthProfileId: true, isPublic: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Check permissions - owner or public application
    const canView = 
      application.youthProfileId === session.user.id ||
      application.isPublic ||
      session.user.role === "SUPERADMIN";

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const interests = await prisma.youthApplicationCompanyInterest.findMany({
      where: { applicationId: id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            // industry: true, // This field doesn't exist
            // location: true, // This field doesn't exist in Company model
            website: true,
            description: true,
          },
        },
      },
      orderBy: { interestedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      interests,
    });

  } catch (error) {
    console.error("Error fetching application interests:", error);
    return NextResponse.json(
      { error: "Failed to fetch application interests" },
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

    // Only COMPANY role can express interest
    if (session.user.role !== "COMPANIES") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = expressInterestSchema.parse(body);

    // Check if application exists and is public and active
    const application = await prisma.youthApplication.findUnique({
      where: { id },
      select: { id: true, isPublic: true, status: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (!application.isPublic || application.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Application is not available for interest" },
        { status: 400 }
      );
    }

    // Get company ID from user profile
    const company = await prisma.company.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 }
      );
    }

    // Check if company already expressed interest
    const existingInterest = await prisma.youthApplicationCompanyInterest.findUnique({
      where: {
        applicationId_companyId: {
          applicationId: id,
          companyId: company.id,
        },
      },
    });

    if (existingInterest) {
      return NextResponse.json(
        { error: "You have already expressed interest in this application" },
        { status: 400 }
      );
    }

    // Create interest record
    const interest = await prisma.youthApplicationCompanyInterest.create({
      data: {
        applicationId: id,
        companyId: company.id,
        notes: validatedData.notes,
        status: "INTERESTED",
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            // industry: true, // This field doesn't exist
            // location: true, // This field doesn't exist in Company model
          },
        },
      },
    });

    // Update application applications count
    await prisma.youthApplication.update({
      where: { id },
      data: { applicationsCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      interest,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error expressing interest:", error);
    return NextResponse.json(
      { error: "Failed to express interest" },
      { status: 500 }
    );
  }
}

// Update interest status (for companies to update their interest status)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only COMPANY role can update interest
    if (session.user.role !== "COMPANIES") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateInterestSchema.parse(body);

    // Get company ID from user profile
    const company = await prisma.company.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 }
      );
    }

    // Check if interest exists
    const existingInterest = await prisma.youthApplicationCompanyInterest.findUnique({
      where: {
        applicationId_companyId: {
          applicationId: id,
          companyId: company.id,
        },
      },
    });

    if (!existingInterest) {
      return NextResponse.json(
        { error: "Interest record not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = { ...validatedData };

    // Set contactedAt timestamp if status is CONTACTED
    if (validatedData.status === "CONTACTED" && existingInterest.status !== "CONTACTED") {
      updateData.contactedAt = new Date();
    }

    const updatedInterest = await prisma.youthApplicationCompanyInterest.update({
      where: {
        applicationId_companyId: {
          applicationId: id,
          companyId: company.id,
        },
      },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    // If hired, update the youth application status and create employee record
    if (validatedData.status === "HIRED") {
      await prisma.youthApplication.update({
        where: { id },
        data: { status: "HIRED" },
      });

      // Get the youth profile ID
      const application = await prisma.youthApplication.findUnique({
        where: { id },
        select: { youthProfileId: true, title: true },
      });

      if (application) {
        // Create employee record
        await prisma.companyEmployee.create({
          data: {
            companyId: company.id,
            employeeId: application.youthProfileId,
            position: application.title || "New Position",
            status: "ACTIVE",
            notes: `Hired through youth application: ${id}`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      interest: updatedInterest,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating interest:", error);
    return NextResponse.json(
      { error: "Failed to update interest" },
      { status: 500 }
    );
  }
}
