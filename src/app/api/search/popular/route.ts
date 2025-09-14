import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SearchService } from "@/lib/searchService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const popularSearches = await SearchService.getPopularSearches(limit);

    return NextResponse.json({
      success: true,
      searches: popularSearches
    });

  } catch (error) {
    console.error("Popular searches error:", error);
    return NextResponse.json(
      { error: "Failed to get popular searches" },
      { status: 500 }
    );
  }
}
