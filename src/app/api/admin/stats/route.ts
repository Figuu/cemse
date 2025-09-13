import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get system statistics
    const [
      totalUsers,
      activeUsers,
      totalCompanies,
      totalInstitutions,
      totalCourses,
      totalJobs,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          profile: {
            lastLoginAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        }
      }),
      prisma.company.count(),
      prisma.institution.count(),
      prisma.course.count(),
      prisma.jobOffer.count(),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              lastLoginAt: true,
            }
          }
        }
      })
    ]);

    // Calculate system health based on various factors
    let systemHealth: "excellent" | "good" | "warning" | "critical" = "good";
    
    const userActivityRate = activeUsers / totalUsers;
    if (userActivityRate > 0.8) {
      systemHealth = "excellent";
    } else if (userActivityRate > 0.6) {
      systemHealth = "good";
    } else if (userActivityRate > 0.4) {
      systemHealth = "warning";
    } else {
      systemHealth = "critical";
    }

    const stats = {
      totalUsers,
      activeUsers,
      totalCompanies,
      totalInstitutions,
      totalCourses,
      totalJobs,
      systemHealth,
      userActivityRate: Math.round(userActivityRate * 100),
    };

    // Transform recent users
    const recentUsersData = recentUsers.map(user => ({
      id: user.id,
      name: user.profile ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() || "Sin nombre" : "Sin nombre",
      email: user.email,
      role: user.role,
      status: user.isActive ? "active" : "inactive",
      joinDate: user.createdAt.toISOString().split('T')[0],
      lastActivity: user.profile?.lastLoginAt ? user.profile.lastLoginAt.toISOString().split('T')[0] : "Nunca",
    }));

    return NextResponse.json({
      success: true,
      stats,
      recentUsers: recentUsersData,
    });

  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
}
