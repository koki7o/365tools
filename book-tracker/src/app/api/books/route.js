import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get all books
export async function GET() {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(books);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching books' }, { status: 500 });
  }
}

// Create a new book
export async function POST(request) {
  try {
    const data = await request.json();
    const book = await prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        progress: data.progress || 0,
        color: data.color || 'bg-[#B4E4E4]',
      },
    });
    return NextResponse.json(book);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating book' }, { status: 500 });
  }
}

// Update a book
export async function PUT(request) {
  try {
    const data = await request.json();
    const book = await prisma.book.update({
      where: { id: data.id },
      data: {
        progress: data.progress,
        title: data.title,
        author: data.author,
        color: data.color,
      },
    });
    return NextResponse.json(book);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating book' }, { status: 500 });
  }
}

// Delete a book
export async function DELETE(request) {
  try {
    const data = await request.json();
    await prisma.book.delete({
      where: { id: data.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting book' }, { status: 500 });
  }
}
