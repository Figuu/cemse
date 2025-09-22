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
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const authorId = searchParams.get("authorId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const whereClause: any = {};

    if (category && category !== "all") {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } }
      ];
    }

    if (status && status !== "all") {
      whereClause.status = status;
    }

    if (authorId) {
      whereClause.authorId = authorId;
    }

    // Only show published news to non-admin users, but allow users to see their own news
    if (session.user.role !== "SUPERADMIN" && session.user.role !== "INSTITUTION" && session.user.role !== "COMPANIES") {
      whereClause.status = "PUBLISHED";
    } else if (session.user.role === "COMPANIES" && !authorId) {
      // COMPANY users see only published news when not filtering by authorId
      whereClause.status = "PUBLISHED";
    }

    const news = await prisma.newsArticle.findMany({
      where: whereClause,
      include: {
        author: {
          include: {
            profile: {
              include: {
                institution: true
              }
            }
          }
        },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: offset
    });

    return NextResponse.json({
      success: true,
      news
    });

  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
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

    // Only allow SUPERADMIN, INSTITUTION, and COMPANIES users to create news
    if (session.user.role !== "SUPERADMIN" && session.user.role !== "INSTITUTION" && session.user.role !== "COMPANIES") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      content,
      summary,
      category,
      tags,
      imageUrl,
      videoUrl,
      status = "DRAFT",
      priority = "MEDIUM",
      featured = false,
      targetAudience = [],
      region,
      relatedLinks,
      isEntrepreneurshipRelated = false
    } = body;

    // Validate required fields
    if (!title || !content || !category) {
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

    const authorType = session.user.role === "SUPERADMIN" ? "ADMIN" : 
                      session.user.role === "INSTITUTION" ? "INSTITUTION" : "COMPANY";

    const news = await prisma.newsArticle.create({
      data: {
        title,
        content,
        summary: summary || content.substring(0, 200) + "...",
        category,
        tags: tags || [],
        imageUrl,
        videoUrl,
        status,
        priority,
        featured,
        targetAudience,
        region,
        relatedLinks,
        isEntrepreneurshipRelated,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        authorId: session.user.id,
        authorName,
        authorType: authorType as any,
      },
      include: {
        author: {
          include: {
            profile: {
              include: {
                institution: true
              }
            }
          }
        },
      }
    });

    return NextResponse.json({
      success: true,
      news
    });

  } catch (error) {
    console.error("Error creating news:", error);
    return NextResponse.json(
      { error: "Failed to create news" },
      { status: 500 }
    );
  }
}
