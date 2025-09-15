import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const published = searchParams.get("published") === "true";

    const skip = (page - 1) * limit;

    const where: any = {};

    if (published) {
      where.status = 'PUBLISHED';
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    const [news, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: [
          { publishedAt: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.newsArticle.count({ where }),
    ]);

    return NextResponse.json({
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching entrepreneurship news:", error);
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

    const body = await request.json();
    const {
      title,
      summary,
      content,
      imageUrl,
      videoUrl,
      category,
      tags,
      isPublished = false,
    } = body;

    const news = await prisma.newsArticle.create({
      data: {
        title,
        summary,
        content,
        imageUrl,
        videoUrl,
        category,
        tags: tags || [],
        status: isPublished ? 'PUBLISHED' : 'DRAFT',
        publishedAt: isPublished ? new Date() : null,
        authorId: session.user.id,
        authorName: session.user.profile ? 
          `${session.user.profile.firstName || ''} ${session.user.profile.lastName || ''}`.trim() || session.user.email :
          session.user.email,
        authorType: 'ADMIN',
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    console.error("Error creating entrepreneurship news:", error);
    return NextResponse.json(
      { error: "Failed to create news" },
      { status: 500 }
    );
  }
}
