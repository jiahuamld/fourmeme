import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all tokens
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'created_at'; // Default sort by creation time
    const order = searchParams.get('order') || 'desc'; // Default order descending

    // Validate sort field
    const allowedSortFields = ['created_at', 'market_cap', 'volume_24h'];
    if (!allowedSortFields.includes(sort)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid sort field',
          allowed_fields: allowedSortFields
        },
        { status: 400 }
      );
    }

    // Validate sort order
    const allowedOrders = ['asc', 'desc'];
    if (!allowedOrders.includes(order.toLowerCase())) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid sort order',
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to get tokens:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get token list',
        error: errorMessage
      },
      { status: 500 }
    );
  }
}

// Create new token
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received data:', body);
    
    const { 
      name,
      symbol,
      deployer,
      userId,
      imageUrl,
      messageId,
      platform,
      contractAddress,
      chain,
      pair,
      market_cap,
      volume_24h,
      twitter_url
    } = body;
    
    // Validate required fields
    if (!name || !symbol || !contractAddress) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields',
          required: ['name', 'symbol', 'contractAddress']
        },
        { status: 400 }
      );
    }
    
    const token = await prisma.token.create({
      data: {
        name,
        symbol,
        deployer,
        userId,
        imageUrl,
        messageId,
        platform,
        contractAddress,
        chain,
        pair,
        market_cap: market_cap ? parseFloat(market_cap) : null,
        volume_24h: volume_24h ? parseFloat(volume_24h) : null,
        twitter_url
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: token,
      message: 'Token created successfully'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to create token:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create token',
        error: errorMessage
      },
      { status: 500 }
    );
  }
}

// Delete all tokens
export async function DELETE() {
  try {
    await prisma.token.deleteMany();
    
    return NextResponse.json({ 
      success: true, 
      message: 'All tokens deleted successfully'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to delete tokens:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete tokens',
        error: errorMessage
      },
      { status: 500 }
    );
  }
} 