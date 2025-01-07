import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 获取所有Token
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'created_at'; // 默认按创建时间排序
    const order = searchParams.get('order') || 'desc'; // 默认降序

    // 验证排序字段
    const allowedSortFields = ['created_at', 'market_cap', 'volume_24h'];
    if (!allowedSortFields.includes(sort)) {
      return NextResponse.json(
        { 
          success: false, 
          message: '无效的排序字段',
          allowed_fields: allowedSortFields
        },
        { status: 400 }
      );
    }

    // 验证排序方向
    const allowedOrders = ['asc', 'desc'];
    if (!allowedOrders.includes(order.toLowerCase())) {
      return NextResponse.json(
        { 
          success: false, 
          message: '无效的排序方向',
          allowed_orders: allowedOrders
        },
        { status: 400 }
      );
    }

    const tokens = await prisma.token.findMany({
      orderBy: {
        [sort]: order.toLowerCase()
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: tokens,
      sort_info: {
        field: sort,
        order: order
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('获取Token失败:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        message: '获取Token列表失败',
        error: errorMessage
      },
      { status: 500 }
    );
  }
}

// 创建新Token
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('收到的数据:', body);
    
    const { 
      token_img_url,
      token_name,
      ticker_symbol,
      token_description,
      raised_token,
      market_cap,
      volume_24h,
      website_url,
      twitter_url,
      telegram_url,
      tags,
      chain,
      address
    } = body;
    
    // 验证必填字段
    if (!token_img_url || !token_name || !address) {
      return NextResponse.json(
        { 
          success: false, 
          message: '缺少必填字段',
          required: ['token_img_url', 'token_name', 'address']
        },
        { status: 400 }
      );
    }
    
    const token = await prisma.token.create({
      data: {
        token_img_url,
        token_name,
        ticker_symbol,
        token_description,
        raised_token,
        market_cap: parseFloat(market_cap) || null,
        volume_24h: parseFloat(volume_24h) || null,
        website_url,
        twitter_url,
        telegram_url,
        tags: tags || [],
        chain,
        address
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: token,
      message: 'Token创建成功'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('创建Token失败:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        message: '创建Token失败',
        error: errorMessage
      },
      { status: 500 }
    );
  }
}

// 清除所有Token
export async function DELETE() {
  try {
    await prisma.token.deleteMany();
    
    return NextResponse.json({ 
      success: true, 
      message: '所有Token已清除'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('清除Token失败:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        message: '清除Token失败',
        error: errorMessage
      },
      { status: 500 }
    );
  }
} 