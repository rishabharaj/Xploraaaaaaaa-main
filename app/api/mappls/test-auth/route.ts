import { NextRequest, NextResponse } from 'next/server';
import { testMapplsAuth } from '@/lib/mappls-direct-api';

// GET /api/mappls/test-auth - Test Mappls OAuth authentication
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 API: Testing Mappls OAuth authentication...');
    
    const authResult = await testMapplsAuth();

    if (authResult.success) {
      console.log('✅ API: OAuth authentication successful');
      return NextResponse.json({
        success: true,
        message: 'OAuth authentication successful',
        data: {
          tokenType: authResult.tokenType,
          expiresIn: authResult.expiresIn,
          hasToken: !!authResult.token,
          configStatus: authResult.configStatus
        },
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ API: OAuth authentication failed:', authResult.error);
      return NextResponse.json({
        success: false,
        error: authResult.error,
        configStatus: authResult.configStatus,
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

  } catch (error) {
    console.error('❌ API: OAuth test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error during OAuth test',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
