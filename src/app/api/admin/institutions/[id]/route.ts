import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin or institution
    if (session.user.role !== "SUPERADMIN" && session.user.role !== "INSTITUTION") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const institution = await prisma.institution.findUnique({
      where: { id }
    });

    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    // If user is INSTITUTION with MUNICIPALITY type, they cannot access other municipalities
    if (session.user.role === "INSTITUTION" && session.user.institutionType === "MUNICIPALITY" && institution.institutionType === "MUNICIPALITY") {
      return NextResponse.json({ error: "Municipality users cannot access other municipalities" }, { status: 403 });
    }

    return NextResponse.json(institution);
  } catch (error) {
    console.error('Error fetching institution:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin or institution
    if (session.user.role !== "SUPERADMIN" && session.user.role !== "INSTITUTION") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      email,
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
      secondaryColor,
      isActive
    } = body;

    // Check if institution exists
    const existingInstitution = await prisma.institution.findUnique({
      where: { id }
    });

    if (!existingInstitution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    // If user is INSTITUTION with MUNICIPALITY type, they cannot edit other municipalities
    if (session.user.role === "INSTITUTION" && session.user.institutionType === "MUNICIPALITY" && existingInstitution.institutionType === "MUNICIPALITY") {
      return NextResponse.json({ error: "Municipality users cannot edit other municipalities" }, { status: 403 });
    }

    // If user is INSTITUTION with MUNICIPALITY type, they cannot change institution type to MUNICIPALITY
    if (session.user.role === "INSTITUTION" && session.user.institutionType === "MUNICIPALITY" && institutionType === "MUNICIPALITY" && institutionType !== existingInstitution.institutionType) {
      return NextResponse.json({ error: "Municipality users cannot change institution type to municipality" }, { status: 403 });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingInstitution.email) {
      const emailExists = await prisma.institution.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Update institution
    const institution = await prisma.institution.update({
      where: { id },
      data: {
        name: name || existingInstitution.name,
        email: email || existingInstitution.email,
        phone: phone || existingInstitution.phone,
        address: address || existingInstitution.address,
        website: website || existingInstitution.website,
        department: department || existingInstitution.department,
        region: region || existingInstitution.region,
        population: population ? parseInt(population) : existingInstitution.population,
        mayorName: mayorName || existingInstitution.mayorName,
        mayorEmail: mayorEmail || existingInstitution.mayorEmail,
        mayorPhone: mayorPhone || existingInstitution.mayorPhone,
        institutionType: institutionType || existingInstitution.institutionType,
        customType: customType || existingInstitution.customType,
        primaryColor: primaryColor || existingInstitution.primaryColor,
        secondaryColor: secondaryColor || existingInstitution.secondaryColor,
        isActive: isActive !== undefined ? isActive : existingInstitution.isActive
      }
    });

    return NextResponse.json({
      message: "Institution updated successfully",
      institution: {
        id: institution.id,
        name: institution.name,
        email: institution.email,
        phone: institution.phone,
        address: institution.address,
        website: institution.website,
        department: institution.department,
        region: institution.region,
        population: institution.population,
        mayorName: institution.mayorName,
        mayorEmail: institution.mayorEmail,
        mayorPhone: institution.mayorPhone,
        institutionType: institution.institutionType,
        customType: institution.customType,
        primaryColor: institution.primaryColor,
        secondaryColor: institution.secondaryColor,
        isActive: institution.isActive,
        createdAt: institution.createdAt,
        updatedAt: institution.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating institution:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin or institution
    if (session.user.role !== "SUPERADMIN" && session.user.role !== "INSTITUTION") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    
    // Check if institution exists and get related data
    const existingInstitution = await prisma.institution.findUnique({
      where: { id },
      include: {
        profiles: {
          include: {
            user: true
          }
        },
        companies: true,
        courses: true,
        creator: true
      }
    });

    if (!existingInstitution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    // If user is INSTITUTION with MUNICIPALITY type, they cannot delete other municipalities
    if (session.user.role === "INSTITUTION" && session.user.institutionType === "MUNICIPALITY" && existingInstitution.institutionType === "MUNICIPALITY") {
      return NextResponse.json({ error: "Municipality users cannot delete other municipalities" }, { status: 403 });
    }

    // Use transaction to ensure all related data is deleted properly
    await prisma.$transaction(async (tx) => {
      // Delete all users associated with this institution (this will cascade delete their profiles and related data)
      for (const profile of existingInstitution.profiles) {
        await tx.user.delete({
          where: { id: profile.user.id }
        });
      }

      // Delete all companies associated with this institution
      for (const company of existingInstitution.companies) {
        await tx.company.delete({
          where: { id: company.id }
        });
      }

      // Delete all courses associated with this institution
      for (const course of existingInstitution.courses) {
        await tx.course.delete({
          where: { id: course.id }
        });
      }

      // Finally, delete the institution itself
      await tx.institution.delete({
        where: { id }
      });

      // Log what was deleted for audit purposes
      console.log(`Deleted institution: ${existingInstitution.name} (${existingInstitution.institutionType})`);
      console.log(`Related data deleted: ${existingInstitution.profiles.length} users/profiles, ${existingInstitution.companies.length} companies, ${existingInstitution.courses.length} courses`);
    });

    return NextResponse.json({
      message: "Institution and all related data deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting institution:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

