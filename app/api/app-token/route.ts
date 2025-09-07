import { NextRequest, NextResponse } from 'next/server';
import { appTokenService } from '@/lib/services/app-token-service';

export async function POST(request: NextRequest) {
  try {
    const { appKey } = await request.json();
    
    if (!appKey) {
      return NextResponse.json(
        { error: 'App key is required' },
        { status: 400 }
      );
    }

    console.log('🔑 获取应用令牌，App Key:', appKey);

    const appToken = await appTokenService.getValidAppToken(appKey);
    
    if (!appToken) {
      return NextResponse.json(
        { error: 'Failed to get app token' },
        { status: 500 }
      );
    }

    console.log('✅ 应用令牌获取成功');

    return NextResponse.json({
      token: appToken,
      success: true
    });

  } catch (error) {
    console.error('❌ 获取应用令牌失败:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    );
  }
}



