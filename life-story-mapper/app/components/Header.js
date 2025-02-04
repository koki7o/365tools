'use client'

import { useState } from 'react'
import EventForm from './EventForm'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [showEventForm, setShowEventForm] = useState(false)
  const router = useRouter()

  const handleEventSuccess = () => {
    setShowEventForm(false)
    router.refresh()
  }

  return (
    <>
      <nav className="fixed top-0 w-full bg-black/50 backdrop-blur-sm border-b border-zinc-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold gradient-text">Life Story Mapper</h1>
            <div className="flex space-x-4">
              <button 
                className="button"
                onClick={() => setShowEventForm(true)}
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showEventForm && (
        <EventForm
          onClose={() => setShowEventForm(false)}
          onSuccess={handleEventSuccess}
        />
      )}
    </>
  )
}
