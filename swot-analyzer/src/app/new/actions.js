'use server'

import { redirect } from 'next/navigation'
import { createSwotAnalysis } from '@/lib/db'

export async function createAnalysis(formData) {
  const title = formData.get('title')
  if (!title) throw new Error('Title is required')
  
  const analysis = await createSwotAnalysis(title)
  redirect(`/analysis/${analysis.id}`)
}
