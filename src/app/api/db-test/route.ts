import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // 测试数据库连接
    const result = await pool.query('SELECT version(), current_timestamp');
    
    return NextResponse.json({
      code: 0,
      database_version: result.rows[0].version,
      server_time: result.rows[0].current_timestamp,
      connection_info: {
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DATABASE,
        user: process.env.POSTGRES_USER,
        ssl_enabled: true
      }
    });
  } catch (error: unknown) {
    console.error('数据库连接测试失败:', error);
    return NextResponse.json(
      { 
        code: 500, 
        message: '数据库连接测试失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 