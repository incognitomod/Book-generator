import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { verifyToken } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'trending';
    
    if (type === 'following') {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, message: 'Authentication required for following feed' },
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

      const writings = db.getFollowingFeed(payload.userId);
      
      const writingsWithAuthors = writings.map(w => {
        const author = db.getUserById(w.authorId);
        return {
          ...w,
          author: author ? {
            id: author.id,
            name: author.name,
            avatar: author.avatar,
            verified: author.verified,
          } : null,
        };
      });

      return NextResponse.json({
        success: true,
        writings: writingsWithAuthors,
      });
    }
    
    // Trending feed
    const writings = db.getTrendingWritings(20);
    
    const writingsWithAuthors = writings.map(w => {
      const author = db.getUserById(w.authorId);
      return {
        ...w,
        author: author ? {
          id: author.id,
          name: author.name,
          avatar: author.avatar,
          verified: author.verified,
        } : null,
      };
    });

    return NextResponse.json({
      success: true,
      writings: writingsWithAuthors,
    });
  } catch (error) {
    console.error('Get feed error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
