import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { verifyToken } from '@/utils/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { voteType } = await request.json();

    if (voteType !== 'up' && voteType !== 'down') {
      return NextResponse.json(
        { success: false, message: 'Invalid vote type' },
        { status: 400 }
      );
    }

    const success = db.voteWriting(params.id, payload.userId, voteType);

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Writing not found' },
        { status: 404 }
      );
    }

    const writing = db.getWritingById(params.id);

    return NextResponse.json({
      success: true,
      upvotes: writing?.upvotes.length || 0,
      downvotes: writing?.downvotes.length || 0,
    });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
