import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get Token by address
export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json(
        {
          code: 400,
          message: 'Address is required'
        },
        { status: 400 }
      );
    }

    console.log('Fetching token with address:', address);
    const token = await prisma.token.findUnique({
      where: {
        contractAddress: address
      }
    });

    if (!token) {
      console.log('Token not found for address:', address);
      return NextResponse.json(
        {
          code: 404,
          message: 'Token not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 0,
      data: token
    });
  } catch (error: unknown) {
    console.error('Failed to get token:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
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

    if (!address) {
      return NextResponse.json(
        {
          code: 400,
          message: 'Address is required'
        },
        { status: 400 }
      );
    }

    // Check if token exists
    const existingToken = await prisma.token.findUnique({
      where: {
        contractAddress: address
      }
    });

    if (!existingToken) {
      return NextResponse.json(
        {
          code: 404,
          message: 'Token not found'
        },
        { status: 404 }
      );
    }

    // Delete token
    await prisma.token.delete({
      where: {
        contractAddress: address
      }
    });

    return NextResponse.json({
      code: 0,
      message: 'Token deleted successfully'
    });
  } catch (error: unknown) {
    console.error('Failed to delete token:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}