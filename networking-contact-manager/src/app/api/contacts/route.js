import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { updatedAt: 'desc' }
    })
    return NextResponse.json(contacts)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const contact = await prisma.contact.create({
      data: {
        name: data.name,
        role: data.role,
        company: data.company,
        email: data.email,
        tags: data.tags,
        notes: data.notes,
      }
    })
    return NextResponse.json(contact)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const data = await request.json()
    const contact = await prisma.contact.update({
      where: { id: data.id },
      data: {
        name: data.name,
        role: data.role,
        company: data.company,
        email: data.email,
        tags: data.tags,
        notes: data.notes,
        lastContact: new Date(),
      }
    })
    return NextResponse.json(contact)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
