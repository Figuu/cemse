import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: institutionId } = await params;

    // Fetch institution with related data
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        courses: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            level: true,
            category: true,
            duration: true,
            studentsCount: true,
            createdAt: true,
            publishedAt: true,
          },
        },
        _count: {
          select: {
            courses: true,
            profiles: true,
            companies: true,
          },
        },
      },
    });

    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    // Fetch recent news related to this institution
    const recentNews = await prisma.newsArticle.findMany({
      where: {
        authorType: "INSTITUTION",
        authorId: institution.creator.id,
        status: "PUBLISHED",
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        summary: true,
        imageUrl: true,
        publishedAt: true,
        viewCount: true,
        category: true,
      },
    });

    // Fetch resources related to this institution
    const resources = await prisma.resource.findMany({
      where: {
        createdByUserId: institution.creator.id,
        isPublic: true,
        status: "PUBLISHED",
      },
      orderBy: { publishedDate: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        category: true,
        thumbnail: true,
        publishedDate: true,
        downloads: true,
        rating: true,
      },
    });

    // Transform the data
    const transformedInstitution = {
      ...institution,
      recentCourses: institution.courses.map(course => ({
        ...course,
        status: course.publishedAt ? "Activo" : "Próximamente",
      })),
      recentNews: recentNews.map(news => ({
        ...news,
        timeAgo: getTimeAgo(news.publishedAt),
      })),
      resources: resources.map(resource => ({
        ...resource,
        timeAgo: getTimeAgo(resource.publishedDate),
      })),
    };

    return NextResponse.json({
      success: true,
      institution: transformedInstitution,
    });

  } catch (error) {
    console.error("Error fetching institution details:", error);
    return NextResponse.json(
      { error: "Failed to fetch institution details" },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date | null): string {
  if (!date) return "Fecha no disponible";
  
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return "Hoy";
  if (diffInDays === 1) return "Ayer";
  if (diffInDays < 7) return `Hace ${diffInDays} días`;
  if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
  if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
  return `Hace ${Math.floor(diffInDays / 365)} años`;
}
