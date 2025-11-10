import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { generateToken, validateGovId } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const { govId, email } = await request.json();

    if (!govId || !email) {
      return NextResponse.json(
        { success: false, message: 'Government ID and email are required' },
        { status: 400 }
      );
    }

    if (!validateGovId(govId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid government ID format' },
        { status: 400 }
      );
    }

    const user = db.getUserByGovId(govId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found. Please register first.' },
        { status: 404 }
      );
    }

    if (user.email !== email) {
      return NextResponse.json(
        { success: false, message: 'Email does not match government ID' },
        { status: 401 }
      );
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.verified,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
