import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';

export async function POST(
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

    db.incrementShares(params.id);

    return NextResponse.json({
      success: true,
      shares: writing.shares + 1,
    });
  } catch (error) {
    console.error('Share error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
