import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { verifyToken } from '@/utils/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const writing = db.getWritingById(params.id);

    if (!writing) {
      return NextResponse.json(
        { success: false, message: 'Writing not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to view
    if (!writing.isPublic) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      const payload = verifyToken(token);

      if (!payload || payload.userId !== writing.authorId) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 403 }
        );
      }
    } else {
      // Increment views for public writings
      db.incrementViews(params.id);
    }

    const author = db.getUserById(writing.authorId);
    const comments = db.getCommentsByWriting(params.id);

    return NextResponse.json({
      success: true,
      writing,
      author: author ? {
        id: author.id,
        name: author.name,
        avatar: author.avatar,
        verified: author.verified,
      } : null,
      comments: comments.map(c => {
        const commentAuthor = db.getUserById(c.authorId);
        return {
          ...c,
          author: commentAuthor ? {
            id: commentAuthor.id,
            name: commentAuthor.name,
            avatar: commentAuthor.avatar,
          } : null,
        };
      }),
    });
  } catch (error) {
    console.error('Get writing error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const writing = db.getWritingById(params.id);

    if (!writing) {
      return NextResponse.json(
        { success: false, message: 'Writing not found' },
        { status: 404 }
      );
    }

    if (writing.authorId !== payload.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const updates = await request.json();
    const updated = db.updateWriting(params.id, updates);

    return NextResponse.json({
      success: true,
      writing: updated,
    });
  } catch (error) {
    console.error('Update writing error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const writing = db.getWritingById(params.id);

    if (!writing) {
      return NextResponse.json(
        { success: false, message: 'Writing not found' },
        { status: 404 }
      );
    }

    if (writing.authorId !== payload.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    db.deleteWriting(params.id);

    return NextResponse.json({
      success: true,
      message: 'Writing deleted successfully',
    });
  } catch (error) {
    console.error('Delete writing error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
