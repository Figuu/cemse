import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin
    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        institution: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin
    if (session.user.role !== "SUPERADMIN") {
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
      isActive
    } = body;

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: params.id }
    });

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Check if name is being changed and if it's already taken
    if (name && name !== existingCompany.name) {
      const nameExists = await prisma.company.findFirst({
        where: {
          name,
          institutionId: institutionId || existingCompany.institutionId || null,
          NOT: { id: params.id }
        }
      });

      if (nameExists) {
        return NextResponse.json(
          { error: "Company with this name already exists in this institution" },
          { status: 400 }
        );
      }
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingCompany.email) {
      const emailExists = await prisma.company.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Update company
    const company = await prisma.company.update({
      where: { id: params.id },
      data: {
        name: name || existingCompany.name,
        description: description || existingCompany.description,
        taxId: taxId || existingCompany.taxId,
        legalRepresentative: legalRepresentative || existingCompany.legalRepresentative,
        businessSector: businessSector || existingCompany.businessSector,
        companySize: companySize || existingCompany.companySize,
        website: website || existingCompany.website,
        email: email || existingCompany.email,
        phone: phone || existingCompany.phone,
        address: address || existingCompany.address,
        foundedYear: foundedYear ? parseInt(foundedYear) : existingCompany.foundedYear,
        institutionId: institutionId !== undefined ? institutionId : existingCompany.institutionId,
        isActive: isActive !== undefined ? isActive : existingCompany.isActive
      }
    });

    return NextResponse.json({
      message: "Company updated successfully",
      company: {
        id: company.id,
        name: company.name,
        description: company.description,
        taxId: company.taxId,
        legalRepresentative: company.legalRepresentative,
        businessSector: company.businessSector,
        companySize: company.companySize,
        website: company.website,
        email: company.email,
        phone: company.phone,
        address: company.address,
        foundedYear: company.foundedYear,
        logoUrl: company.logoUrl,
        isActive: company.isActive,
        institutionId: company.institutionId,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin
    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: params.id }
    });

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Delete company (related data will be handled by cascade rules)
    await prisma.company.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: "Company deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

