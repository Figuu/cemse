import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createYouthApplicationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  cvFile: z.string().optional(),
  coverLetterFile: z.string().optional(),
  cvUrl: z.string().url().optional().or(z.literal("")),
  coverLetterUrl: z.string().url().optional().or(z.literal("")),
  isPublic: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isPublic: true,
      status: "ACTIVE",
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [applications, total] = await Promise.all([
      prisma.youthApplication.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          youthProfile: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              phone: true,
              address: true,
              city: true,
              skills: true,
              workExperience: true,
              educationLevel: true,
              currentInstitution: true,
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          companyInterests: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              companyInterests: true,
            },
          },
        },
      }),
      prisma.youthApplication.count({ where }),
    ]);

    // Get current company for the user (if they're a company)
    let currentCompany = null;
    if (session?.user?.role === "COMPANIES") {
      currentCompany = await prisma.company.findFirst({
        where: { 
          OR: [
            { createdBy: session.user.id },
            { ownerId: session.user.id }
          ]
        },
        select: { id: true }
      });
    }

    // Transform the data to match the expected structure
    const transformedApplications = applications.map(app => {
      // Find current company's interest in this application
      const currentCompanyInterest = currentCompany 
        ? app.companyInterests.find(interest => interest.company.id === currentCompany.id)
        : null;

      return {
        ...app,
        youth: {
          id: app.youthProfile.userId,
          email: app.youthProfile.user.email,
          profile: {
            firstName: app.youthProfile.firstName || '',
            lastName: app.youthProfile.lastName || '',
            avatarUrl: app.youthProfile.avatarUrl,
            city: app.youthProfile.city,
            skills: app.youthProfile.skills || [],
            experience: app.youthProfile.workExperience || [],
            education: app.youthProfile.educationLevel || app.youthProfile.currentInstitution,
            phone: app.youthProfile.phone,
          },
        },
        totalInterests: app._count.companyInterests,
        hasInterest: !!currentCompanyInterest,
        interestStatus: currentCompanyInterest?.status || null,
        interestId: currentCompanyInterest?.id || null,
      };
    });

    return NextResponse.json({
      applications: transformedApplications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching youth applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch youth applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a youth
    if (session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createYouthApplicationSchema.parse(body);

    const application = await prisma.youthApplication.create({
      data: {
        ...validatedData,
        youthProfileId: session.user.id,
      },
      include: {
        youthProfile: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            phone: true,
            address: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            companyInterests: true,
          },
        },
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating youth application:", error);
    return NextResponse.json(
      { error: "Failed to create youth application" },
      { status: 500 }
    );
  }
}