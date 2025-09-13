import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Define protected routes and their required roles
    const protectedRoutes = {
      "/dashboard": ["YOUTH", "COMPANIES", "INSTITUTION", "SUPERADMIN"],
      "/profile": ["YOUTH", "COMPANIES", "INSTITUTION", "SUPERADMIN"],
      "/profiles": ["YOUTH", "COMPANIES", "INSTITUTION", "SUPERADMIN"],
      "/jobs": ["YOUTH", "COMPANIES", "INSTITUTION", "SUPERADMIN"],
      "/applications": ["YOUTH"],
      "/courses": ["YOUTH", "INSTITUTION", "SUPERADMIN"],
      "/entrepreneurship": ["YOUTH", "SUPERADMIN"],
      "/company": ["COMPANIES", "SUPERADMIN"],
      "/institution": ["INSTITUTION", "SUPERADMIN"],
      "/admin": ["SUPERADMIN"],
    };

    // Check if the current path requires authentication
    const route = Object.keys(protectedRoutes).find(route => 
      pathname.startsWith(route)
    );

    if (route) {
      const allowedRoles = protectedRoutes[route as keyof typeof protectedRoutes];
      
      if (!token) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }

      if (!allowedRoles.includes(token.role as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to public routes
        const publicRoutes = ["/", "/sign-in", "/sign-up", "/forgot-password", "/reset-password"];
        if (publicRoutes.includes(pathname)) {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/profiles/:path*",
    "/jobs/:path*",
    "/applications/:path*",
    "/courses/:path*",
    "/entrepreneurship/:path*",
    "/company/:path*",
    "/institution/:path*",
    "/admin/:path*",
  ],
};

