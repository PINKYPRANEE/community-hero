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
                text: 'Look at this image and categorize the community issue. Reply with ONLY one of these exact words: Pothole, Water Leak, Streetlight, Waste, Tree Fall, Infrastructure. Nothing else.'
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
    const category = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    return Response.json({ category })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}