import Link from 'next/link'
import { getAllSwotAnalyses } from '@/lib/db'

export default async function Home() {
  const analyses = await getAllSwotAnalyses()

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-sm font-medium text-[#00E6A7] mb-2">FOR COMPANIES</h2>
            <h1 className="text-4xl font-bold mb-4">Strategic Analysis Tool.</h1>
            <p className="text-gray-400 text-lg">
              Create and manage SWOT analyses to drive your business forward
            </p>
          </div>
          <Link 
            href="/new" 
            className="button-primary"
          >
            New Analysis
          </Link>
        </div>

        <div className="grid gap-4">
          {analyses.map((analysis) => (
            <Link
              key={analysis.id}
              href={`/analysis/${analysis.id}`}
              className="card p-6 flex justify-between items-start"
            >
              <div>
                <h2 className="text-xl font-semibold mb-2">{analysis.title}</h2>
                <div className="flex gap-6">
                  <div>
                    <p className="text-[#00E6A7] text-sm font-medium mb-1">Strengths</p>
                    <p className="text-gray-400">{analysis.strengths.length} items</p>
                  </div>
                  <div>
                    <p className="text-[#00E6A7] text-sm font-medium mb-1">Weaknesses</p>
                    <p className="text-gray-400">{analysis.weaknesses.length} items</p>
                  </div>
                  <div>
                    <p className="text-[#00E6A7] text-sm font-medium mb-1">Opportunities</p>
                    <p className="text-gray-400">{analysis.opportunities.length} items</p>
                  </div>
                  <div>
                    <p className="text-[#00E6A7] text-sm font-medium mb-1">Threats</p>
                    <p className="text-gray-400">{analysis.threats.length} items</p>
                  </div>
                </div>
              </div>
              <div className="text-[#00E6A7]">→</div>
            </Link>
          ))}

          {analyses.length === 0 && (
            <div className="card p-12 text-center">
              <h3 className="text-xl font-medium mb-2">No analyses yet</h3>
              <p className="text-gray-400 mb-6">Create your first SWOT analysis to get started</p>
              <Link 
                href="/new" 
                className="button-primary"
              >
                Create Analysis
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
