import Link from 'next/link'
import { createAnalysis } from './actions'

export default function NewAnalysis() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <Link 
            href="/"
            className="text-[#00E6A7] hover:opacity-80 mb-4 inline-block"
          >
            ← Back to Analyses
          </Link>
          <h1 className="text-3xl font-bold">Create New Analysis</h1>
        </div>
        
        <form action={createAnalysis} className="card p-8">
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-[#00E6A7] mb-2">
              Analysis Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="input"
              placeholder="e.g., Business Strategy 2025"
            />
          </div>
          
          <div className="flex gap-4">
            <button
              type="submit"
              className="button-primary"
            >
              Create Analysis
            </button>
            <Link
              href="/"
              className="button-secondary"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
