import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 通过地址获取Token
export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    const token = await prisma.token.findUnique({
      where: {
        address: address
      }
    });

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: '未找到该Token'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: token
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('获取Token失败:', errorMessage);
    return NextResponse.json(
      {
        success: false,
        message: '获取Token失败',
        error: errorMessage
      },
      { status: 500 }
    );
  }
}

// 删除单个Token
export async function DELETE(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    // 先检查Token是否存在
    const existingToken = await prisma.token.findUnique({
      where: {
        address: address
      }
    });

    if (!existingToken) {
      return NextResponse.json(
        {
          success: false,
          message: '未找到该Token'
        },
        { status: 404 }
      );
    }

    // 删除Token
    await prisma.token.delete({
      where: {
        address: address
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Token删除成功'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('删除Token失败:', errorMessage);
    return NextResponse.json(
      {
        success: false,
        message: '删除Token失败',
        error: errorMessage
      },
      { status: 500 }
    );
  }
} 