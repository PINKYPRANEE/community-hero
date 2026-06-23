'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function IssueDetail({ params }: { params: { id: string } }) {
  const [issue, setIssue] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIssue()
  }, [])

  const fetchIssue = async () => {
    const { data } = await supabase
      .from('issues')
      .select('*')
      .eq('id', params.id)
      .single()
    if (data) setIssue(data)
    setLoading(false)
  }

  const handleVote = async () => {
    await supabase
      .from('issues')
      .update({ votes: (issue.votes || 0) + 1 })
      .eq('id', params.id)
    fetchIssue()
  }

  const handleStatus = async (status: string) => {
    await supabase
      .from('issues')
      .update({ status })
      .eq('id', params.id)
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl animate-pulse">⏳ Loading...</div>
    </div>
  )

  if (!issue) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl">❌ Issue not found</div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏘️</span>
          <span className="text-xl font-bold text-blue-600">CommunityHero</span>
        </div>
        <a href="/" className="text-blue-600 hover:underline">← Back to Home</a>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">{getIcon(issue.category)}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{issue.title}</h1>
              <div className="text-gray-400 text-sm mt-1">📍 {issue.location}</div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-4 py-1 rounded-full text-sm font-medium ${
              issue.status === 'Resolved' ? 'bg-green-100 text-green-600' :
              issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            }`}>{issue.status}</span>
            <span className="px-4 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-600">
              {issue.category}
            </span>
            <span className={`px-4 py-1 rounded-full text-sm font-medium ${
              issue.severity === 'High' ? 'bg-red-100 text-red-600' :
              issue.severity === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
              'bg-green-100 text-green-600'
            }`}>⚠️ {issue.severity} Severity</span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">📄 Description</h2>
          <p className="text-gray-600">{issue.description || 'No description provided.'}</p>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📈 Status Timeline</h2>
          <div className="flex items-center gap-2">
            {['Reported', 'In Progress', 'Resolved'].map((status, i) => (
              <div key={status} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  issue.status === 'Resolved' ? 'bg-green-500 text-white' :
                  issue.status === 'In Progress' && i <= 1 ? 'bg-yellow-500 text-white' :
                  i === 0 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>{i + 1}</div>
                <span className="text-sm text-gray-600">{status}</span>
                {i < 2 && <div className="flex-1 h-1 bg-gray-200 rounded"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">⚡ Actions</h2>
          
          {/* Vote */}
          <button onClick={handleVote}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 mb-3">
            👍 Upvote this Issue ({issue.votes || 0} votes)
          </button>

          {/* Status Update */}
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => handleStatus('Reported')}
              className={`py-2 rounded-xl text-sm font-medium border ${issue.status === 'Reported' ? 'bg-red-100 border-red-400 text-red-600' : 'border-gray-200 text-gray-500 hover:border-red-300'}`}>
              🔴 Reported
            </button>
            <button onClick={() => handleStatus('In Progress')}
              className={`py-2 rounded-xl text-sm font-medium border ${issue.status === 'In Progress' ? 'bg-yellow-100 border-yellow-400 text-yellow-600' : 'border-gray-200 text-gray-500 hover:border-yellow-300'}`}>
              🟡 In Progress
            </button>
            <button onClick={() => handleStatus('Resolved')}
              className={`py-2 rounded-xl text-sm font-medium border ${issue.status === 'Resolved' ? 'bg-green-100 border-green-400 text-green-600' : 'border-gray-200 text-gray-500 hover:border-green-300'}`}>
              🟢 Resolved
            </button>
          </div>
        </div>

        {/* Share */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📤 Share this Issue</h2>
          <div className="flex gap-3">
            <button onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              alert('Link copied!')
            }} className="flex-1 py-3 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 font-medium">
              🔗 Copy Link
            </button>
            <a href={`https://wa.me/?text=Check this community issue: ${window.location.href}`}
              target="_blank"
              className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium text-center hover:bg-green-600">
              📱 WhatsApp
            </a>
          </div>
        </div>

      </div>
    </main>
  )
}