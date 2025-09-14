import { NextResponse } from 'next/server';

// Initialize MinIO
async function initializeMinIO() {
  try {
    console.log('🔧 Initializing MinIO...');
    const { initializeMinIO } = await import('@/lib/initMinIO');
    await initializeMinIO();
    console.log('✅ MinIO initialized successfully');
    return true;
  } catch (error) {
    console.warn('⚠️ MinIO initialization failed (this is OK if MinIO is not running):', error);
    return false;
  }
}

export async function GET() {
  try {
    const success = await initializeMinIO();
    
    return NextResponse.json({
      success,
      message: success 
        ? 'MinIO initialized successfully' 
        : 'MinIO initialization failed (this is OK if MinIO is not running)'
    });
  } catch (error) {
    console.error('Initialization error:', error);
    return NextResponse.json(
      { success: false, message: 'Initialization failed' },
      { status: 500 }
    );
  }
}
