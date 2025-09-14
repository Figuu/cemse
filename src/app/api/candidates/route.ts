import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const searchCandidatesSchema = z.object({
  search: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experienceLevel: z.enum(["ENTRY_LEVEL", "MID_LEVEL", "SENIOR_LEVEL", "EXECUTIVE", "INTERN"]).optional(),
  location: z.string().optional(),
  availability: z.enum(["IMMEDIATE", "WITHIN_MONTH", "WITHIN_QUARTER", "FLEXIBLE"]).optional(),
  education: z.string().optional(),
  languages: z.array(z.string()).optional(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  currency: z.string().default("USD"),
  workArrangement: z.enum(["OFFICE", "REMOTE", "HYBRID"]).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(["relevance", "experience", "location", "availability", "createdAt"]).default("relevance"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      search: searchParams.get("search") || undefined,
      skills: searchParams.get("skills")?.split(",").filter(Boolean) || undefined,
      experienceLevel: searchParams.get("experienceLevel") as "ENTRY" | "JUNIOR" | "MID" | "SENIOR" | "LEAD" | undefined || undefined,
      location: searchParams.get("location") || undefined,
      availability: searchParams.get("availability") as "IMMEDIATE" | "WITHIN_MONTH" | "FLEXIBLE" | undefined || undefined,
      education: searchParams.get("education") || undefined,
      languages: searchParams.get("languages")?.split(",").filter(Boolean) || undefined,
      salaryMin: searchParams.get("salaryMin") ? parseFloat(searchParams.get("salaryMin")!) : undefined,
      salaryMax: searchParams.get("salaryMax") ? parseFloat(searchParams.get("salaryMax")!) : undefined,
      currency: searchParams.get("currency") || "USD",
      workArrangement: searchParams.get("workArrangement") as "REMOTE" | "HYBRID" | "ONSITE" | undefined || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      sortBy: (searchParams.get("sortBy") as "relevance" | "experience" | "education" | "skills" | undefined) || "relevance",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc" | undefined) || "desc",
    };

    const validatedParams = searchCandidatesSchema.parse(params);
    const skip = (validatedParams.page - 1) * validatedParams.limit;

    // Build the where clause for candidate search
    const where: Record<string, unknown> = {
      role: "YOUTH", // Only search for youth users
      isActive: true,
    };

    // Search in profile information
    if (validatedParams.search) {
      where.OR = [
        { profile: { firstName: { contains: validatedParams.search, mode: "insensitive" } } },
        { profile: { lastName: { contains: validatedParams.search, mode: "insensitive" } } },
        { email: { contains: validatedParams.search, mode: "insensitive" } },
      ];
    }

    // Location filter
    if (validatedParams.location) {
      where.profile = {
        ...(where.profile || {}),
        address: { contains: validatedParams.location, mode: "insensitive" },
      };
    }

    // Education filter
    if (validatedParams.education) {
      where.profile = {
        ...(where.profile || {}),
        // This would need to be added to the Profile model in a real implementation
        // education: { contains: validatedParams.education, mode: "insensitive" },
      };
    }

    // Build order by clause
    const orderBy: Record<string, string> = {};
    switch (validatedParams.sortBy) {
      case "experience":
        // This would need experience data in the Profile model
        orderBy.createdAt = validatedParams.sortOrder;
        break;
      case "location":
        // Note: Complex ordering by nested fields not directly supported
        orderBy.createdAt = validatedParams.sortOrder;
        break;
      case "availability":
        // This would need availability data in the Profile model
        orderBy.createdAt = validatedParams.sortOrder;
        break;
      case "createdAt":
        orderBy.createdAt = validatedParams.sortOrder;
        break;
      case "relevance":
      default:
        // For relevance, we'll order by creation date for now
        // In a real implementation, this would use a more sophisticated scoring algorithm
        orderBy.createdAt = validatedParams.sortOrder;
        break;
    }

    const [candidates, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: validatedParams.limit,
        include: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
              phone: true,
              address: true,
              birthDate: true,
              gender: true,
            },
          },
          _count: {
            select: {
              createdCompanies: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Filter candidates by additional criteria that require more complex queries
    const filteredCandidates = candidates;

    // Skills filter (would need a skills field in Profile model)
    if (validatedParams.skills && validatedParams.skills.length > 0) {
      // This would require a skills field in the Profile model
      // For now, we'll just return all candidates
    }

    // Languages filter (would need a languages field in Profile model)
    if (validatedParams.languages && validatedParams.languages.length > 0) {
      // This would require a languages field in the Profile model
      // For now, we'll just return all candidates
    }

    // Salary expectations filter (would need salary expectations in Profile model)
    if (validatedParams.salaryMin || validatedParams.salaryMax) {
      // This would require salary expectation fields in the Profile model
      // For now, we'll just return all candidates
    }

    // Work arrangement preferences filter (would need work arrangement preferences in Profile model)
    if (validatedParams.workArrangement) {
      // This would require work arrangement preference fields in the Profile model
      // For now, we'll just return all candidates
    }

    // Availability filter (would need availability status in Profile model)
    if (validatedParams.availability) {
      // This would require availability status fields in the Profile model
      // For now, we'll just return all candidates
    }

    const totalPages = Math.ceil(total / validatedParams.limit);

    return NextResponse.json({
      candidates: filteredCandidates,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages,
        hasNext: validatedParams.page < totalPages,
        hasPrev: validatedParams.page > 1,
      },
      filters: {
        search: validatedParams.search,
        skills: validatedParams.skills,
        experienceLevel: validatedParams.experienceLevel,
        location: validatedParams.location,
        availability: validatedParams.availability,
        education: validatedParams.education,
        languages: validatedParams.languages,
        salaryMin: validatedParams.salaryMin,
        salaryMax: validatedParams.salaryMax,
        currency: validatedParams.currency,
        workArrangement: validatedParams.workArrangement,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error searching candidates:", error);
    return NextResponse.json(
      { error: "Failed to search candidates" },
      { status: 500 }
    );
  }
}
