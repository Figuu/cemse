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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const trendingStartups = await StartupDiscoveryService.getTrendingStartups(limit);

    return NextResponse.json({
      success: true,
      startups: trendingStartups,
      limit,
    });

  } catch (error) {
    console.error("Error fetching trending startups:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending startups" },
      { status: 500 }
    );
  }
}
