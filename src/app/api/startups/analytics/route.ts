import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StartupDiscoveryService } from "@/lib/startupDiscoveryService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analytics = await StartupDiscoveryService.getDiscoveryAnalytics();

    return NextResponse.json({
      success: true,
      analytics,
    });

  } catch (error) {
    console.error("Error fetching discovery analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch discovery analytics" },
      { status: 500 }
    );
  }
}
