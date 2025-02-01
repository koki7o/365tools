import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const people = await prisma.person.findMany({
      include: {
        chores: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return NextResponse.json(people);
  } catch (error) {
    console.error('Error fetching people:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name } = await request.json();
    const person = await prisma.person.create({
      data: { name },
      include: {
        chores: true,
      },
    });
    return NextResponse.json(person);
  } catch (error) {
    console.error('Error creating person:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    // First, unassign all chores assigned to this person
    await prisma.chore.updateMany({
      where: { personId: parseInt(id) },
      data: { personId: null },
    });
    // Then delete the person
    await prisma.person.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: 'Person deleted successfully' });
  } catch (error) {
    console.error('Error deleting person:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
