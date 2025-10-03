import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
  role: z.enum(["YOUTH", "COMPANIES", "INSTITUTION"]),
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  phone: z.string().optional(),
  // Company fields
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  businessSector: z.string().optional(),
  companySize: z.enum(["MICRO", "SMALL", "MEDIUM", "LARGE"]).optional().nullable(),
  // Institution fields
  institutionName: z.string().optional(),
  institutionType: z.string().optional(), // Changed to string to avoid enum validation when empty
  department: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "El correo electrónico ya está registrado" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Handle YOUTH registration (as before)
    if (validatedData.role === "YOUTH") {
      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          role: validatedData.role,
          profile: {
            create: {
              firstName: validatedData.firstName,
              lastName: validatedData.lastName,
              phone: validatedData.phone,
              profileCompletion: 20,
            },
          },
        },
        include: {
          profile: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Usuario creado exitosamente",
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    }

    // Handle COMPANY registration - create user and company with PENDING status
    if (validatedData.role === "COMPANIES") {
      if (!validatedData.companyName) {
        return NextResponse.json(
          { success: false, error: "El nombre de la empresa es requerido" },
          { status: 400 }
        );
      }

      // Create user first
      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          role: validatedData.role,
          profile: {
            create: {
              firstName: validatedData.firstName,
              lastName: validatedData.lastName,
              phone: validatedData.phone,
              profileCompletion: 20,
            },
          },
        },
      });

      // Create company with PENDING approval status
      await prisma.company.create({
        data: {
          name: validatedData.companyName,
          email: validatedData.email,
          password: hashedPassword,
          taxId: validatedData.taxId,
          businessSector: validatedData.businessSector,
          companySize: validatedData.companySize,
          legalRepresentative: `${validatedData.firstName} ${validatedData.lastName}`,
          approvalStatus: "PENDING",
          createdBy: user.id,
          isActive: false, // Inactive until approved
        },
      });

      return NextResponse.json({
        success: true,
        message: "Registro de empresa enviado. Un administrador revisará tu solicitud.",
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: "pending_approval",
        },
      });
    }

    // Handle INSTITUTION registration - create user and institution with PENDING status
    if (validatedData.role === "INSTITUTION") {
      if (!validatedData.institutionName || !validatedData.institutionType || !validatedData.department) {
        return NextResponse.json(
          { success: false, error: "Nombre de institución, tipo y departamento son requeridos" },
          { status: 400 }
        );
      }

      // Prevent users from registering as MUNICIPALITY
      if (validatedData.institutionType === "MUNICIPALITY") {
        return NextResponse.json(
          { success: false, error: "No puedes registrarte como municipalidad. Solo los administradores pueden crear municipalidades." },
          { status: 400 }
        );
      }

      // Validate institution type
      const validTypes = ["NGO", "TRAINING_CENTER", "FOUNDATION", "OTHER"];
      if (!validTypes.includes(validatedData.institutionType)) {
        return NextResponse.json(
          { success: false, error: "Tipo de institución inválido" },
          { status: 400 }
        );
      }

      // Create user first
      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          role: validatedData.role,
          profile: {
            create: {
              firstName: validatedData.firstName,
              lastName: validatedData.lastName,
              phone: validatedData.phone,
              profileCompletion: 20,
            },
          },
        },
      });

      // Create institution with PENDING approval status
      await prisma.institution.create({
        data: {
          name: validatedData.institutionName,
          email: validatedData.email,
          password: hashedPassword,
          institutionType: validatedData.institutionType as "NGO" | "TRAINING_CENTER" | "FOUNDATION" | "OTHER",
          department: validatedData.department,
          mayorName: `${validatedData.firstName} ${validatedData.lastName}`,
          phone: validatedData.phone,
          approvalStatus: "PENDING",
          createdBy: user.id,
          isActive: false, // Inactive until approved
        },
      });

      return NextResponse.json({
        success: true,
        message: "Registro de institución enviado. Un administrador revisará tu solicitud.",
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: "pending_approval",
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Tipo de rol inválido" },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
