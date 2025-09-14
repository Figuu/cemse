import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AnalyticsService } from "@/lib/analyticsService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const role = searchParams.get("role");

    // Parse dates
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    let analyticsData;

    if (role) {
      // Get role-specific analytics
      analyticsData = await AnalyticsService.getRoleAnalytics(role, session.user.id);
    } else {
      // Get comprehensive analytics (admin only)
      if (session.user.role !== 'SUPERADMIN') {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      analyticsData = await AnalyticsService.getAnalyticsData(start, end);
    }

    if (!analyticsData) {
      return NextResponse.json({ error: "No analytics data found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
      period: {
        startDate: start?.toISOString(),
        endDate: end?.toISOString()
      }
    });

  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
