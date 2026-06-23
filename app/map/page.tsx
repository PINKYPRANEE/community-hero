'use client'
import { useState, useEffect } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { supabase } from '../lib/supabase'

const mapContainerStyle = { width: '100%', height: '450px' }
const center = { lat: 14.4426, lng: 79.9865 } // Nellore, India

export default function MapPage() {
  const [issues, setIssues] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    const { data } = await supabase.from('issues').select('*')
    if (data) setIssues(data)
  }

  const getIcon = (category) => {
    const icons = {
      'Pothole': '🕳️', 'Water Leak': '💧', 'Streetlight': '💡',
      'Waste': '🗑️', 'Tree Fall': '🌳', 'Infrastructure': '🏗️'
    }
    return icons[category] || '📍'
  }

  // Generate position near Nellore based on index
  const getPosition = (issue, index) => {
    if (issue.location && issue.location.includes(',')) {
      const parts = issue.location.split(',')
      const lat = parseFloat(parts[0])
      const lng = parseFloat(parts[1])
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
    }
    return {
      lat: 14.4426 + (index * 0.01),
      lng: 79.9865 + (index * 0.01)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏘️</span>
          <span className="text-xl font-bold text-blue-600">CommunityHero</span>
        </div>
        <a href="/" className="text-blue-600 hover:underline">← Back to Home</a>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🗺️ Issue Map</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Issues List */}
          <div className="flex flex-col gap-3">
            <h2 className="font-bold text-gray-700">📋 All Issues ({issues.length})</h2>
            {issues.map((issue, index) => (
              <div key={issue.id}
                onClick={() => setSelected(issue)}
                className={`bg-white rounded-xl p-4 shadow cursor-pointer border-2 transition-all ${selected?.id === issue.id ? 'border-blue-500' : 'border-transparent hover:border-blue-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{getIcon(issue.category)}</span>
                  <span className="font-semibold text-gray-800 text-sm">{issue.title}</span>
                </div>
                <div className="text-xs text-gray-400">📍 {issue.location}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    issue.status === 'Resolved' ? 'bg-green-100 text-green-600' :
                    issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>{issue.status}</span>
                  <span className="text-xs text-gray-400">👍 {issue.votes}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Google Map */}
          <div className="md:col-span-2">
            <div className="rounded-2xl overflow-hidden shadow">
              <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}>
                <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={13}>
                  {issues.map((issue, index) => (
                    <Marker
                      key={issue.id}
                      position={getPosition(issue, index)}
                      onClick={() => setSelected(issue)}
                      label={getIcon(issue.category)}
                    />
                  ))}
                  {selected && (
                    <InfoWindow
                      position={getPosition(selected, issues.indexOf(selected))}
                      onCloseClick={() => setSelected(null)}>
                      <div className="p-2">
                        <div className="font-bold text-gray-800">{selected.title}</div>
                        <div className="text-sm text-gray-500 mt-1">📍 {selected.location}</div>
                        <div className="text-sm text-gray-500">Category: {selected.category}</div>
                        <div className="text-sm text-gray-500">Severity: {selected.severity}</div>
                        <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          selected.status === 'Resolved' ? 'bg-green-100 text-green-600' :
                          selected.status === 'In Progress' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>{selected.status}</span>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </LoadScript>
            </div>

            {/* Legend */}
            <div className="mt-4 bg-white rounded-xl shadow p-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">Legend</div>
              <div className="flex gap-4 flex-wrap text-sm">
                <span>🕳️ Pothole</span>
                <span>💧 Water Leak</span>
                <span>💡 Streetlight</span>
                <span>🗑️ Waste</span>
                <span>🌳 Tree Fall</span>
                <span>🏗️ Infrastructure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}