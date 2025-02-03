'use client'

import { useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { addItem } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-[#00E6A7] text-black px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 font-medium"
    >
      {pending ? 'Adding...' : 'Add'}
    </button>
  )
}

export default function AddItemForm({ analysisId, type }) {
  const formRef = useRef()
  
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addItem(formData)
        formRef.current?.reset()
      }}
      className="flex gap-3"
    >
      <input type="hidden" name="analysisId" value={analysisId} />
      <input type="hidden" name="type" value={type} />
      <input
        type="text"
        name="content"
        required
        placeholder={`Add a ${type}...`}
        className="input flex-1"
      />
      <SubmitButton />
    </form>
  )
}
