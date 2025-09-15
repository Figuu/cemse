import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateInterestSchema = z.object({
  status: z.enum(["INTERESTED", "CONTACTED", "INTERVIEW_SCHEDULED", "HIRED", "NOT_INTERESTED"]).optional(),
  notes: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; interestId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: applicationId, interestId } = await params;
    const body = await request.json();
    const validatedData = updateInterestSchema.parse(body);

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

    // Check if interest exists and belongs to the company
    const existingInterest = await prisma.youthApplicationCompanyInterest.findUnique({
      where: { id: interestId },
    });

    if (!existingInterest) {
      return NextResponse.json(
        { error: "Interest not found" },
        { status: 404 }
      );
    }

    if (existingInterest.companyId !== company.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const updateData: any = { ...validatedData };
    
    // If status is being updated to CONTACTED, set contactedAt
    if (validatedData.status === "CONTACTED" && existingInterest.status !== "CONTACTED") {
      updateData.contactedAt = new Date();
    }

    const interest = await prisma.youthApplicationCompanyInterest.update({
      where: { id: interestId },
      data: updateData,
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

    return NextResponse.json(interest);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; interestId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interestId } = await params;

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

    // Check if interest exists and belongs to the company
    const existingInterest = await prisma.youthApplicationCompanyInterest.findUnique({
      where: { id: interestId },
    });

    if (!existingInterest) {
      return NextResponse.json(
        { error: "Interest not found" },
        { status: 404 }
      );
    }

    if (existingInterest.companyId !== company.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.youthApplicationCompanyInterest.delete({
      where: { id: interestId },
    });

    return NextResponse.json({ message: "Interest removed successfully" });
  } catch (error) {
    console.error("Error deleting interest:", error);
    return NextResponse.json(
      { error: "Failed to delete interest" },
      { status: 500 }
    );
  }
}
