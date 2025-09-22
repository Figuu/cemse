import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const authorId = searchParams.get("authorId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const whereClause: any = {};

    if (category && category !== "all") {
      whereClause.category = category;
    }

    if (type && type !== "all") {
      whereClause.type = type;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } }
      ];
    }

    if (status && status !== "all") {
      whereClause.status = status;
    }

    if (authorId) {
      whereClause.createdByUserId = authorId;
    }

    // Only show published resources to non-admin users
    if (session.user.role !== "SUPERADMIN" && session.user.role !== "INSTITUTION") {
      whereClause.status = "PUBLISHED";
    }

    const resources = await prisma.resource.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            profile: {
              include: {
                institution: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    });

    return NextResponse.json({
      success: true,
      resources
    });

  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
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

    // Only allow SUPERADMIN, INSTITUTION, and COMPANIES users to create resources
    if (session.user.role !== "SUPERADMIN" && session.user.role !== "INSTITUTION" && session.user.role !== "COMPANIES") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      type,
      format,
      downloadUrl,
      externalUrl,
      thumbnail,
      tags,
      status = "DRAFT",
      isPublic = true,
      isEntrepreneurshipRelated = false
    } = body;

    // Validate required fields
    if (!title || !description || !category || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get author info from user profile
    const authorProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { firstName: true, lastName: true }
    });

    const authorName = authorProfile 
      ? `${authorProfile.firstName || ''} ${authorProfile.lastName || ''}`.trim() || session.user.email
      : session.user.email;

    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        category,
        type,
        format: format || type,
        downloadUrl,
        externalUrl,
        thumbnail: thumbnail || "",
        author: authorName,
        publishedDate: status === "PUBLISHED" ? new Date() : new Date(),
        tags: tags || [],
        status,
        isPublic,
        isEntrepreneurshipRelated,
        createdByUserId: session.user.id
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            profile: {
              include: {
                institution: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      resource
    });

  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}
