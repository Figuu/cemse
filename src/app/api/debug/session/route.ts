import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("=== DEBUG: Session Check ===");
    
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: "No session found",
        session: null
      });
    }
    
    if (!session.user) {
      return NextResponse.json({
        success: false,
        message: "No user in session",
        session: session
      });
    }
    
    if (!session.user.id) {
      return NextResponse.json({
        success: false,
        message: "No user ID in session",
        session: session
      });
    }
    
    return NextResponse.json({
      success: true,
      message: "Session is valid",
      session: {
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          name: session.user.name
        }
      }
    });
    
  } catch (error) {
    console.error("=== DEBUG: Session Error ===");
    console.error("Error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Session check failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
