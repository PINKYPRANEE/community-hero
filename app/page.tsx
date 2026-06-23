'use client'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

export default function Home() {
  const [issues, setIssues] = useState<any[]>([])
  // State variables for keeping track of active filter selections
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    const { data } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20) // Increased so filters have plenty of sample tickets to sort through!
    if (data) setIssues(data)
  }

  const handleVote = async (e: React.MouseEvent, id: any, currentVotes: number) => {
    e.preventDefault() 
    e.stopPropagation() 
    await supabase.from('issues').update({ votes: (currentVotes || 0) + 1 }).eq('id', id)
    fetchIssues()
  }

  // Computes the exact matching cards to show instantly on the dashboard screen
  const filteredIssues = issues.filter((issue) => {
    const matchesCategory = selectedCategory === 'All' || issue.category === selectedCategory
    const matchesStatus = selectedStatus === 'All' || issue.status === selectedStatus
    return matchesCategory && matchesStatus
  })

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
          <a href="/leaderboard" className="px-4 py-2 text-blue-600 font-medium hover:underline">🏆 Leaderboard</a>
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

      {/* Recent Issues Panel */}
      <section className="max-w-3xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🔴 Recent Issues</h2>

        {/* Clean, Responsive Search & Filter Control Deck */}
        <div className="bg-white p-5 rounded-2xl shadow mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-gray-400 mr-2">Category:</span>
            {['All', 'Pothole', 'Water Leak', 'Streetlight', 'Waste', 'Tree Fall', 'Infrastructure'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center border-t border-gray-100 pt-3">
            <span className="text-sm font-semibold text-gray-400 mr-4">Status:</span>
            {['All', 'Reported', 'In Progress', 'Resolved'].map((stat) => (
              <button
                key={stat}
                onClick={() => setSelectedStatus(stat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  selectedStatus === stat
                    ? 'bg-gray-800 text-white border-gray-800 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {stat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic List Rendering Area */}
        {filteredIssues.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow text-gray-400 font-medium">
            🔍 No matching issues found for this filter combination.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredIssues.map((issue: any) => (
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