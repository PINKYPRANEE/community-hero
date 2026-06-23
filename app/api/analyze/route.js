import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request) {
  try {
    const { imageBase64, mediaType } = await request.json()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64
              }
            },
            {
              type: 'text',
              text: 'Look at this image and categorize the community issue. Reply with ONLY one of these exact words: Pothole, Water Leak, Streetlight, Waste, Tree Fall, Infrastructure. Nothing else.'
            }
          ]
        }
      ]
    })

    const category = response.content[0].text.trim()
    return Response.json({ category })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}