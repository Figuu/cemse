import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types';
import { loginRateLimiter } from './rate-limiter';
import { securityLogger } from './security-logger';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        console.log('🔍 Auth attempt:', { email: credentials?.email, hasPassword: !!credentials?.password });
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        try {
          // Rate limiting para intentos de login
          const clientIP = req.headers?.['x-forwarded-for'] as string ||
                          req.headers?.['x-real-ip'] as string ||
                          'unknown';

          console.log('🔍 Rate limiting check for:', credentials.email);
          const rateLimitResult = loginRateLimiter.attempt(credentials.email, 'login');

          if (!rateLimitResult.allowed) {
            console.log('❌ Rate limit exceeded for:', credentials.email);
            securityLogger.logRateLimitExceeded(credentials.email, 'login', clientIP);

            if (rateLimitResult.blocked) {
              securityLogger.log(
                'AUTH_ACCOUNT_LOCKED',
                'high',
                `Account temporarily locked due to excessive login attempts: ${credentials.email}`,
                { email: credentials.email, retryAfter: rateLimitResult.retryAfter },
                { ipAddress: clientIP }
              );
            }

            return null;
          }

          console.log('🔍 Looking for user:', credentials.email);
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            include: {
              profile: {
                include: {
                  institution: true,
                },
              },
            },
          });

          console.log('🔍 User found:', { 
            exists: !!user, 
            isActive: user?.isActive, 
            hasProfile: !!user?.profile 
          });

          if (!user || !user.isActive) {
            console.log('❌ User not found or inactive:', { 
              userExists: !!user, 
              isActive: user?.isActive 
            });
            securityLogger.logLoginAttempt(
              credentials.email,
              false,
              clientIP,
              { reason: !user ? 'user_not_found' : 'user_inactive' }
            );
            return null;
          }

          console.log('🔍 Checking password...');
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('🔍 Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ Invalid password for:', credentials.email);
            securityLogger.logLoginAttempt(
              user.id,
              false,
              clientIP,
              { reason: 'invalid_password', email: credentials.email }
            );
            return null;
          }

          // Reset rate limit on successful login
          loginRateLimiter.reset(credentials.email, 'login');

          securityLogger.logLoginAttempt(
            user.id,
            true,
            clientIP,
            { email: credentials.email, role: user.role }
          );

          console.log('✅ Login successful for:', credentials.email);

          return {
            id: user.id,
            email: user.email,
            name: user.profile?.firstName && user.profile?.lastName 
              ? `${user.profile.firstName} ${user.profile.lastName}`.trim()
              : user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}`.trim()
              : user.email,
            role: user.role,
            profile: user.profile,
            institutionType: user.profile?.institution?.institutionType,
          };
        } catch (error) {
          console.error('❌ Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.profile = token.profile;
        session.user.institutionType = token.institutionType;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.profile = user.profile;
        token.institutionType = user.institutionType;
      }
      return token;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
};
