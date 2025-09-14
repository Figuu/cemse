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
  cvUrl: z.string().optional(),
  coverLetterUrl: z.string().optional(),
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
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const userId = searchParams.get("userId"); // To filter by specific user

    const skip = (page - 1) * limit;

    // Build where clause based on user role
    const where: Record<string, unknown> = {};

    if (session.user.role === "YOUTH") {
      // Youth users can only see their own applications
      where.youthProfileId = session.user.id;
    } else if (session.user.role === "COMPANIES") {
      // Companies can see all public applications
      where.isPublic = true;
      where.status = "ACTIVE"; // Only show active applications to companies
    } else {
      // Admin and institutions can see all applications
      where.isPublic = true;
    }

    // Apply additional filters
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { youthProfile: { 
            profile: {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } }
              ]
            }
          }
        }
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (userId) {
      where.youthProfileId = userId;
    }

    // Build orderBy clause
    const orderBy: Record<string, string> = {};
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
              // userId: true, // This field doesn't exist on User model
              firstName: true,
              lastName: true,
              avatarUrl: true,
              city: true,
              skillsWithLevel: true,
              workExperience: true,
              educationLevel: true,
              phone: true,
            },
          },
          companyInterests: {
            where: session.user.role === "COMPANIES" ? { companyId: session.user.id } : {},
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                  // industry: true, // This field doesn't exist
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

    const totalPages = Math.ceil(total / limit);

    // Transform applications for frontend
    const transformedApplications = applications.map(app => ({
      id: app.id,
      title: app.title,
      description: app.description,
      status: app.status,
      isPublic: app.isPublic,
      viewsCount: app.viewsCount,
      applicationsCount: app.applicationsCount,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      cvFile: app.cvFile,
      coverLetterFile: app.coverLetterFile,
      cvUrl: app.cvUrl,
      coverLetterUrl: app.coverLetterUrl,
      youth: {
        id: app.youthProfileId,
        email: '', // Email not available in profile
        profile: {
          firstName: app.youthProfile.firstName || "",
          lastName: app.youthProfile.lastName || "",
          avatarUrl: app.youthProfile.avatarUrl,
          city: app.youthProfile.city,
          skills: app.youthProfile.skillsWithLevel || [],
          experience: app.youthProfile.workExperience || [],
          education: app.youthProfile.educationLevel,
          phone: app.youthProfile.phone,
        },
      },
      companyInterests: app.companyInterests,
      totalInterests: app._count.companyInterests,
      hasInterest: session.user.role === "COMPANIES" ? app.companyInterests.length > 0 : false,
    }));

    return NextResponse.json({
      success: true,
      applications: transformedApplications,
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

    // Only YOUTH role can create youth applications
    if (session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createYouthApplicationSchema.parse(body);

    // Check if user has an active application already
    const existingApplication = await prisma.youthApplication.findFirst({
      where: {
        youthProfileId: session.user.id,
        status: "ACTIVE",
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You already have an active application. Please close it before creating a new one." },
        { status: 400 }
      );
    }

    const application = await prisma.youthApplication.create({
      data: {
        ...validatedData,
        youthProfileId: session.user.id,
      },
      include: {
        youthProfile: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        title: application.title,
        description: application.description,
        status: application.status,
        isPublic: application.isPublic,
        createdAt: application.createdAt.toISOString(),
        youth: {
          id: application.youthProfileId,
          email: "",
          profile: null,
        },
      },
    });

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
