import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            institution: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile
    });
  } catch (error) {
    console.error('Error fetching user:', error);
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

    // Check if user is super admin
    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      phone,
      address,
      municipalityId,
      birthDate,
      gender,
      educationLevel,
      isActive
    } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Update user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user
      const user = await tx.user.update({
        where: { id },
        data: {
          email: email || existingUser.email,
          firstName: firstName || existingUser.firstName,
          lastName: lastName || existingUser.lastName,
          isActive: isActive !== undefined ? isActive : existingUser.isActive
        }
      });

      // Update or create profile
      let profile;
      if (existingUser.profile) {
        profile = await tx.profile.update({
          where: { userId: id },
          data: {
            firstName: firstName || existingUser.profile.firstName,
            lastName: lastName || existingUser.profile.lastName,
            phone: phone || existingUser.profile.phone,
            address: address || existingUser.profile.address,
            institutionId: municipalityId || existingUser.profile.institutionId,
            birthDate: birthDate ? new Date(birthDate) : existingUser.profile.birthDate,
            gender: gender || existingUser.profile.gender,
            educationLevel: educationLevel || existingUser.profile.educationLevel
          }
        });
      } else {
        profile = await tx.profile.create({
          data: {
            userId: id,
            firstName: firstName || existingUser.firstName,
            lastName: lastName || existingUser.lastName,
            phone,
            address,
            institutionId: municipalityId,
            birthDate: birthDate ? new Date(birthDate) : undefined,
            gender,
            educationLevel: educationLevel as any,
            profileCompletion: 20
          }
        });
      }

      return { user, profile };
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        isActive: result.user.isActive,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
        profile: result.profile
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
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

    // Check if user is super admin
    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting super admin users
    if (existingUser.role === "SUPERADMIN") {
      return NextResponse.json(
        { error: "Cannot delete super admin users" },
        { status: 400 }
      );
    }

    // Delete user (profile will be deleted automatically due to cascade)
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

