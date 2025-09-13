import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StartupDiscoveryService, DiscoveryFilters } from "@/lib/startupDiscoveryService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    const filters: DiscoveryFilters = {
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      subcategory: searchParams.get("subcategory") || undefined,
      businessStage: searchParams.get("businessStage") || undefined,
      municipality: searchParams.get("municipality") || undefined,
      department: searchParams.get("department") || undefined,
      minEmployees: searchParams.get("minEmployees") ? parseInt(searchParams.get("minEmployees")!) : undefined,
      maxEmployees: searchParams.get("maxEmployees") ? parseInt(searchParams.get("maxEmployees")!) : undefined,
      minRevenue: searchParams.get("minRevenue") ? parseInt(searchParams.get("minRevenue")!) : undefined,
      maxRevenue: searchParams.get("maxRevenue") ? parseInt(searchParams.get("maxRevenue")!) : undefined,
      foundedAfter: searchParams.get("foundedAfter") || undefined,
      foundedBefore: searchParams.get("foundedBefore") || undefined,
      hasWebsite: searchParams.get("hasWebsite") === "true",
      hasSocialMedia: searchParams.get("hasSocialMedia") === "true",
      isPublic: searchParams.get("isPublic") !== "false",
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0,
    };

    const result = await StartupDiscoveryService.discoverStartups(filters, session.user.id);

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error("Error discovering startups:", error);
    return NextResponse.json(
      { error: "Failed to discover startups" },
      { status: 500 }
    );
  }
}
