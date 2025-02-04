import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const data = await request.json()
    
    const event = await prisma.lifeEvent.create({
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
        },
        media: {
          create: data.media?.map(item => ({
            url: item.url,
            type: item.type,
            caption: item.caption
          })) || []
        }
      },
      include: {
        category: true,
        media: true
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Failed to create event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const events = await prisma.lifeEvent.findMany({
      include: {
        category: true,
        media: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
