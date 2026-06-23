'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRealLeaderboardData()
  }, [])

  const fetchRealLeaderboardData = async () => {
    setLoading(true)
    // 1. Fetch all issues from your real Supabase table
    const { data: allIssues, error } = await supabase
      .from('issues')
      .select('location, status, votes')

    if (error || !allIssues) {
      console.error("Error fetching leaderboard data:", error)
      setLoading(false)
      return
    }

    // 2. Group data by 'location' or 'reporter' name to compile aggregate scores
    // Since location (e.g., "Nellore, Ward 5") is standard in your records, we'll rank areas/groups!
    const groupStats: { [key: string]: { name: string; reports: number; resolved: number; points: number } } = {}

    allIssues.forEach((issue) => {
      // Fallback label if location field is empty string
      const groupName = issue.location?.trim() || "Anonymous Hero"

      if (!groupStats[groupName]) {
        groupStats[groupName] = { name: groupName, reports: 0, resolved: 0, points: 0 }
      }

      // Calculate weight systems
      groupStats[groupName].reports += 1
      if (issue.status === 'Resolved') {
        groupStats[groupName].resolved += 1
      }

      // Points formula: (Reports * 100) + (Votes * 10) + (Resolved * 500)
      const issuePoints = 100 + ((issue.votes || 0) * 10) + (issue.status === 'Resolved' ? 500 : 0)
      groupStats[groupName].points += issuePoints
    })

    // 3. Transform map object data into a clean sorted ranking array
    const sortedLeaders = Object.values(groupStats)
      .sort((a, b) => b.points - a.points)
      .map((item: any, index: number) => {
        let badge = "🌱 Active Citizen"
        if (index === 0) badge = "🥇 Grand Hero"
        else if (index === 1) badge = "🥈 Elite Guardian"
        else if (index === 2) badge = "🥉 Civic Sentinel"
        else if (index < 5) badge = "🛡️ Neighborhood Watch"

        return {
          rank: index + 1,
          name: item.name,
          points: item.points,
          reports: item.reports,
          resolved: item.resolved,
          badge: badge
        }
      })

    setLeaders(sortedLeaders)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-bold text-blue-600 animate-pulse">📊 Calculating real-time civic scores...</div>
      </div>
    )
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
          <a href="/" className="px-4 py-2 text-blue-600 font-medium hover:underline">Home</a>
          <a href="/map" className="px-4 py-2 text-blue-600 font-medium hover:underline">Map</a>
          <a href="/report" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Report Issue</a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-3">🏆 Community Leaderboard</h1>
          <p className="text-gray-500 text-md">Real-time civic performance metrics driven directly by citizen resolution actions.</p>
        </div>

        {leaders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow text-gray-400 font-medium">
            🏆 No leaderboard activity recorded yet. Start reporting to claim #1!
          </div>
        ) : (
          <>
            {/* Dynamic Podiums Layout */}
            <div className="grid grid-cols-3 gap-4 items-end mb-12 text-center">
              {/* 2nd Place */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-40 flex flex-col justify-center items-center order-1">
                <span className="text-3xl">{leaders[1] ? '🥈' : '⬜'}</span>
                <div className="font-bold text-gray-700 text-xs mt-1 truncate max-w-full px-1">{leaders[1]?.name || 'Waiting...'}</div>
                <div className="text-blue-600 text-xs font-black mt-1">{leaders[1] ? `${leaders[1].points} pts` : '-'}</div>
              </div>
              {/* 1st Place */}
              <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-yellow-400 h-48 flex flex-col justify-center items-center order-2 scale-105 shadow-yellow-50">
                <span className="text-4xl">👑</span>
                <div className="font-black text-gray-800 text-sm mt-1 truncate max-w-full px-1">{leaders[0]?.name}</div>
                <div className="text-blue-600 text-sm font-black mt-1">{leaders[0]?.points} pts</div>
                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold mt-2">{leaders[0]?.badge}</span>
              </div>
              {/* 3rd Place */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-36 flex flex-col justify-center items-center order-3">
                <span className="text-3xl">{leaders[2] ? '🥉' : '⬜'}</span>
                <div className="font-bold text-gray-700 text-xs mt-1 truncate max-w-full px-1">{leaders[2]?.name || 'Waiting...'}</div>
                <div className="text-blue-600 text-xs font-black mt-1">{leaders[2] ? `${leaders[2].points} pts` : '-'}</div>
              </div>
            </div>

            {/* Complete Data Matrix Grid */}
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="p-5 border-b border-gray-100 font-bold text-gray-400 text-xs tracking-wider uppercase grid grid-cols-12">
                <div className="col-span-2 text-center">Rank</div>
                <div className="col-span-5">Location Hub</div>
                <div className="col-span-2 text-center">Resolved</div>
                <div className="col-span-3 text-right pr-4">Total Score</div>
              </div>

              <div className="divide-y divide-gray-100">
                {leaders.map((leader) => (
                  <div key={leader.rank} className="p-5 grid grid-cols-12 items-center hover:bg-gray-50 transition-colors">
                    <div className="col-span-2 text-center font-black text-lg text-gray-400">
                      #{leader.rank}
                    </div>
                    <div className="col-span-5">
                      <div className="font-bold text-gray-800 truncate pr-2">{leader.name}</div>
                      <div className="text-xs text-gray-400 font-medium">{leader.badge}</div>
                    </div>
                    <div className="col-span-2 text-center font-semibold text-gray-600 text-sm">
                      {leader.resolved} / {leader.reports} ✅
                    </div>
                    <div className="col-span-3 text-right pr-4 font-black text-blue-600 text-base">
                      {leader.points} <span className="text-xs font-medium text-gray-400">pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}