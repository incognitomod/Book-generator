import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { generateToken, validateGovId, validateEmail } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const { govId, email, name } = await request.json();

    if (!govId || !email || !name) {
      return NextResponse.json(
        { success: false, message: 'Government ID, email, and name are required' },
        { status: 400 }
      );
    }

    if (!validateGovId(govId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid government ID format. Use format: GOV123456' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = db.getUserByGovId(govId);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this government ID already exists' },
        { status: 409 }
      );
    }

    const existingEmail = db.getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = db.createUser({
      govId,
      email,
      name,
      verified: true, // Auto-verify for demo purposes
    });

    const token = generateToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
