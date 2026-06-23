export async function POST(request) {
  try {
    const { imageBase64, mediaType } = await request.json()

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this community issue image and respond in this exact JSON format:
{
  "category": "one of: Pothole, Water Leak, Streetlight, Waste, Tree Fall, Infrastructure",
  "title": "short title of the issue in 5-8 words",
  "description": "detailed description of the issue in 2-3 sentences",
  "severity": "one of: Low, Medium, High"
}
Only respond with the JSON, nothing else.`
              },
              {
                inline_data: {
                  mime_type: mediaType,
                  data: imageBase64
                }
              }
            ]
          }]
        })
      }
    )

    const data = await response.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}'
    
    try {
      const clean = rawText.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      return Response.json(parsed)
    } catch {
      return Response.json({ category: 'Pothole', title: '', description: '', severity: 'Medium' })
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}