import { NextResponse } from 'next/server';
import pool, { queryWithRetry } from '@/lib/db';

interface Token {
  id: number;
  token_img_url: string;
  token_name: string;
  ticker_symbol: string;
  token_description: string;
  raised_token: string;
  market_cap: string;
  volume_24h: string;
  website_url: string;
  twitter_url: string;
  telegram_url: string;
  tags: string[];
  chain: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { 
          success: false, 
          message: '缺少address参数'
        },
        { status: 400 }
      );
    }

    const result = await queryWithRetry<Token>(
      `SELECT * FROM tokens WHERE address = $1`,
      [address]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: '未找到该地址对应的token'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0]
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('获取token信息失败:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        message: '获取token信息失败',
        error: errorMessage
      },
      { status: 500 }
    );
  }
} 