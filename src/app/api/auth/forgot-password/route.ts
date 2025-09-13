import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: "Si el correo existe, se enviará un enlace de recuperación",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: resetToken,
        refreshTokenExpires: resetTokenExpires,
      },
    });

    // In a real application, you would send an email here
    // For now, we'll just return success
    console.log(`Reset token for ${user.email}: ${resetToken}`);
    console.log(`Reset URL: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`);

    return NextResponse.json({
      success: true,
      message: "Si el correo existe, se enviará un enlace de recuperación",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
