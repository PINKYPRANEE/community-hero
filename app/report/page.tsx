'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ReportPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [severity, setSeverity] = useState('Medium')
  const [category, setCategory] = useState('Pothole')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [imagePreview, setImagePreview] = useState<any>(null)

  // Explicit hardware tracking states
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [gpsLocked, setGpsLocked] = useState(false)

  // Automatically request GPS location access right when the page mounts
  useEffect(() => {
    requestAutomaticGPS()
  }, [])

  const requestAutomaticGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude)
          setLongitude(pos.coords.longitude)
          setGpsLocked(true)
          // Pre-fills the location box with visual confirmation text
          setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
        },
        (err) => {
          console.log("GPS prompt declined or skipped by client:", err)
          setGpsLocked(false)
        },
        { enableHighAccuracy: true }
      );
    }
  }

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!title || !location) {
      alert('Please fill in Title and Location!')
      return
    }
    setLoading(true)

    let finalLat = latitude
    let finalLng = longitude

    // Check if user manually typed or modified the location input box to explicit coordinates
    if (location.includes(',')) {
      const parts = location.split(',')
      const parsedLat = parseFloat(parts[0])
      const parsedLng = parseFloat(parts[1])
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        finalLat = parsedLat
        finalLng = parsedLng
      }
    }

    // Geocoding fallback: If no hardware GPS coordinate is recorded, fetch the location via name parsing
    if (!finalLat || !finalLng) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
        const geoData = await response.json()
        if (geoData && geoData.length > 0) {
          finalLat = parseFloat(geoData[0].lat)
          finalLng = parseFloat(geoData[0].lon)
        }
      } catch (err) {
        console.error("Geocoding lookup pipeline exception:", err)
      }
    }

    // Baseline fallback coordinate if all lookups drop
    if (!finalLat || !finalLng) {
      finalLat = 14.4426
      finalLng = 79.9865
    }

    const { error } = await supabase.from('issues').insert([{
      title,
      description,
      location,
      severity,
      category,
      latitude: finalLat,
      longitude: finalLng,
      status: 'Reported',
      votes: 0
    }])
    
    setLoading(false)
    if (error) {
      alert('Database error: ' + error.message)
    } else {
      setSuccess(true)
      setTitle('')
      setDescription('')
      setLocation('')
      setImagePreview(null)
      setSeverity('Medium')
      setCategory('Pothole')
      setGpsLocked(false)
      requestAutomaticGPS() // Relock position array for subsequent report entries
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation Headers */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏘️</span>
          <span className="text-xl font-bold text-blue-600">CommunityHero</span>
        </div>
        <a href="/" className="text-blue-600 hover:underline">← Back to Home</a>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🚨 Report an Issue</h1>
        <p className="text-gray-500 mb-8">Provide clear visual verification and tracking information below.</p>

        {success && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl mb-6 font-medium">
            ✅ Issue logged successfully! Your community database metrics have been updated.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-6">
          {/* Visual Evidence Field Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📸 Issue Evidence Image</label>
            <label className="block border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="max-h-48 mx-auto rounded-lg" />
              ) : (
                <>
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-gray-400 text-sm">Select issue snapshot file</p>
                  <p className="text-xs text-gray-300 mt-1">PNG, JPG formats supported</p>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          {/* Incident Classification Tagging Group */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🏷️ Issue Category</label>
            <div className="flex gap-2 flex-wrap">
              {["Pothole", "Water Leak", "Streetlight", "Waste", "Tree Fall", "Infrastructure"].map((cat) => (
                <button 
                  type="button"
                  key={cat} 
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                    category === cat 
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100" 
                      : "text-gray-600 bg-white border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {cat === 'Pothole' ? '🕳️ Pothole' :
                   cat === 'Water Leak' ? '💧 Water Leak' :
                   cat === 'Streetlight' ? '💡 Streetlight' :
                   cat === 'Waste' ? '🗑️ Waste' :
                   cat === 'Tree Fall' ? '🌳 Tree Fall' : '🏗️ Infrastructure'}
                </button>
              ))}
            </div>
          </div>

          {/* Title Field Input Descriptor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Issue Summary Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="Provide a quick title summary description..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
            />
          </div>

          {/* Comprehensive Narrative Textarea */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📄 Situation Context Details</label>
            <textarea 
              rows={3} 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Elaborate on structural degradation parameters or safety hazards present..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
            />
          </div>

          {/* Location Processing Frame */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📍 Target Geographic Placement Location</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={location} 
                onChange={e => setLocation(e.target.value)}
                placeholder="Enter city or district reference text block (e.g. Balaji Colony, Tirupati)"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
              />
              <button 
                type="button" 
                onClick={requestAutomaticGPS} 
                className={`px-4 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                  gpsLocked 
                    ? 'bg-green-50 text-green-600 border border-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {gpsLocked ? '🎯 Locked' : '📡 Pull GPS'}
              </button>
            </div>
          </div>

          {/* Severity Matrix Selection Buttons */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">⚠️ Urgent Priority Severity</label>
            <div className="flex gap-3">
              {[["🟢", "Low"], ["🟡", "Medium"], ["🔴", "High"]].map(([emoji, level]) => (
                <button 
                  type="button" 
                  key={level} 
                  onClick={() => setSeverity(level)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${
                    severity === level 
                      ? "border-blue-400 bg-blue-50 text-blue-600" 
                      : "border-gray-200 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  {emoji} {level}
                </button>
              ))}
            </div>
          </div>

          {/* Submission Commit Anchor */}
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.995] text-white rounded-xl text-lg font-bold transition-all disabled:opacity-50 shadow-md shadow-blue-100"
          >
            {loading ? '⏳ Indexing Report Node...' : '🚀 Submit Report'}
          </button>
        </div>
      </div>
    </main>
  )
}