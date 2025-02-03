'use server'

import { addSwotItem, deleteSwotAnalysis, updateSwotAnalysis, deleteSwotItem } from '@/lib/db'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function addItem(formData) {
  const content = formData.get('content')
  const analysisId = formData.get('analysisId')
  const type = formData.get('type')
  
  if (!content) throw new Error('Content is required')
  
  await addSwotItem(analysisId, content, type)
  revalidatePath(`/analysis/${analysisId}`)
}

export async function deleteAnalysis(formData) {
  const id = formData.get('id')
  await deleteSwotAnalysis(id)
  revalidatePath('/')
  redirect('/')
}

export async function updateAnalysisTitle(formData) {
  const id = formData.get('id')
  const title = formData.get('title')
  
  if (!title) throw new Error('Title is required')
  
  await updateSwotAnalysis(id, title)
  revalidatePath(`/analysis/${id}`)
  revalidatePath('/')
}

export async function deleteItem(formData) {
  const id = formData.get('id')
  const analysisId = formData.get('analysisId')
  await deleteSwotItem(id)
  revalidatePath(`/analysis/${analysisId}`)
}
