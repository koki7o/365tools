import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const chores = await prisma.chore.findMany({
      include: {
        assignedTo: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return NextResponse.json(chores);
  } catch (error) {
    console.error('Error fetching chores:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name } = await request.json();
    const chore = await prisma.chore.create({
      data: { name },
      include: {
        assignedTo: true,
      },
    });
    return NextResponse.json(chore);
  } catch (error) {
    console.error('Error creating chore:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, personId } = await request.json();
    const chore = await prisma.chore.update({
      where: { id: parseInt(id) },
      data: { 
        personId: personId ? parseInt(personId) : null,
        updatedAt: new Date(),
      },
      include: {
        assignedTo: true,
      },
    });
    return NextResponse.json(chore);
  } catch (error) {
    console.error('Error updating chore:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await prisma.chore.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: 'Chore deleted successfully' });
  } catch (error) {
    console.error('Error deleting chore:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
