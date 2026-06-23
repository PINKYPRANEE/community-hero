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
  const [analyzing, setAnalyzing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [imagePreview, setImagePreview] = useState<any>(null)
  const [imageBase64, setImageBase64] = useState<any>(null)
  const [mediaType, setMediaType] = useState<any>(null)

  // 📍 New Hidden Numeric Coordinates States for Mapping Array Rows
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [gpsLocked, setGpsLocked] = useState(false)

  // Automatically fetch high-accuracy coordinates when page loads
  useEffect(() => {
    captureGPS()
  }, [])

  const captureGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
        setGpsLocked(true)
        // If location text field is empty, pre-fill it with text coordinates
        if (!location) {
          setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
        }
      }, (err) => console.log("Location access deferred or restricted:", err), 
      { enableHighAccuracy: true })
    }
  }

  const handleImageUpload = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return

    setMediaType(file.type)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const resultString = event.target?.result
      if (typeof resultString === 'string') {
        const base64 = resultString.split(',')[1]
        setImageBase64(base64)
        setImagePreview(resultString)

        setAnalyzing(true)
        try {
          const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64, mediaType: file.type })
          })
          const data = await res.json()
          
          const validCategories = ["Pothole", "Water Leak", "Streetlight", "Waste", "Tree Fall", "Infrastructure"]
          const matched = validCategories.find(cat =>
            data.category?.toLowerCase().includes(cat.toLowerCase())
          )
          if (matched) setCategory(matched)
          if (data.title) setTitle(data.title)
          if (data.description) setDescription(data.description)
          if (data.severity) setSeverity(data.severity)

        } catch (err) {
          console.error(err)
        }
        setAnalyzing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!title || !location) {
      alert('Please fill in Title and Location!')
      return
    }
    setLoading(true)
    
    // Fallback coordinates if the user clears the form inputs or blocks tracking hardware
    const finalLat = latitude || 13.6288 
    const finalLng = longitude || 79.4192

    const { error } = await supabase.from('issues').insert([{
      title,
      description,
      location,
      severity,
      category,
      latitude: finalLat,  // Pushes precise float to DB column
      longitude: finalLng, // Pushes precise float to DB column
      status: 'Reported',
      votes: 0
    }])
    
    setLoading(false)
    if (error) {
      alert('Error: ' + error.message)
    } else {
      setSuccess(true)
      setTitle('')
      setDescription('')
      setLocation('')
      setImagePreview(null)
      setSeverity('Medium')
      setCategory('Pothole')
      // Pull fresh coordinates for the next ticket submission
      captureGPS()
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

      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🚨 Report an Issue</h1>
        <p className="text-gray-500 mb-8">Upload a photo — AI will fill everything automatically!</p>

        {success && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl mb-6 font-medium">
            ✅ Issue reported successfully! Thank you for helping your community!
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-6">

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📸 Upload Photo</label>
            <label className="block border-2 border-dashed border-blue-300 rounded-xl p-10 text-center cursor-pointer hover:bg-blue-50">
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="max-h-48 mx-auto rounded-lg" />
              ) : (
                <>
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-gray-400">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-300 mt-1">PNG, JPG up to 10MB</p>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {analyzing && (
              <div className="mt-2 text-blue-500 font-medium animate-pulse">
                🤖 AI is analyzing your image and filling the form...
              </div>
            )}
          </div>

          {/* AI Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🤖 AI Category {analyzing ? '(Detecting...)' : '(Auto-detected)'}
            </label>
            <div className="flex gap-2 flex-wrap">
              {["Pothole", "Water Leak", "Streetlight", "Waste", "Tree Fall", "Infrastructure"].map((cat) => (
                <span key={cat} onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm border cursor-pointer ${category === cat ? "bg-blue-600 text-white border-blue-600" : "text-gray-600 border-gray-300 hover:border-blue-400"}`}>
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Issue Title <span className="text-blue-400 text-xs">(AI filled)</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="AI will fill this automatically..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📄 Description <span className="text-blue-400 text-xs">(AI filled)</span></label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="AI will fill this automatically..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📍 Location</label>
            <div className="flex gap-2">
              <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="Enter your location"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <button type="button" onClick={() => {
                navigator.geolocation.getCurrentPosition(pos => {
                  setLatitude(pos.coords.latitude)
                  setLongitude(pos.coords.longitude)
                  setGpsLocked(true)
                  setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
                })
              }} className={`px-4 py-3 rounded-xl font-medium transition-all ${gpsLocked ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {gpsLocked ? '🎯 Locked' : '📡 Auto'}
              </button>
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">⚠️ Severity <span className="text-blue-400 text-xs">(AI detected)</span></label>
            <div className="flex gap-3">
              {[["🟢", "Low"], ["🟡", "Medium"], ["🔴", "High"]].map(([emoji, level]) => (
                <button type="button" key={level} onClick={() => setSeverity(level)}
                  className={`flex-1 py-2 rounded-xl border font-medium ${severity === level ? "border-blue-400 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}>
                  {emoji} {level}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading || analyzing}
            className="w-full py-4 bg-blue-600 text-white rounded-xl text-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all transform active:scale-[0.995]">
            {loading ? '⏳ Submitting...' : analyzing ? '🤖 AI Analyzing...' : '🚀 Submit Report'}
          </button>
        </div>
      </div>
    </main>
  )
}