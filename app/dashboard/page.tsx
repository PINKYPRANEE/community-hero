'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [issues, setIssues] = useState<any[]>([])

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    const { data } = await supabase.from('issues').select('*')
    if (data) setIssues(data)
  }

  const total = issues.length
  const resolved = issues.filter(i => i.status === 'Resolved').length
  const inProgress = issues.filter(i => i.status === 'In Progress').length
  const reported = issues.filter(i => i.status === 'Reported').length
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0

  const categories = ['Pothole', 'Water Leak', 'Streetlight', 'Waste', 'Tree Fall', 'Infrastructure']
  
  // Explicitly defining indexing for TypeScript
  const categoryIcons: { [key: string]: string } = { 
    'Pothole': '🕳️', 
    'Water Leak': '💧', 
    'Streetlight': '💡', 
    'Waste': '🗑️', 
    'Tree Fall': '🌳', 
    'Infrastructure': '🏗️' 
  }

  const categoryCount = categories.map(cat => ({
    name: cat,
    icon: categoryIcons[cat] || '📍',
    count: issues.filter(i => i.category === cat).length
  }))

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">          <span className="text-2xl">🏘️</span>
          <span className="text-xl font-bold text-blue-600">CommunityHero</span>
        </div>
        <a href="/" className="text-blue-600 hover:underline">← Back to Home</a>
      </nav>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Impact Dashboard</h1>
        <p className="text-gray-500 mb-8">Real-time community issue tracking</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow text-center">
            <div className="text-4xl font-bold text-blue-600">{total}</div>
            <div className="text-gray-500 text-sm mt-1">Total Issues</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow text-center">
            <div className="text-4xl font-bold text-green-500">{resolved}</div>
            <div className="text-gray-500 text-sm mt-1">Resolved</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow text-center">
            <div className="text-4xl font-bold text-yellow-500">{inProgress}</div>
            <div className="text-gray-500 text-sm mt-1">In Progress</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow text-center">
            <div className="text-4xl font-bold text-purple-500">{resolutionRate}%</div>
            <div className="text-gray-500 text-sm mt-1">Resolution Rate</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📂 Issues by Category</h2>
          <div className="flex flex-col gap-3">
            {categoryCount.map(({ name, icon, count }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xl w-8">{icon}</span>
                <span className="text-gray-700 w-32 text-sm">{name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4">
                  <div className="bg-blue-500 h-4 rounded-full transition-all" style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}></div>
                </div>
                <span className="text-gray-600 text-sm w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Status Overview</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-red-500">{reported}</div>
              <div className="text-red-400 text-sm mt-1">🔴 Reported</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-yellow-500">{inProgress}</div>
              <div className="text-yellow-400 text-sm mt-1">🟡 In Progress</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-500">{resolved}</div>
              <div className="text-green-400 text-sm mt-1">🟢 Resolved</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🕐 Recent Activity</h2>
          <div className="flex flex-col gap-3">
            {issues.slice(0, 5).map((issue) => (
              <div key={issue.id} className="flex items-center gap-3 py-2 border-b border-gray-50">
                <span className="text-2xl">
                  {issue.category === 'Pothole' ? '🕳️' : 
                   issue.category === 'Water Leak' ? '💧' : 
                   issue.category === 'Streetlight' ? '💡' : 
                   issue.category === 'Waste' ? '🗑️' : 
                   issue.category === 'Tree Fall' ? '🌳' : '🏗️'}
                </span>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 text-sm">{issue.title}</div>
                  <div className="text-xs text-gray-400">{issue.location}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  issue.status === 'Resolved' ? 'bg-green-100 text-green-600' :
                  issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                }`}>{issue.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}