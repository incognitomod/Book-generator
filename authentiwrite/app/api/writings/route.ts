import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { verifyToken } from '@/utils/auth';

export async function POST(request: NextRequest) {
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

    const { title, content, template, isPublic, background, fontFamily, colorGrade } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: 'Title and content are required' },
        { status: 400 }
      );
    }

    const writing = db.createWriting({
      authorId: payload.userId,
      title,
      content,
      template: template || 'blank',
      isPublic: isPublic !== undefined ? isPublic : false,
      background,
      fontFamily,
      colorGrade,
    });

    return NextResponse.json({
      success: true,
      writing,
    });
  } catch (error) {
    console.error('Create writing error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const searchParams = request.nextUrl.searchParams;
    const authorId = searchParams.get('authorId');
    
    if (authorId) {
      // Get writings by specific author
      const writings = db.getWritingsByAuthor(authorId);
      
      // If requesting own writings, show all; otherwise only public
      let filteredWritings = writings;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = verifyToken(token);
        if (!payload || payload.userId !== authorId) {
          filteredWritings = writings.filter(w => w.isPublic);
        }
      } else {
        filteredWritings = writings.filter(w => w.isPublic);
      }
      
      return NextResponse.json({
        success: true,
        writings: filteredWritings,
      });
    }
    
    // Get all public writings
    const writings = db.getPublicWritings();
    return NextResponse.json({
      success: true,
      writings,
    });
  } catch (error) {
    console.error('Get writings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
