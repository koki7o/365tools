'use client'

import { deleteAnalysis, deleteItem } from './actions'

export function DeleteButton({ id }) {
  return (
    <form action={deleteAnalysis}>
      <input type="hidden" name="id" value={id} />
      <button 
        type="submit"
        className="text-red-500 hover:text-red-400 text-sm"
      >
        Delete Analysis
      </button>
    </form>
  )
}

export function DeleteItemButton({ id, analysisId }) {
  return (
    <form action={deleteItem}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="analysisId" value={analysisId} />
      <button 
        type="submit"
        className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </form>
  )
}
