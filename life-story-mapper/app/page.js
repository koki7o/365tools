import Timeline from './components/Timeline'

async function getLifeEvents() {
  const res = await fetch('http://localhost:3000/api/events', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json()
}

export default async function Home() {
  const events = await getLifeEvents()
  
  return (
    <div className="space-y-8">
      <div className="card">
        <h2 className="text-3xl font-bold gradient-text mb-4">Your Life Story</h2>
        <p className="text-zinc-400">
          Map out your journey through life with meaningful events, memories, and milestones.
        </p>
      </div>
      <Timeline initialEvents={events} />
    </div>
  )
}
