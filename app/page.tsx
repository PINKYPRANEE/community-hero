'use client'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

export default function Home() {
  // Explicitly tell TypeScript this array stores object structures
  const [issues, setIssues] = useState<any[]>([])

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    const { data } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) setIssues(data)
  }

  // Explicitly declaring variable types to clear parameter line warnings
  const handleVote = async (e: React.MouseEvent, id: any, currentVotes: number) => {
    e.preventDefault() // Prevents the <a> tag link from hijacking the click event
    e.stopPropagation() // Prevents the event from bubbling up to the card parent
    await supabase.from('issues').update({ votes: (currentVotes || 0) + 1 }).eq('id', id)
    fetchIssues()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏘️</span>
          <span className="text-xl font-bold text-blue-600">CommunityHero</span>
        </div>
        <div className="flex gap-3">
          <a href="/dashboard" className="px-4 py-2 text-blue-600 font-medium hover:underline">Dashboard</a>
          <a href="/map" className="px-4 py-2 text-blue-600 font-medium hover:underline">Map</a>
          <a href="/report" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Report Issue</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Report. Track. <span className="text-blue-600">Resolve.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-8 max-w-xl mx-auto">
          Help fix your community — report potholes, broken streetlights, water leaks and more in seconds.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/report" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700">
            🚨 Report an Issue
          </a>
          <a href="/map" className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl text-lg font-semibold hover:bg-blue-50">
            🗺️ View Map
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-3 gap-6 max-w-3xl mx-auto px-4 mb-16">
        <div className="bg-white rounded-2xl p-6 text-center shadow">
          <div className="text-4xl font-bold text-blue-600">{issues.length}</div>
          <div className="text-gray-500 mt-1">Issues Reported</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow">
          <div className="text-4xl font-bold text-green-500">
            {issues.filter((i: any) => i.status === 'Resolved').length}
          </div>
          <div className="text-gray-500 mt-1">Issues Resolved</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow">
          <div className="text-4xl font-bold text-orange-500">
            {issues.reduce((sum: number, i: any) => sum + (i.votes || 0), 0)}
          </div>
          <div className="text-gray-500 mt-1">Total Votes</div>
        </div>
      </section>

      {/* Recent Issues */}
      <section className="max-w-3xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🔴 Recent Issues</h2>
        {issues.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow text-gray-400">
            No issues reported yet. Be the first! 🦸
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {issues.map((issue: any) => (
              <a 
                href={`/issue/${issue.id}`} 
                key={issue.id} 
                className="bg-white rounded-2xl p-5 shadow flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">
                    {issue.category === 'Pothole' ? '🕳️' :
                     issue.category === 'Water Leak' ? '💧' :
                     issue.category === 'Streetlight' ? '💡' :
                     issue.category === 'Waste' ? '🗑️' :
                     issue.category === 'Tree Fall' ? '🌳' : '🏗️'}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-800 edit-title">{issue.title}</div>
                    <div className="text-sm text-gray-400">📍 {issue.location || 'Local Community'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    issue.status === 'Resolved' ? 'bg-green-100 text-green-600' :
                    issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>{issue.status || 'Reported'}</span>
                  <button 
                    onClick={(e) => handleVote(e, issue.id, issue.votes)}
                    className="text-gray-400 text-sm hover:text-blue-500 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 transition flex items-center gap-1"
                  >
                    👍 {issue.votes || 0}
                  </button>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}