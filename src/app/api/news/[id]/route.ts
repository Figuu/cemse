import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const news = await prisma.newsArticle.findUnique({
      where: { id },
      include: {
        author: {
          include: {
            profile: true
          }
        },
        // Note: views and likes relations don't exist on NewsArticle model
        // Note: comments relation doesn't exist on NewsArticle model
        // Note: _count relation doesn't exist on NewsArticle model
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
    // Note: newsView model doesn't exist, skipping view tracking
    const existingView = null;

    // Note: newsView model doesn't exist, skipping view creation

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if user owns the news or is admin
    const news = await prisma.newsArticle.findUnique({
      where: { id },
      select: { authorId: true, publishedAt: true }
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
      summary,
      category,
      tags,
      imageUrl,
      videoUrl,
      status,
      priority,
      featured,
      targetAudience,
      region,
      relatedLinks,
      isEntrepreneurshipRelated
    } = body;

    const updateData: any = {
      title,
      content,
      summary,
      category,
      tags,
      imageUrl,
      videoUrl,
      status,
      priority,
      featured,
      targetAudience,
      region,
      relatedLinks,
      isEntrepreneurshipRelated,
      updatedAt: new Date()
    };

    // Remove scheduledAt since it's not in the schema

    if (status === "PUBLISHED" && !news.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updatedNews = await prisma.newsArticle.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          include: {
            profile: true
          }
        },
        // Note: _count relation doesn't exist on NewsArticle model
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user owns the news or is admin
    const news = await prisma.newsArticle.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!news) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    if (news.authorId !== session.user.id && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.newsArticle.delete({
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
