import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin or institution
    if (session.user.role !== "SUPERADMIN" && session.user.role !== "INSTITUTION") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build where clause based on user type
    let whereClause: any = {};

    // If user is INSTITUTION with MUNICIPALITY type, they can only see non-municipality institutions
    if (session.user.role === "INSTITUTION" && session.user.institutionType === "MUNICIPALITY") {
      whereClause.institutionType = {
        not: "MUNICIPALITY"
      };
    }

    const institutions = await prisma.institution.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin or institution
    if (session.user.role !== "SUPERADMIN" && session.user.role !== "INSTITUTION") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      email,
      password,
      phone,
      address,
      website,
      department,
      region,
      population,
      mayorName,
      mayorEmail,
      mayorPhone,
      institutionType,
      customType,
      primaryColor,
      secondaryColor
    } = body;

    // Validate required fields
    if (!name || !email || !password || !department || !institutionType) {
      return NextResponse.json(
        { error: "Name, email, password, department, and institution type are required" },
        { status: 400 }
      );
    }

    // If user is INSTITUTION with MUNICIPALITY type, they cannot create other municipalities
    if (session.user.role === "INSTITUTION" && session.user.institutionType === "MUNICIPALITY" && institutionType === "MUNICIPALITY") {
      return NextResponse.json(
        { error: "Municipality users cannot create other municipalities" },
        { status: 403 }
      );
    }

    // Check if institution already exists
    const existingInstitution = await prisma.institution.findUnique({
      where: { email }
    });

    if (existingInstitution) {
      return NextResponse.json(
        { error: "Institution with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create institution, user, and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // First create the User record for authentication
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'INSTITUTION',
          isActive: true,
          firstName: mayorName || name.split(' ')[0],
          lastName: mayorName ? '' : name.split(' ').slice(1).join(' ')
        }
      });

      // Then create the Institution record
      const institution = await tx.institution.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          address,
          website,
          department,
          region,
          population: population ? parseInt(population) : undefined,
          mayorName,
          mayorEmail,
          mayorPhone,
          institutionType: institutionType as any,
          customType,
          primaryColor,
          secondaryColor,
          isActive: true,
          createdBy: session.user.id
        }
      });

      // Create a Profile record linking the user to the institution
      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          firstName: mayorName || name.split(' ')[0],
          lastName: mayorName ? '' : name.split(' ').slice(1).join(' '),
          phone,
          address,
          city: department,
          state: region,
          institutionId: institution.id,
          profileCompletion: 80 // Institution profile is mostly complete
        }
      });

      return { user, institution, profile };
    });

    return NextResponse.json({
      message: "Institution created successfully",
      institution: {
        id: result.institution.id,
        name: result.institution.name,
        email: result.institution.email,
        phone: result.institution.phone,
        address: result.institution.address,
        website: result.institution.website,
        department: result.institution.department,
        region: result.institution.region,
        population: result.institution.population,
        mayorName: result.institution.mayorName,
        mayorEmail: result.institution.mayorEmail,
        mayorPhone: result.institution.mayorPhone,
        institutionType: result.institution.institutionType,
        customType: result.institution.customType,
        primaryColor: result.institution.primaryColor,
        secondaryColor: result.institution.secondaryColor,
        isActive: result.institution.isActive,
        createdAt: result.institution.createdAt,
        updatedAt: result.institution.updatedAt
      },
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        isActive: result.user.isActive
      },
      profile: {
        id: result.profile.id,
        userId: result.profile.userId,
        institutionId: result.profile.institutionId,
        profileCompletion: result.profile.profileCompletion
      }
    });
  } catch (error) {
    console.error('Error creating institution:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
