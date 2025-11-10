import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { verifyToken } from '@/utils/auth';

export async function GET(request: NextRequest) {
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

    const analytics = db.getAnalytics(payload.userId);

    if (!analytics) {
      return NextResponse.json(
        { success: false, message: 'Analytics not found' },
        { status: 404 }
      );
    }

    const writings = db.getWritingsByAuthor(payload.userId);
    const topWritings = writings
      .filter(w => w.isPublic)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(w => ({
        id: w.id,
        title: w.title,
        views: w.views,
        upvotes: w.upvotes.length,
        shares: w.shares,
      }));

    return NextResponse.json({
      success: true,
      analytics: {
        ...analytics,
        topWritings,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
