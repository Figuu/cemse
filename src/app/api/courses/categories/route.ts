import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get course categories with counts
    const categories = await prisma.course.groupBy({
      by: ["category"],
      where: {
        isActive: true,
      },
      _count: {
        category: true,
      },
      orderBy: {
        category: "asc",
      },
    });

    // Get all available levels
    const levels = await prisma.course.groupBy({
      by: ["level"],
      where: {
        isActive: true,
      },
      _count: {
        level: true,
      },
      orderBy: {
        level: "asc",
      },
    });

    // Transform categories
    const transformedCategories = categories.map(category => ({
      value: category.category,
      label: getCategoryLabel(category.category),
      count: category._count.category,
    }));

    // Transform levels
    const transformedLevels = levels.map(level => ({
      value: level.level,
      label: getLevelLabel(level.level),
      count: level._count.level,
    }));

    return NextResponse.json({
      success: true,
      categories: transformedCategories,
      levels: transformedLevels,
    });

  } catch (error) {
    console.error("Error fetching course categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch course categories" },
      { status: 500 }
    );
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case "SOFT_SKILLS":
      return "Habilidades Blandas";
    case "BASIC_COMPETENCIES":
      return "Competencias Básicas";
    case "JOB_PLACEMENT":
      return "Colocación Laboral";
    case "ENTREPRENEURSHIP":
      return "Emprendimiento";
    case "TECHNICAL_SKILLS":
      return "Habilidades Técnicas";
    case "DIGITAL_LITERACY":
      return "Alfabetización Digital";
    case "COMMUNICATION":
      return "Comunicación";
    case "LEADERSHIP":
      return "Liderazgo";
    // Mantener compatibilidad con categorías antiguas
    case "TECHNOLOGY":
      return "Tecnología";
    case "BUSINESS":
      return "Negocios";
    case "DESIGN":
      return "Diseño";
    case "MARKETING":
      return "Marketing";
    case "LANGUAGES":
      return "Idiomas";
    case "HEALTH":
      return "Salud";
    case "EDUCATION":
      return "Educación";
    case "ARTS":
      return "Artes";
    case "SCIENCE":
      return "Ciencia";
    case "ENGINEERING":
      return "Ingeniería";
    case "OTHER":
      return "Otros";
    default:
      return category;
  }
}

function getLevelLabel(level: string): string {
  switch (level) {
    case "BEGINNER":
      return "Principiante";
    case "INTERMEDIATE":
      return "Intermedio";
    case "ADVANCED":
      return "Avanzado";
    case "EXPERT":
      return "Experto";
    default:
      return level;
  }
}
