import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { apiRateLimiter } from "@/lib/rate-limiter";
import { InputValidator } from "@/lib/input-validator";
import { PasswordValidator } from "@/lib/password-validator";
import { securityLogger } from "@/lib/security-logger";

export async function GET(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  try {
    // Rate limiting
    const rateLimitResult = apiRateLimiter.attempt(clientIP, 'admin-users-get');
    if (!rateLimitResult.allowed) {
      securityLogger.logRateLimitExceeded(clientIP, 'admin-users-get', clientIP);
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { 'Retry-After': rateLimitResult.retryAfter?.toString() || '300' } }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      securityLogger.logUnauthorizedAccess('/api/admin/users', undefined, clientIP);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin or institution
    if (session.user.role !== "SUPERADMIN" && session.user.role !== "INSTITUTION") {
      securityLogger.logUnauthorizedAccess('/api/admin/users', session.user.id, clientIP, {
        userRole: session.user.role,
        requiredRoles: ['SUPERADMIN', 'INSTITUTION']
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    // Validar parámetro de rol si está presente
    if (role) {
      const validRoles = ['YOUTH', 'COMPANIES', 'INSTITUTION', 'SUPERADMIN'];
      if (!validRoles.includes(role)) {
        securityLogger.logSuspiciousActivity(
          `Invalid role parameter: ${role}`,
          session.user.id,
          clientIP
        );
        return NextResponse.json({ error: "Invalid role parameter" }, { status: 400 });
      }
    }

    // Build where clause
    const where: any = {};
    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        profile: {
          include: {
            institution: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform users to include profile data in the main object
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile
    }));

    securityLogger.log(
      'SENSITIVE_DATA_ACCESS',
      'low',
      `User list accessed by ${session.user.id}`,
      { recordCount: transformedUsers.length, roleFilter: role },
      { userId: session.user.id, ipAddress: clientIP, endpoint: '/api/admin/users' }
    );

    return NextResponse.json(transformedUsers);
  } catch (error) {
    securityLogger.log(
      'SECURITY_POLICY_VIOLATION',
      'high',
      'Error fetching users from admin endpoint',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { userId: undefined, ipAddress: clientIP, endpoint: '/api/admin/users' }
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  try {
    // Rate limiting más estricto para creación de usuarios
    const rateLimitResult = apiRateLimiter.attempt(clientIP, 'admin-users-post');
    if (!rateLimitResult.allowed) {
      securityLogger.logRateLimitExceeded(clientIP, 'admin-users-post', clientIP);
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { 'Retry-After': rateLimitResult.retryAfter?.toString() || '300' } }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      securityLogger.logUnauthorizedAccess('/api/admin/users', undefined, clientIP);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin or institution
    if (session.user.role !== "SUPERADMIN" && session.user.role !== "INSTITUTION") {
      securityLogger.logUnauthorizedAccess('/api/admin/users', session.user.id, clientIP, {
        userRole: session.user.role,
        requiredRoles: ['SUPERADMIN', 'INSTITUTION'],
        action: 'CREATE_USER'
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validar y sanitizar datos de entrada
    const validationResult = InputValidator.validateUserData(body);
    if (!validationResult.isValid) {
      securityLogger.log(
        'SECURITY_POLICY_VIOLATION',
        'medium',
        'Invalid user data in user creation request',
        { validationErrors: validationResult.errors },
        { userId: session.user.id, ipAddress: clientIP, endpoint: '/api/admin/users' }
      );

      return NextResponse.json(
        { error: "Validation failed", details: validationResult.errors },
        { status: 400 }
      );
    }

    const sanitizedData = validationResult.sanitizedData;

    // Validar contraseña con criterios robustos
    const passwordValidation = PasswordValidator.validate(sanitizedData.password);
    if (!passwordValidation.isValid) {
      securityLogger.log(
        'SECURITY_POLICY_VIOLATION',
        'medium',
        'Weak password in user creation request',
        { passwordErrors: passwordValidation.errors, strength: passwordValidation.strength },
        { userId: session.user.id, ipAddress: clientIP }
      );

      return NextResponse.json(
        { error: "Password validation failed", details: passwordValidation.errors },
        { status: 400 }
      );
    }

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      municipalityId,
      birthDate,
      gender,
      educationLevel,
      role = 'YOUTH'
    } = sanitizedData;

    // Validar rol asignado
    const validRoles = ['YOUTH', 'COMPANIES', 'INSTITUTION'];
    if (session.user.role === 'INSTITUTION' && role !== 'YOUTH') {
      securityLogger.logPrivilegeEscalation(
        session.user.id,
        role,
        session.user.role,
        clientIP
      );
      return NextResponse.json(
        { error: "Insufficient privileges to assign this role" },
        { status: 403 }
      );
    }

    if (!validRoles.includes(role) && session.user.role !== 'SUPERADMIN') {
      securityLogger.logPrivilegeEscalation(
        session.user.id,
        role,
        session.user.role,
        clientIP
      );
      return NextResponse.json(
        { error: "Invalid role assignment" },
        { status: 403 }
      );
    }

    // Check if user already exists
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

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: role as any,
          isActive: true
        }
      });

      // Create profile
      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          phone,
          address,
          institutionId: municipalityId,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          gender,
          educationLevel: educationLevel as any,
          profileCompletion: 20 // Basic info provided
        }
      });

      return { user, profile };
    });

    securityLogger.log(
      'DATA_MODIFICATION',
      'medium',
      `New user created by ${session.user.id}`,
      {
        newUserId: result.user.id,
        newUserEmail: result.user.email,
        newUserRole: result.user.role,
        createdBy: session.user.id
      },
      { userId: session.user.id, ipAddress: clientIP, endpoint: '/api/admin/users' }
    );

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        isActive: result.user.isActive,
        createdAt: result.user.createdAt,
        profile: result.profile
      }
    });
  } catch (error) {
    securityLogger.log(
      'SECURITY_POLICY_VIOLATION',
      'high',
      'Error creating user in admin endpoint',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { userId: undefined, ipAddress: clientIP, endpoint: '/api/admin/users' }
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

