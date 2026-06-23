'use client'
import { useState, useEffect } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { supabase } from '../lib/supabase'

const mapContainerStyle = { width: '100%', height: '550px' }
// Default map center set near your local core hub coordinates
const defaultCenter = { lat: 13.6288, lng: 79.4192 }

export default function MapPage() {
  const [issues, setIssues] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    const { data } = await supabase.from('issues').select('*')
    if (data) setIssues(data)
    setLoading(false)
  }

  const getIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Pothole': '🕳️', 'Water Leak': '💧', 'Streetlight': '💡',
      'Waste': '🗑️', 'Tree Fall': '🌳', 'Infrastructure': '🏗️'
    }
    return icons[category] || '📍'
  }

  // 🗺️ Extract explicit coordinates safely or fallback to text parsing if needed
  const getPosition = (issue: any) => {
    if (issue.latitude && issue.longitude) {
      return { lat: parseFloat(issue.latitude), lng: parseFloat(issue.longitude) }
    }
    // Backward compatibility for old records storing text coordinates strings
    if (issue.location && issue.location.includes(',')) {
      const parts = issue.location.split(',')
      const lat = parseFloat(parts[0])
      const lng = parseFloat(parts[1])
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
    }
    return defaultCenter
  }

  // 📍 Dynamic Colored Marker Customization for Google Maps Engine
  const getMarkerIconUrl = (status: string) => {
    if (status === 'Resolved') {
      return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    }
    if (status === 'In Progress') {
      return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
    }
    return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' // Default reported phase pin
  }

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

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Legend Layout Wrapper */}
        <div className="bg-white p-5 rounded-2xl shadow mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border border-gray-100">
          <div>
            <h1 className="text-3xl font-black text-gray-800">🗺️ Real-Time Incident Spatial Matrix</h1>
            <p className="text-xs text-gray-400 mt-0.5">Auto-detected hardware telemetry coordinates mapped directly by status keys.</p>
          </div>
          
          {/* Color Pin Explanations Swatches Indicators */}
          <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 block" /> Reported (Red)</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400 block" /> In Progress (Yellow)</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 block" /> Resolved (Green)</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT LIST PANEL */}
          <div className="lg:col-span-4 flex flex-col gap-3 max-h-[550px] overflow-y-auto pr-1">
            <h2 className="font-bold text-gray-700 text-sm tracking-wide uppercase px-1">📋 Telemetry Feeds ({issues.length})</h2>
            
            {loading ? (
              <div className="text-center py-10 text-gray-400 text-sm animate-pulse font-medium">⏳ Fetching matrix nodes...</div>
            ) : issues.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm font-medium">No active incident reports located.</div>
            ) : (
              issues.map((issue) => (
                <div 
                  key={issue.id} 
                  onClick={() => setSelected(issue)}
                  className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all cursor-pointer ${
                    selected?.id === issue.id ? 'border-blue-500 shadow-md scale-[1.01]' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getIcon(issue.category)}</span>
                      <span className="font-bold text-gray-800 text-sm line-clamp-1">{issue.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border">
                      {issue.severity || 'Medium'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-medium truncate mt-1">📍 {issue.location}</div>
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                      issue.status === 'Resolved' ? 'bg-green-50 text-green-600 border-green-100' :
                      issue.status === 'In Progress' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 
                      'bg-red-50 text-red-600 border-red-100'
                    }`}>{issue.status || 'Reported'}</span>
                    <span className="text-xs text-gray-500 font-bold">👍 {issue.votes || 0} votes</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT MAP RENDER WORKSPACE */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl overflow-hidden shadow-md border border-gray-100">
              <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}>
                <GoogleMap 
                  mapContainerStyle={mapContainerStyle} 
                  center={selected ? getPosition(selected) : defaultCenter} 
                  zoom={12}
                >
                  {issues.map((issue) => (
                    <Marker 
                      key={issue.id} 
                      position={getPosition(issue)} 
                      onClick={() => setSelected(issue)}
                      icon={{
                        url: getMarkerIconUrl(issue.status),
                        scaledSize: new window.google.maps.Size(32, 32)
                      }}
                    />
                  ))}

                  {selected && (
                    <InfoWindow 
                      position={getPosition(selected)} 
                      onCloseClick={() => setSelected(null)}
                    >
                      <div className="p-2 min-w-[200px] bg-white">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-lg">{getIcon(selected.category)}</span>
                          <span className="font-black text-gray-800 text-sm">{selected.title}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1"><strong>Location:</strong> {selected.location}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          {selected.latitude ? selected.latitude.toFixed(4) : '0.0000'}, {selected.longitude ? selected.longitude.toFixed(4) : '0.0000'}
                        </p>
                        
                        <div className="flex justify-between items-center mt-3 border-t pt-2 border-gray-100">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            selected.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                            selected.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'
                          }`}>{selected.status || 'Reported'}</span>
                          <a 
                            href={`/issue/${selected.id}`} 
                            className="text-xs font-bold text-blue-600 hover:underline"
                          >
                            View Details →
                          </a>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </LoadScript>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}