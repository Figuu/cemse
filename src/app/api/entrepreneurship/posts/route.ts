import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type") as PostType;
    const search = searchParams.get("search");
    const authorId = searchParams.get("authorId");

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (search) {
      where.OR = [
        { content: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.entrepreneurshipPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              image: true,
            },
          },
          postLikes: {
            select: {
              id: true,
              userId: true,
            },
          },
          postComments: {
            select: {
              id: true,
              content: true,
              author: {
                select: {
                  id: true,
                  firstName: true,
              lastName: true,
                  image: true,
                },
              },
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 3,
          },
        },
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.entrepreneurshipPost.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching entrepreneurship posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
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
      content,
      type = "TEXT",
      images = [],
      tags = [],
    } = body;

    const post = await prisma.entrepreneurshipPost.create({
      data: {
        content,
        type,
        images,
        tags,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        postLikes: {
          select: {
            id: true,
            userId: true,
          },
        },
        postComments: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                id: true,
                firstName: true,
              lastName: true,
                image: true,
              },
            },
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 3,
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating entrepreneurship post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
