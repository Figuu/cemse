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

    const companies = await prisma.company.findMany({
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            department: true,
            region: true,
            institutionType: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
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
      description,
      taxId,
      legalRepresentative,
      businessSector,
      companySize,
      website,
      email,
      phone,
      address,
      foundedYear,
      institutionId,
      password
    } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Company name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if company already exists (by name and institution)
    const existingCompany = await prisma.company.findFirst({
      where: {
        name,
        institutionId: institutionId || null
      }
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: "Company with this name already exists in this institution" },
        { status: 400 }
      );
    }

    // Check if email already exists in User table
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create company, user, and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // First create the User record for authentication
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'COMPANIES',
          isActive: true,
          firstName: legalRepresentative || name.split(' ')[0],
          lastName: legalRepresentative ? '' : name.split(' ').slice(1).join(' ')
        }
      });

      // Then create the Company record
      const company = await tx.company.create({
        data: {
          name,
          description,
          taxId,
          legalRepresentative,
          businessSector,
          companySize: companySize as any,
          website,
          email,
          phone,
          address,
          foundedYear: foundedYear ? parseInt(foundedYear) : undefined,
          institutionId: institutionId || undefined,
          password: hashedPassword,
          isActive: true,
          ownerId: user.id,
          createdBy: session.user.id
        }
      });

      // Create a Profile record for the company user
      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          firstName: legalRepresentative || name.split(' ')[0],
          lastName: legalRepresentative ? '' : name.split(' ').slice(1).join(' '),
          phone,
          address,
          profileCompletion: 60 // Company profile is partially complete
        }
      });

      return { user, company, profile };
    });

    return NextResponse.json({
      message: "Company created successfully",
      company: {
        id: result.company.id,
        name: result.company.name,
        description: result.company.description,
        taxId: result.company.taxId,
        legalRepresentative: result.company.legalRepresentative,
        businessSector: result.company.businessSector,
        companySize: result.company.companySize,
        website: result.company.website,
        email: result.company.email,
        phone: result.company.phone,
        address: result.company.address,
        foundedYear: result.company.foundedYear,
        logoUrl: result.company.logoUrl,
        isActive: result.company.isActive,
        institutionId: result.company.institutionId,
        createdAt: result.company.createdAt,
        updatedAt: result.company.updatedAt
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
        profileCompletion: result.profile.profileCompletion
      }
    });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
