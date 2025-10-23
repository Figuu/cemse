import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get all unique skills from job offers
    const jobOffers = await prisma.jobOffer.findMany({
      select: {
        skillsRequired: true,
      },
      where: {
        isActive: true, // Only active job offers
      },
    });

    // Extract and flatten all skills
    const allSkills = jobOffers
      .flatMap(job => job.skillsRequired || [])
      .filter(skill => skill && skill.trim() !== '') // Remove empty/null skills
      .map(skill => skill.trim()); // Trim whitespace

    // Get unique skills and sort them alphabetically
    const uniqueSkills = Array.from(new Set(allSkills)).sort();

    return NextResponse.json({
      success: true,
      skills: uniqueSkills,
    });

  } catch (error) {
    console.error("Error fetching job skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch job skills" },
      { status: 500 }
    );
  }
}
