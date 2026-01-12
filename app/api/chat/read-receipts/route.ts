/**
 * Chat Read Receipts API
 * Track who has read each message
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST - Mark message(s) as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, messageIds } = body;
    
    if (!userId || !messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { error: 'userId and messageIds array are required' },
        { status: 400 }
      );
    }
    
    // Create read receipts (upsert to avoid duplicates)
    await Promise.all(
      messageIds.map(messageId =>
        prisma.$executeRaw`
          INSERT INTO "ChatReadReceipt" ("id", "messageId", "userId", "readAt")
          VALUES (gen_random_uuid(), ${messageId}, ${userId}, NOW())
          ON CONFLICT ("messageId", "userId") DO UPDATE SET "readAt" = NOW()
        `
      )
    );
    
    return NextResponse.json({
      success: true,
      markedCount: messageIds.length,
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}

// GET - Get read receipts for a message
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const messageId = searchParams.get('messageId');
    
    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      );
    }
    
    const readReceipts = await prisma.$queryRaw<Array<{
      userId: string;
      readAt: Date;
      userName: string;
      userAvatar: string | null;
    }>>`
      SELECT 
        r."userId",
        r."readAt",
        u."name" as "userName",
        u."avatar" as "userAvatar"
      FROM "ChatReadReceipt" r
      JOIN "users" u ON u."id" = r."userId"
      WHERE r."messageId" = ${messageId}
      ORDER BY r."readAt" DESC
    `;
    
    return NextResponse.json({
      success: true,
      readBy: readReceipts,
      readCount: readReceipts.length,
    });
  } catch (error) {
    console.error('Error fetching read receipts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch read receipts' },
      { status: 500 }
    );
  }
}
