import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT NOW()');
    return NextResponse.json({ 
      success: true, 
      data: result.rows,
      message: '数据库连接成功'
    });
  } catch (error) {
    console.error('数据库查询错误:', error);
    return NextResponse.json(
      { success: false, message: '数据库查询失败', error: error.message },
      { status: 500 }
    );
  }
} 