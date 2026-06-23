'use client'
import { useState } from 'react'
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
  const [imagePreview, setImagePreview] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [mediaType, setMediaType] = useState(null)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setMediaType(file.type)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target.result.split(',')[1]
      setImageBase64(base64)
      setImagePreview(event.target.result)

      // Auto analyze with AI
      setAnalyzing(true)
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mediaType: file.type })
        })
        const data = await res.json()
        if (data.category) setCategory(data.category)
      } catch (err) {
        console.error(err)
      }
      setAnalyzing(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!title || !location) {
      alert('Please fill in Title and Location!')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('issues').insert([{
      title,
      description,
      location,
      severity,
      category,
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
        <p className="text-gray-500 mb-8">Upload a photo and our AI will categorize it automatically</p>

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
                🤖 AI is analyzing your image...
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Issue Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Large pothole on main road"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📄 Description</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📍 Location</label>
            <div className="flex gap-2">
              <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="Enter your location"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <button onClick={() => {
                navigator.geolocation.getCurrentPosition(pos => {
                  setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
                })
              }} className="px-4 py-3 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 font-medium">
                📡 Auto
              </button>
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">⚠️ Severity</label>
            <div className="flex gap-3">
              {[["🟢", "Low"], ["🟡", "Medium"], ["🔴", "High"]].map(([emoji, level]) => (
                <button key={level} onClick={() => setSeverity(level)}
                  className={`flex-1 py-2 rounded-xl border font-medium ${severity === level ? "border-blue-400 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}>
                  {emoji} {level}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl text-lg font-bold hover:bg-blue-700 disabled:opacity-50">
            {loading ? '⏳ Submitting...' : '🚀 Submit Report'}
          </button>
        </div>
      </div>
    </main>
  )
}