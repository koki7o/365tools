import Link from 'next/link'
import { getSwotAnalysis } from '@/lib/db'
import AddItemForm from './AddItemForm'
import EditTitleForm from './EditTitleForm'
import { DeleteButton, DeleteItemButton } from './DeleteButtons'

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params)
  const analysis = await getSwotAnalysis(resolvedParams.id)
  return {
    title: analysis ? `${analysis.title} - SWOT Analysis` : 'SWOT Analysis'
  }
}

export default async function AnalysisPage({ params }) {
  const resolvedParams = await Promise.resolve(params)
  const analysis = await getSwotAnalysis(resolvedParams.id)
  
  if (!analysis) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <Link 
              href="/"
              className="text-[#00E6A7] hover:opacity-80 mb-4 inline-block"
            >
              ← Back to Analyses
            </Link>
            <h1 className="text-3xl font-bold">Analysis not found</h1>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <Link 
            href="/"
            className="text-[#00E6A7] hover:opacity-80 mb-4 inline-block"
          >
            ← Back to Analyses
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{analysis.title}</h1>
              <EditTitleForm id={analysis.id} initialTitle={analysis.title} />
            </div>
            <DeleteButton id={analysis.id} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-[#00E6A7] mb-6">Strengths</h2>
            <AddItemForm analysisId={analysis.id} type="strength" />
            <ul className="mt-6 space-y-3">
              {analysis.strengths.map((item) => (
                <li key={item.id} className="p-4 rounded bg-[#1E1E1E] border border-[#2A2A2A] group flex justify-between items-start">
                  <span>{item.content}</span>
                  <DeleteItemButton id={item.id} analysisId={analysis.id} />
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-[#00E6A7] mb-6">Weaknesses</h2>
            <AddItemForm analysisId={analysis.id} type="weakness" />
            <ul className="mt-6 space-y-3">
              {analysis.weaknesses.map((item) => (
                <li key={item.id} className="p-4 rounded bg-[#1E1E1E] border border-[#2A2A2A] group flex justify-between items-start">
                  <span>{item.content}</span>
                  <DeleteItemButton id={item.id} analysisId={analysis.id} />
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-[#00E6A7] mb-6">Opportunities</h2>
            <AddItemForm analysisId={analysis.id} type="opportunity" />
            <ul className="mt-6 space-y-3">
              {analysis.opportunities.map((item) => (
                <li key={item.id} className="p-4 rounded bg-[#1E1E1E] border border-[#2A2A2A] group flex justify-between items-start">
                  <span>{item.content}</span>
                  <DeleteItemButton id={item.id} analysisId={analysis.id} />
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-[#00E6A7] mb-6">Threats</h2>
            <AddItemForm analysisId={analysis.id} type="threat" />
            <ul className="mt-6 space-y-3">
              {analysis.threats.map((item) => (
                <li key={item.id} className="p-4 rounded bg-[#1E1E1E] border border-[#2A2A2A] group flex justify-between items-start">
                  <span>{item.content}</span>
                  <DeleteItemButton id={item.id} analysisId={analysis.id} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
