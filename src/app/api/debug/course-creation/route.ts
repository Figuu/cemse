import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log("=== DEBUG: Course Creation Test ===");
    
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));
    
    // Test data
    const testData = {
      title: "Debug Test Course",
      slug: "debug-test-course",
      description: "This is a test course for debugging",
      shortDescription: "Test course",
      objectives: ["Learn debugging"],
      prerequisites: [],
      duration: 60,
      level: "BEGINNER" as const,
      category: "SOFT_SKILLS" as const,
      isMandatory: false,
      tags: ["debug", "test"],
      certification: true,
      includedMaterials: [],
      institutionName: "Debug Institution",
      publishedAt: new Date(),
    };
    
    console.log("Test data prepared:", JSON.stringify(testData, null, 2));
    
    // Test database connection
    console.log("Testing database connection...");
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
    
    // Test course creation
    console.log("Creating test course...");
    const course = await prisma.course.create({
      data: testData,
    });
    
    console.log("Course created successfully:", course);
    
    // Clean up - delete the test course
    await prisma.course.delete({
      where: { id: course.id }
    });
    
    console.log("Test course deleted");
    
    return NextResponse.json({
      success: true,
      message: "Course creation test passed",
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
      }
    });
    
  } catch (error) {
    console.error("=== DEBUG: Course Creation Error ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    console.error("Full error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Course creation test failed",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
