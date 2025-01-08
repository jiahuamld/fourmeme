import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get Token by address
export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    const token = await prisma.Token.findUnique({
      where: {
        contractAddress: address
      }
    });

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: token
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to get token:', errorMessage);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get token',
        error: errorMessage
      },
      { status: 500 }
    );
  }
}

// Delete single token
export async function DELETE(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    // Check if token exists
    const existingToken = await prisma.Token.findUnique({
      where: {
        contractAddress: address
      }
    });

    if (!existingToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token not found'
        },
        { status: 404 }
      );
    }

    // Delete token
    await prisma.Token.delete({
      where: {
        contractAddress: address
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Token deleted successfully'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to delete token:', errorMessage);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete token',
        error: errorMessage
      },
      { status: 500 }
    );
  }
} 