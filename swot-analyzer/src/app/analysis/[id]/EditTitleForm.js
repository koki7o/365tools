'use client'

import { useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateAnalysisTitle } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-[#00E6A7] text-black px-3 py-1.5 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 text-sm font-medium"
    >
      {pending ? 'Saving...' : 'Save'}
    </button>
  )
}

export default function EditTitleForm({ id, initialTitle }) {
  const [isEditing, setIsEditing] = useState(false)
  const formRef = useRef()

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="text-[#00E6A7] hover:opacity-80 text-sm"
      >
        Edit Title
      </button>
    )
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await updateAnalysisTitle(formData)
        setIsEditing(false)
      }}
      className="flex gap-2 items-center"
    >
      <input type="hidden" name="id" value={id} />
      <input
        type="text"
        name="title"
        defaultValue={initialTitle}
        required
        className="input text-lg font-bold py-1"
        autoFocus
      />
      <div className="flex gap-2">
        <SubmitButton />
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="px-3 py-1.5 border border-[#2A2A2A] rounded-lg hover:border-[#00E6A7] transition-all text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
