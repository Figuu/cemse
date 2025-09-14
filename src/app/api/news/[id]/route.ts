import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const news = await prisma.news.findUnique({
      where: { id },
      include: {
        author: {
          include: {
            profile: true
          }
        },
        views: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        },
        likes: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: {
            views: true,
            likes: true,
            comments: true
          }
        }
      }
    });

    if (!news) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    // Check if user can view this news
    if (news.status !== "PUBLISHED" && 
        news.authorId !== session.user.id && 
        session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Track view if not already viewed by this user
    const existingView = await prisma.newsView.findFirst({
      where: {
        newsId: id,
        userId: session.user.id
      }
    });

    if (!existingView) {
      await prisma.newsView.create({
        data: {
          newsId: id,
          userId: session.user.id
        }
      });
    }

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Check if user owns the news or is admin
    const news = await prisma.news.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!news) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    if (news.authorId !== session.user.id && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const {
      title,
      content,
      excerpt,
      category,
      tags,
      featuredImage,
      status,
      scheduledAt
    } = body;

    const updateData: any = {
      title,
      content,
      excerpt,
      category,
      tags,
      featuredImage,
      status,
      updatedAt: new Date()
    };

    if (scheduledAt) {
      updateData.scheduledAt = new Date(scheduledAt);
    }

    if (status === "PUBLISHED" && !news.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updatedNews = await prisma.news.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          include: {
            profile: true
          }
        },
        _count: {
          select: {
            views: true,
            likes: true,
            comments: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      news: updatedNews
    });

  } catch (error) {
    console.error("Error updating news:", error);
    return NextResponse.json(
      { error: "Failed to update news" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if user owns the news or is admin
    const news = await prisma.news.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!news) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    if (news.authorId !== session.user.id && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.news.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "News deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting news:", error);
    return NextResponse.json(
      { error: "Failed to delete news" },
      { status: 500 }
    );
  }
}
