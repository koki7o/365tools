'use client'

import { useMemo } from 'react'

export default function DecisionAnalysis({ events }) {
  const insights = useMemo(() => {
    if (!events.length) return []

    const insights = []
    
    // Analyze seasonal patterns
    const seasonalDecisions = events.reduce((acc, event) => {
      if (event.seasonalTiming) {
        acc[event.seasonalTiming] = acc[event.seasonalTiming] || []
        acc[event.seasonalTiming].push(event)
      }
      return acc
    }, {})

    Object.entries(seasonalDecisions).forEach(([season, decisions]) => {
      const highImpactDecisions = decisions.filter(d => d.impactRating >= 4)
      if (highImpactDecisions.length > decisions.length * 0.5) {
        insights.push({
          type: 'seasonal',
          text: `You tend to make impactful decisions during ${season}`
        })
      }
    })

    // Analyze decision outcomes by category
    const categoryOutcomes = events.reduce((acc, event) => {
      if (event.outcome && event.category) {
        acc[event.category.name] = acc[event.category.name] || []
        acc[event.category.name].push(event)
      }
      return acc
    }, {})

    Object.entries(categoryOutcomes).forEach(([category, decisions]) => {
      const positiveOutcomes = decisions.filter(d => 
        d.outcome?.toLowerCase().includes('positive') || 
        d.outcome?.toLowerCase().includes('success') ||
        d.outcome?.toLowerCase().includes('good')
      )
      if (positiveOutcomes.length > decisions.length * 0.7) {
        insights.push({
          type: 'category',
          text: `Your ${category.toLowerCase()} decisions tend to have positive outcomes`
        })
      }
    })

    // Analyze emotional patterns
    const emotionalPatterns = events.reduce((acc, event) => {
      if (event.emotions) {
        acc.push({
          emotions: event.emotions,
          impactRating: event.impactRating
        })
      }
      return acc
    }, [])

    const positiveEmotions = emotionalPatterns.filter(p => 
      p.emotions?.toLowerCase().includes('happy') ||
      p.emotions?.toLowerCase().includes('excited') ||
      p.emotions?.toLowerCase().includes('confident')
    )

    if (positiveEmotions.length > 0) {
      const avgImpact = positiveEmotions.reduce((sum, p) => sum + (p.impactRating || 0), 0) / positiveEmotions.length
      if (avgImpact > 3.5) {
        insights.push({
          type: 'emotional',
          text: 'Decisions made when feeling positive tend to have higher impact'
        })
      }
    }

    return insights
  }, [events])

  if (!insights.length) {
    return (
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Decision Analysis</h3>
        <p className="text-zinc-400">
          Add more life events with decision details to see patterns and insights.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">Decision Analysis</h3>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg ${
              insight.type === 'seasonal' ? 'bg-blue-900/20 border border-blue-800/50' :
              insight.type === 'category' ? 'bg-purple-900/20 border border-purple-800/50' :
              'bg-green-900/20 border border-green-800/50'
            }`}
          >
            <p className="text-zinc-200">{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
