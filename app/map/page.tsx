'use client'
import { useState, useEffect } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { supabase } from '../lib/supabase'

const mapContainerStyle = { width: '100%', height: '550px' }
// Baseline global standard view
const defaultCenter = { lat: 14.4426, lng: 79.9865 }

export default function MapPage() {
  const [issues, setIssues] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [currentMapCenter, setCurrentMapCenter] = useState(defaultCenter)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    const { data } = await supabase.from('issues').select('*')
    if (data && data.length > 0) {
      setIssues(data)
      // Automatically focus map canvas on the first available valid data coordinate
      const validNode = data.find(i => i.latitude && i.longitude)
      if (validNode) {
        setCurrentMapCenter({ lat: parseFloat(validNode.latitude), lng: parseFloat(validNode.longitude) })
      }
    }
    setLoading(false)
  }

  const getIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Pothole': '🕳️', 'Water Leak': '💧', 'Streetlight': '💡',
      'Waste': '🗑️', 'Tree Fall': '🌳', 'Infrastructure': '🏗️'
    }
    return icons[category] || '📍'
  }

  const getPosition = (issue: any) => {
    if (issue.latitude && issue.longitude) {
      return { lat: parseFloat(issue.latitude), lng: parseFloat(issue.longitude) }
    }
    if (issue.location && issue.location.includes(',')) {
      const parts = issue.location.split(',')
      const lat = parseFloat(parts[0])
      const lng = parseFloat(parts[1])
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
    }
    return defaultCenter
  }

  // Uses high-quality, explicitly styled custom pin configurations based on status
  const getMarkerIcon = (status: string) => {
    if (status === 'Resolved') {
      return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
    }
    if (status === 'In Progress') {
      return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
    }
    return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
  }

  const handleSelectIssue = (issue: any) => {
    setSelected(issue)
    setCurrentMapCenter(getPosition(issue))
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏘️</span>
          <span className="text-xl font-bold text-blue-600">CommunityHero</span>
        </div>
        <a href="/" className="text-blue-600 font-medium hover:underline">← Back to Home</a>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white p-5 rounded-2xl shadow mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border border-gray-100">
          <div>
            <h1 className="text-2xl font-black text-gray-800">🗺️ Real-Time Spatial Index Matrix</h1>
            <p className="text-xs text-gray-400 mt-0.5">Dynamic geographical tracking supporting cross-city coordinates routing.</p>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 block" /> Reported</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400 block" /> In Progress</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 block" /> Resolved</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LIST COMPONENT FEED */}
          <div className="lg:col-span-4 flex flex-col gap-3 max-h-[550px] overflow-y-auto pr-1">
            <h2 className="font-bold text-gray-700 text-sm tracking-wide uppercase px-1">📋 Active Nodes ({issues.length})</h2>
            
            {loading ? (
              <div className="text-center py-10 text-gray-400 text-sm animate-pulse">Loading spatial entries...</div>
            ) : (
              issues.map((issue) => (
                <div 
                  key={issue.id} 
                  onClick={() => handleSelectIssue(issue)}
                  className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all cursor-pointer ${
                    selected?.id === issue.id ? 'border-blue-500 scale-[1.01]' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getIcon(issue.category)}</span>
                      <span className="font-bold text-gray-800 text-sm truncate max-w-[150px]">{issue.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">{issue.latitude ? `${issue.latitude.toFixed(2)}, ${issue.longitude.toFixed(2)}` : 'No GPS'}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 truncate">📍 {issue.location}</div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      issue.status === 'Resolved' ? 'bg-green-50 text-green-600 border border-green-100' :
                      issue.status === 'In Progress' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-red-50 text-red-600 border-red-100'
                    }`}>{issue.status || 'Reported'}</span>
                    <span className="text-xs font-bold text-gray-500">👍 {issue.votes || 0}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DYNAMIC GOOGLE MAP FRAMEWORK */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl overflow-hidden shadow-md border border-gray-100">
              <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}>
                <GoogleMap mapContainerStyle={mapContainerStyle} center={currentMapCenter} zoom={11}>
                  {issues.map((issue) => (
                    <Marker 
                      key={issue.id} 
                      position={getPosition(issue)} 
                      onClick={() => handleSelectIssue(issue)}
                      icon={{
                        url: getMarkerIcon(issue.status),
                        scaledSize: new window.google.maps.Size(28, 28)
                      }}
                    />
                  ))}

                  {selected && (
                    <InfoWindow position={getPosition(selected)} onCloseClick={() => setSelected(null)}>
                      <div className="p-1 min-w-[180px]">
                        <div className="font-bold text-gray-900 text-sm flex items-center gap-1">
                          <span>{getIcon(selected.category)}</span> {selected.title}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">📍 {selected.location}</p>
                        <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase text-blue-600">{selected.status}</span>
                          <a href={`/issue/${selected.id}`} className="text-xs text-blue-500 hover:underline font-bold">Details →</a>
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