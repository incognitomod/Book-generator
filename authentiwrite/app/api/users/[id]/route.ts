import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = db.getUserById(params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const analytics = db.getAnalytics(params.id);
    const writings = db.getWritingsByAuthor(params.id).filter(w => w.isPublic);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar,
        verified: user.verified,
        followers: user.followers.length,
        following: user.following.length,
      },
      analytics: analytics ? {
        totalViews: analytics.totalViews,
        totalUpvotes: analytics.totalUpvotes,
        writingsCount: analytics.writingsCount,
      } : null,
      recentWritings: writings.slice(0, 5),
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
