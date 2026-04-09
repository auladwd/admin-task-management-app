import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * GET /api/notes?userId=xxx
 * Returns only the notes belonging to the requesting user.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId)
    return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const db = await getDatabase();
  const notes = await db
    .collection('notes')
    .find({ userId })
    .sort({ pinned: -1, updatedAt: -1 })
    .toArray();

  return NextResponse.json({ notes });
}

/**
 * POST /api/notes
 * Create a new note.
 */
export async function POST(request) {
  const body = await request.json();
  const { userId, title, content, color, items } = body;
  if (!userId)
    return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const db = await getDatabase();
  const note = {
    userId,
    title: title || '',
    content: content || '',
    color: color || 'default',
    items: items || [], // checklist items: [{text, checked}]
    pinned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await db.collection('notes').insertOne(note);
  return NextResponse.json(
    { ...note, _id: result.insertedId },
    { status: 201 },
  );
}

/**
 * PUT /api/notes
 * Update an existing note (ownership enforced).
 */
export async function PUT(request) {
  const body = await request.json();
  const { _id, userId, ...updates } = body;
  if (!_id || !userId)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  if (!ObjectId.isValid(_id))
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const db = await getDatabase();
  const result = await db.collection('notes').updateOne(
    { _id: new ObjectId(_id), userId }, // userId guard
    { $set: { ...updates, updatedAt: new Date() } },
  );
  if (result.matchedCount === 0)
    return NextResponse.json(
      { error: 'Note not found or access denied' },
      { status: 404 },
    );

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/notes?id=xxx&userId=xxx
 * Delete a note (ownership enforced).
 */
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const userId = searchParams.get('userId');
  if (!id || !userId)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  if (!ObjectId.isValid(id))
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const db = await getDatabase();
  const result = await db.collection('notes').deleteOne(
    { _id: new ObjectId(id), userId }, // userId guard
  );
  if (result.deletedCount === 0)
    return NextResponse.json(
      { error: 'Note not found or access denied' },
      { status: 404 },
    );

  return NextResponse.json({ success: true });
}
