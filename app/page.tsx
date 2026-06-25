'use client'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

export default function Home() {
  const [issues, setIssues] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  const [toast, setToast] = useState<{ message: string; show: boolean; type: 'success' | 'error' }>({
    message: '',
    show: false,
    type: 'success'
  })

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    const { data } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setIssues(data)
  }

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, show: true, type })
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }))
    }, 3000)
  }

  const handleVote = async (e: React.MouseEvent, id: any, currentVotes: number) => {
    e.preventDefault()
    e.stopPropagation()
    const { error } = await supabase.from('issues').update({ votes: (currentVotes || 0) + 1 }).eq('id', id)
    if (error) {
      triggerToast('Failed to register upvote. Please try again.', 'error')
    } else {
      triggerToast('Upvote recorded successfully! 👍', 'success')
      fetchIssues()
    }
  }

  const filteredIssues = issues.filter((issue) => {
    const matchesCategory = selectedCategory === 'All' || issue.category === selectedCategory
    const matchesStatus = selectedStatus === 'All' || issue.status === selectedStatus
    return matchesCategory && matchesStatus
  })

  return (
    <main className="min-h-screen bg-gray-50 relative">

      {/* Toast */}
      <div className={`fixed top-5 right-5 z-50 transform transition-all duration-300 pointer-events-none ${
        toast.show ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
      }`}>
        <div className={`px-5 py-3.5 rounded-xl shadow-lg border text-sm font-bold flex items-center gap-2 max-w-md ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          <p>{toast.message}</p>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="36" height="36" viewBox="0 0 90 110">
            <path d="M15 10 L75 10 L88 28 L88 82 L45 108 L2 82 L2 28 Z" fill="#2563EB"/>
            <path d="M20 20 L70 20 L80 33 L80 78 L45 100 L10 78 L10 33 Z" fill="#1D4ED8"/>
            <polygon points="45,30 28,48 36,48 36,65 54,65 54,48 62,48" fill="white"/>
            <rect x="33" y="53" width="24" height="12" fill="#60A5FA"/>
            <circle cx="45" cy="78" r="7" fill="#EF4444"/>
            <path d="M45 85 L40 76 Q45 70 50 76 Z" fill="#EF4444"/>
            <circle cx="45" cy="78" r="3" fill="white"/>
          </svg>
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
      <section className="text-center py-20 px-4 bg-gradient-to-b from-blue-50 to-gray-50">
        <div className="inline-block mb-6 animate-bounce">
          <svg width="80" height="80" viewBox="0 0 90 110">
            <path d="M15 10 L75 10 L88 28 L88 82 L45 108 L2 82 L2 28 Z" fill="#2563EB"/>
            <path d="M20 20 L70 20 L80 33 L80 78 L45 100 L10 78 L10 33 Z" fill="#1D4ED8"/>
            <polygon points="45,30 28,48 36,48 36,65 54,65 54,48 62,48" fill="white"/>
            <rect x="33" y="53" width="24" height="12" fill="#60A5FA"/>
            <circle cx="45" cy="78" r="7" fill="#EF4444"/>
            <path d="M45 85 L40 76 Q45 70 50 76 Z" fill="#EF4444"/>
            <circle cx="45" cy="78" r="3" fill="white"/>
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
          Report. Track. <span className="text-blue-600 animate-pulse">Resolve.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-8 max-w-xl mx-auto animate-fade-in">
          Help fix your community — report potholes, broken streetlights, water leaks and more in seconds.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/report" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg shadow-blue-200">
            🚨 Report an Issue
          </a>
          <a href="/map" className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl text-lg font-semibold hover:bg-blue-50 hover:scale-110 active:scale-95 transition-all duration-200">
            🗺️ View Map
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-3 gap-6 max-w-3xl mx-auto px-4 mb-16 mt-10">
        <div className="bg-white rounded-2xl p-6 text-center shadow stat-card hover:scale-105 transition-transform duration-200">
          <div className="text-4xl font-bold text-blue-600">{issues.length}</div>
          <div className="text-gray-500 mt-1">Issues Reported</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow stat-card hover:scale-105 transition-transform duration-200">
          <div className="text-4xl font-bold text-green-500">
            {issues.filter((i: any) => i.status === 'Resolved').length}
          </div>
          <div className="text-gray-500 mt-1">Issues Resolved</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow stat-card hover:scale-105 transition-transform duration-200">
          <div className="text-4xl font-bold text-orange-500">
            {issues.reduce((sum: number, i: any) => sum + (i.votes || 0), 0)}
          </div>
          <div className="text-gray-500 mt-1">Total Votes</div>
        </div>
      </section>

      {/* Recent Issues */}
      <section className="max-w-3xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🔴 Recent Issues</h2>

        {/* Filters */}
        <div className="bg-white p-5 rounded-2xl shadow mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-gray-400 mr-2">Category:</span>
            {['All', 'Pothole', 'Water Leak', 'Streetlight', 'Waste', 'Tree Fall', 'Infrastructure'].map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center border-t border-gray-100 pt-3">
            <span className="text-sm font-semibold text-gray-400 mr-4">Status:</span>
            {['All', 'Reported', 'In Progress', 'Resolved'].map((stat) => (
              <button key={stat} onClick={() => setSelectedStatus(stat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  selectedStatus === stat
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}>
                {stat}
              </button>
            ))}
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow text-gray-400 font-medium">
            🔍 No matching issues found for this filter combination.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredIssues.map((issue: any) => (
              <a href={`/issue/${issue.id}`} key={issue.id}
                className="issue-card bg-white rounded-2xl p-5 shadow flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">
                    {issue.category === 'Pothole' ? '🕳️' :
                     issue.category === 'Water Leak' ? '💧' :
                     issue.category === 'Streetlight' ? '💡' :
                     issue.category === 'Waste' ? '🗑️' :
                     issue.category === 'Tree Fall' ? '🌳' : '🏗️'}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-800">{issue.title}</div>
                    <div className="text-sm text-gray-400">📍 {issue.location || 'Local Community'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    issue.status === 'Resolved' ? 'bg-green-100 text-green-600' :
                    issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>{issue.status || 'Reported'}</span>
                  <button onClick={(e) => handleVote(e, issue.id, issue.votes)}
                    className="text-gray-400 text-sm hover:text-blue-500 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 transition flex items-center gap-1">
                    👍 {issue.votes || 0}
                  </button>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* AI Chatbot */}
      <ChatBot />
    </main>
  )
}

function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([
    { role: 'bot', text: '👋 Hi! I am CommunityHero AI. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry something went wrong!' }])
    }
    setLoading(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <div className="text-white font-bold text-sm">CommunityHero AI</div>
                <div className="text-blue-200 text-xs">Always here to help!</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white hover:text-blue-200 text-xl">×</button>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-700 shadow-sm rounded-bl-none border border-gray-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-2 rounded-2xl text-sm shadow-sm border border-gray-100 text-gray-400 animate-pulse">
                  🤖 Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button onClick={sendMessage}
              className="bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 text-sm font-bold">
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button onClick={() => setOpen(!open)}
        className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all duration-200 flex items-center justify-center text-2xl">
        {open ? '✕' : '🤖'}
      </button>
    </div>
  )
}