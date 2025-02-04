import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const data = await request.json()
    
    const event = await prisma.lifeEvent.update({
      where: { id: parseInt(id) },
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        location: data.location,
        emotions: data.emotions,
        people: data.people,
        category: {
          connectOrCreate: {
            where: { name: data.category },
            create: { 
              name: data.category,
              color: data.categoryColor || '#000000'
            }
          }
        }
      },
      include: {
        category: true,
        media: true
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Failed to update event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    await prisma.lifeEvent.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
