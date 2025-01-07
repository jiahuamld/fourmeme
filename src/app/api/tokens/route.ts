import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// 删除旧表并创建新表的SQL
const dropTableSQL = `DROP TABLE IF EXISTS tokens;`;

const createTableSQL = `
  CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    token_img_url VARCHAR(255) NOT NULL,
    token_name VARCHAR(255) NOT NULL,
    ticker_symbol VARCHAR(50),
    token_description TEXT,
    raised_token VARCHAR(255),
    market_cap NUMERIC(30, 2),
    volume_24h NUMERIC(30, 2),
    website_url VARCHAR(255),
    twitter_url VARCHAR(255),
    telegram_url VARCHAR(255),
    tags TEXT[],
    chain VARCHAR(50),
    address VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
`;

// 初始化表
async function initializeTable() {
  try {
    await pool.query(dropTableSQL);
    await pool.query(createTableSQL);
    console.log('表结构更新成功');
  } catch (err) {
    console.error('创建表失败:', err);
  }
}

// 初始化表
initializeTable();

// 获取所有Coin
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

    const result = await pool.query(`
      SELECT * FROM tokens 
      ORDER BY ${sort} ${order}
    `);
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows,
      sort_info: {
        field: sort,
        order: order
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('获取Coin失败:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        message: '获取Coin列表失败',
        error: errorMessage
      },
      { status: 500 }
    );
  }
}

// 创建新Coin
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
    
    const result = await pool.query(
      `INSERT INTO tokens (
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
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *`,
      [
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
      ]
    );
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Coin创建成功'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('创建Coin失败:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        message: '创建Coin失败',
        error: errorMessage
      },
      { status: 500 }
    );
  }
} 