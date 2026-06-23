'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function IssueDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [issue, setIssue] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchIssue()
    }
  }, [id]) // Crucial fix: re-run fetch when Next.js successfully extracts the ID from the URL

  const fetchIssue = async () => {
    const { data } = await supabase
      .from('issues')
      .select('*')
      .eq('id', id)
      .single()
    if (data) setIssue(data)
    setLoading(false)
  }

  const handleVote = async () => {
    await supabase
      .from('issues')
      .update({ votes: (issue.votes || 0) + 1 })
      .eq('id', id)
    fetchIssue()
  }

  const handleStatus = async (status: string) => {
    await supabase
      .from('issues')
      .update({ status })
      .eq('id', id)
    fetchIssue()
  }

  const getIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Pothole': '🕳️', 'Water Leak': '💧', 'Streetlight': '💡',
      'Waste': '🗑️', 'Tree Fall': '🌳', 'Infrastructure': '🏗️'
    }
    return icons[category] || '📍'
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-xl font-bold text-blue-600 animate-pulse">⏳ Loading issue details...</div>
    </div>
  )

  if (!issue) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-2xl font-bold text-gray-800 mb-4">❌ Issue not found</div>
      <button onClick={() => router.push('/')} className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow">
        Back to Home
      </button>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏘️</span>
          <span className="text-xl font-bold text-blue-600">CommunityHero</span>
        </div>
        <a href="/" className="text-blue-600 font-medium hover:underline">← Back to Home</a>
      </nav>

      {/* Main Container split into a beautiful two-column layout for Judge Impact */}
      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Media Evidence Presentation */}
        <div className="md:col-span-6 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">📸 Uploaded Evidence</h2>
            {issue.image_url ? (
              <img 
                src={issue.image_url} 
                alt={issue.title} 
                className="w-full h-auto max-h-[400px] object-cover rounded-xl border border-gray-100 shadow-inner" 
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-2 border-2 border-dashed border-gray-200">
                <span className="text-3xl">🖼️</span>
                <span className="text-xs font-semibold">No visual attachment available</span>
              </div>
            )}
          </div>

          {/* Location Box */}
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">📍 Registered Area</h2>
            <div className="font-bold text-gray-800 text-lg">{issue.location || 'Local Community'}</div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Data, Timelines & Controls */}
        <div className="md:col-span-6 flex flex-col gap-6">
          
          {/* Header Data Card */}
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">{getIcon(issue.category)}</span>
              <div>
                <h1 className="text-2xl font-black text-gray-800 leading-tight">{issue.title}</h1>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-600">
                    {issue.category}
                  </span>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                    issue.severity === 'High' ? 'bg-red-100 text-red-600' :
                    issue.severity === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    ⚠️ {issue.severity || 'Medium'} Severity
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">📄 Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{issue.description || 'No descriptive details available for this ticket.'}</p>
            </div>
          </div>

          {/* Progress Tracker Status Line */}
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">📈 Status Resolution Timeline</h2>
            <div className="flex items-center gap-2">
              {['Reported', 'In Progress', 'Resolved'].map((statusName, i) => (
                <div key={statusName} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
                    issue.status === 'Resolved' ? 'bg-green-500 text-white' :
                    issue.status === 'In Progress' && i <= 1 ? 'bg-yellow-500 text-white' :
                    i === 0 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}>{i + 1}</div>
                  <span className={`text-xs font-bold ${
                    issue.status === statusName ? 'text-gray-800' : 'text-gray-400'
                  }`}>{statusName}</span>
                  {i < 2 && <div className="flex-1 h-0.5 bg-gray-200 rounded"></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Action Center Block */}
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">⚡ Action Hub</h2>
            
            <button 
              onClick={handleVote}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-100 active:scale-[0.99] transition-all"
            >
              👍 Upvote this Issue ({issue.votes || 0} votes)
            </button>

            <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
              <button onClick={() => handleStatus('Reported')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${issue.status === 'Reported' ? 'bg-red-100 border-red-400 text-red-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                🔴 Reported
              </button>
              <button onClick={() => handleStatus('In Progress')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${issue.status === 'In Progress' ? 'bg-yellow-100 border-yellow-400 text-yellow-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                🟡 In Progress
              </button>
              <button onClick={() => handleStatus('Resolved')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${issue.status === 'Resolved' ? 'bg-green-100 border-green-400 text-green-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                🟢 Resolved
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}