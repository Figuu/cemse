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
    const query = searchParams.get("q");
    const type = searchParams.get("type");
    const location = searchParams.get("location");
    const category = searchParams.get("category");
    const skills = searchParams.get("skills");
    const experience = searchParams.get("experience");
    const salaryMin = searchParams.get("salaryMin");
    const salaryMax = searchParams.get("salaryMax");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        results: [],
        total: 0,
        message: "Query must be at least 2 characters long"
      });
    }

    const filters = {
      type: type ? type.split(',') : undefined,
      location: location || undefined,
      category: category || undefined,
      skills: skills ? skills.split(',') : undefined,
      experience: experience || undefined,
      salary: salaryMin && salaryMax ? {
        min: parseInt(salaryMin),
        max: parseInt(salaryMax)
      } : undefined
    };

    const results = await SearchService.globalSearch(query, filters, limit, offset);

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
      query,
      filters
    });

  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
