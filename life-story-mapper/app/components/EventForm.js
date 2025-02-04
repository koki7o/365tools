'use client'

import { useState } from 'react'

export default function EventForm({ event, onClose, onSuccess }) {
  const [formData, setFormData] = useState(
    event ? {
      ...event,
      date: new Date(event.date).toISOString().split('T')[0],
      category: event.category.name
    } : {
      title: '',
      description: '',
      date: '',
      location: '',
      category: 'Personal',
      emotions: '',
      people: '',
      media: [],
      decisionContext: '',
      alternatives: '',
      outcome: '',
      impactRating: 3,
      learnings: '',
      seasonalTiming: 'Spring'
    }
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(event ? `/api/events/${event.id}` : '/api/events', {
        method: event ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create event')
      }

      const createdEvent = await response.json()
      onSuccess(createdEvent)
      onClose()
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Failed to create event. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold gradient-text">
            {event ? 'Edit Life Event' : 'Add Life Event'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="Enter event title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="input w-full h-32"
              placeholder="Describe your event..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input w-full"
                placeholder="Where did this happen?"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input w-full"
            >
              <option value="Personal">Personal</option>
              <option value="Career">Career</option>
              <option value="Education">Education</option>
              <option value="Travel">Travel</option>
              <option value="Family">Family</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Emotions
            </label>
            <input
              type="text"
              name="emotions"
              value={formData.emotions}
              onChange={handleChange}
              className="input w-full"
              placeholder="How did you feel?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              People
            </label>
            <input
              type="text"
              name="people"
              value={formData.people}
              onChange={handleChange}
              className="input w-full"
              placeholder="Who was involved?"
            />
          </div>

          <div className="border-t border-zinc-800 my-6 pt-6">
            <h3 className="text-lg font-semibold mb-4">Decision Analysis</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Decision Context
                </label>
                <textarea
                  name="decisionContext"
                  value={formData.decisionContext}
                  onChange={handleChange}
                  className="input w-full h-24"
                  placeholder="What led to this decision?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Alternatives Considered
                </label>
                <textarea
                  name="alternatives"
                  value={formData.alternatives}
                  onChange={handleChange}
                  className="input w-full h-24"
                  placeholder="What other options did you consider?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Outcome
                </label>
                <textarea
                  name="outcome"
                  value={formData.outcome}
                  onChange={handleChange}
                  className="input w-full h-24"
                  placeholder="What was the result of this decision?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Impact Rating (1-5)
                </label>
                <input
                  type="range"
                  name="impactRating"
                  value={formData.impactRating}
                  onChange={handleChange}
                  min="1"
                  max="5"
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Low Impact</span>
                  <span>High Impact</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Learnings
                </label>
                <textarea
                  name="learnings"
                  value={formData.learnings}
                  onChange={handleChange}
                  className="input w-full h-24"
                  placeholder="What did you learn from this experience?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Season
                </label>
                <select
                  name="seasonalTiming"
                  value={formData.seasonalTiming}
                  onChange={handleChange}
                  className="input w-full"
                >
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                  <option value="Winter">Winter</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="button"
            >
              {isSubmitting ? 'Saving...' : event ? 'Save Changes' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
