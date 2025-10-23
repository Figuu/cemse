import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getTimeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return "Hoy";
  if (diffInDays === 1) return "Ayer";
  if (diffInDays < 7) return `Hace ${diffInDays} días`;
  if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
  if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
  return `Hace ${Math.floor(diffInDays / 365)} años`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;

    // Fetch company with related data
    const company = await prisma.company.findUnique({
      where: { id: companyId },
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
        _count: {
          select: {
            jobOffers: true,
            employees: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Fetch active job offers
    const jobs = await prisma.jobOffer.findMany({
      where: {
        companyId: companyId,
        isActive: true,
        status: "ACTIVE",
      },
      orderBy: { publishedAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        contractType: true,
        workModality: true,
        salaryMin: true,
        salaryMax: true,
        salaryCurrency: true,
        experienceLevel: true,
        publishedAt: true,
        applicationDeadline: true,
        isActive: true,
        viewsCount: true,
        applicationsCount: true,
      },
    });

    // Fetch news articles by this company using ownerId
    const newsAuthorId = company.ownerId || company.createdBy;
    
    const news = await prisma.newsArticle.findMany({
      where: {
        authorId: newsAuthorId,
        authorType: "COMPANY",
        status: "PUBLISHED",
      },
      orderBy: { publishedAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        summary: true,
        category: true,
        publishedAt: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
        imageUrl: true,
        tags: true,
      },
    });

    // Fetch resources by this company using ownerId
    const resourcesAuthorId = company.ownerId || company.createdBy;
    
    // Only fetch resources if the company actually created them
    // For now, we'll return empty array since all resources are created by the same admin user
    const resources = await prisma.resource.findMany({
      where: {
        createdByUserId: resourcesAuthorId,
        isPublic: true,
        status: "PUBLISHED",
        // Add additional filter to ensure resources are actually from this company
        // This is a temporary solution until we have proper company-resource relationship
        AND: [
          {
            // Only show resources if they were created by a user associated with this company
            // For now, we'll return empty since all resources are admin-created
            createdByUserId: {
              not: "cmh3g0q2j0000czx4m12cr80g" // Admin user ID - exclude admin resources
            }
          }
        ]
      },
      orderBy: { publishedDate: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        category: true,
        publishedDate: true,
        downloads: true,
        rating: true,
        thumbnail: true,
        tags: true,
      },
    });

    // Fetch employees
    const employees = await prisma.companyEmployee.findMany({
      where: {
        companyId: companyId,
        status: "ACTIVE",
      },
      orderBy: { hiredAt: "desc" },
      take: 20,
      select: {
        id: true,
        position: true,
        hiredAt: true,
        status: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Add timeAgo to news and resources for consistency
    const newsWithTimeAgo = news.map(article => ({
      ...article,
      timeAgo: getTimeAgo(article.publishedAt?.toISOString() || new Date().toISOString()),
    }));

    const resourcesWithTimeAgo = resources.map(resource => ({
      ...resource,
      timeAgo: getTimeAgo(resource.publishedDate?.toISOString() || new Date().toISOString()),
    }));

    return NextResponse.json({
      success: true,
      company,
      jobs,
      news: newsWithTimeAgo,
      resources: resourcesWithTimeAgo,
      employees,
    });

  } catch (error) {
    console.error("Error fetching company details:", error);
    return NextResponse.json(
      { error: "Failed to fetch company details" },
      { status: 500 }
    );
  }
}
