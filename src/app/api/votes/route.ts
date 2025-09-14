import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";

// TODO: Vote model needs to be added to Prisma schema
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Vote functionality not implemented - model missing from schema" },
    { status: 501 }
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: "Vote functionality not implemented - model missing from schema" },
    { status: 501 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: "Vote functionality not implemented - model missing from schema" },
    { status: 501 }
  );
}