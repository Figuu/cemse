import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check - just return status
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'emplea-y-emprende'
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Service unavailable',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}