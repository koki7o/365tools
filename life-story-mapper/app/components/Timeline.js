'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EventForm from './EventForm'
import DecisionAnalysis from './DecisionAnalysis'

export default function Timeline({ initialEvents }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [editingEvent, setEditingEvent] = useState(null)
  const [events, setEvents] = useState(initialEvents)
  const router = useRouter()

  const filteredEvents = selectedCategory === 'All'
    ? events
    : events.filter(event => event.category.name === selectedCategory)

  const handleEventUpdate = async (updatedEvent) => {
    setEvents(prevEvents => {
      const index = prevEvents.findIndex(e => e.id === updatedEvent.id)
      if (index !== -1) {
        const newEvents = [...prevEvents]
        newEvents[index] = updatedEvent
        return newEvents
      }
      return [...prevEvents, updatedEvent]
    })
    setEditingEvent(null)
  }

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete event')

      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event. Please try again.')
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Timeline</h3>
        <div className="space-y-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="timeline-item group">
              <div className="timeline-dot" />
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-medium">{event.title}</h4>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="text-zinc-400 hover:text-white mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-zinc-400">
                  {new Date(event.date).toLocaleDateString()}
                  {event.location && ` • ${event.location}`}
                </p>
                <p className="text-zinc-300">{event.description}</p>
                {event.decisionContext && (
                  <div className="mt-4 space-y-2 border-t border-zinc-800 pt-4">
                    <p className="text-sm text-zinc-400">
                      <span className="font-medium">Context:</span> {event.decisionContext}
                    </p>
                    {event.alternatives && (
                      <p className="text-sm text-zinc-400">
                        <span className="font-medium">Alternatives:</span> {event.alternatives}
                      </p>
                    )}
                    {event.outcome && (
                      <p className="text-sm text-zinc-400">
                        <span className="font-medium">Outcome:</span> {event.outcome}
                      </p>
                    )}
                    {event.learnings && (
                      <p className="text-sm text-zinc-400">
                        <span className="font-medium">Learnings:</span> {event.learnings}
                      </p>
                    )}
                    {event.impactRating && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-400 font-medium">Impact:</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < event.impactRating
                                  ? 'bg-purple-500'
                                  : 'bg-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {event.media.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {event.media.map((item) => (
                      <div
                        key={item.id}
                        className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center"
                      >
                        {item.type === 'image' ? (
                          <img
                            src={item.url}
                            alt={item.caption || ''}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-2xl">📄</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredEvents.length === 0 && (
            <p className="text-zinc-500 text-center py-8">
              No events found. {selectedCategory !== 'All' ? 'Try a different category or add' : 'Start adding'} some memories!
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Categories</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setSelectedCategory('All')}
              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors ${
                selectedCategory === 'All' ? 'bg-zinc-800' : ''
              }`}
            >
              All Events
            </button>
            <button 
              onClick={() => setSelectedCategory('Personal')}
              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-blue-400 ${
                selectedCategory === 'Personal' ? 'bg-zinc-800' : ''
              }`}
            >
              Personal
            </button>
            <button 
              onClick={() => setSelectedCategory('Career')}
              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-green-400 ${
                selectedCategory === 'Career' ? 'bg-zinc-800' : ''
              }`}
            >
              Career
            </button>
            <button 
              onClick={() => setSelectedCategory('Education')}
              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-purple-400 ${
                selectedCategory === 'Education' ? 'bg-zinc-800' : ''
              }`}
            >
              Education
            </button>
          </div>
        </div>

        <DecisionAnalysis events={events} />

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-zinc-800/50">
              <p className="text-sm text-zinc-400">Total Events</p>
              <p className="text-2xl font-bold gradient-text">{events.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-zinc-800/50">
              <p className="text-sm text-zinc-400">Media Items</p>
              <p className="text-2xl font-bold gradient-text">
                {events.reduce((acc, event) => acc + event.media.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {editingEvent && (
        <EventForm
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={handleEventUpdate}
        />
      )}
    </div>
  )
}
