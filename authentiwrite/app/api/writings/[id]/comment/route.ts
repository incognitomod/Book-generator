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

    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Comment content is required' },
        { status: 400 }
      );
    }

    const writing = db.getWritingById(params.id);

    if (!writing) {
      return NextResponse.json(
        { success: false, message: 'Writing not found' },
        { status: 404 }
      );
    }

    const comment = db.createComment({
      writingId: params.id,
      authorId: payload.userId,
      content: content.trim(),
    });

    const author = db.getUserById(payload.userId);

    return NextResponse.json({
      success: true,
      comment: {
        ...comment,
        author: author ? {
          id: author.id,
          name: author.name,
          avatar: author.avatar,
        } : null,
      },
    });
  } catch (error) {
    console.error('Comment error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
