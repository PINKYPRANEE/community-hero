export async function POST(request) {
  try {
    const { message } = await request.json()

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are CommunityHero AI Assistant, a helpful chatbot for a civic issue reporting platform.
You help citizens report and track community issues like potholes, water leaks, broken streetlights, waste management, tree falls, and infrastructure problems.
Keep responses short, friendly and helpful (max 3 sentences).
User message: ${message}`
            }]
          }]
        })
      }
    )

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Sorry I could not process your request.'
    return Response.json({ reply })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}