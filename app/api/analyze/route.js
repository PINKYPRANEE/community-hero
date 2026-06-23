import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { imageBase64, mediaType } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this community issue image. Return ONLY this JSON with no extra text:
{"category":"Pothole","title":"Large pothole on road","description":"A large pothole found on the road causing damage to vehicles.","severity":"High"}
Use one of these categories: Pothole, Water Leak, Streetlight, Waste, Tree Fall, Infrastructure
Adjust title, description and severity (Low/Medium/High) based on what you see.`
              },
              {
                inline_data: {
                  mime_type: mediaType || "image/jpeg",
                  data: imageBase64
                }
              }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    
    const validCategories = ["Pothole", "Water Leak", "Streetlight", "Waste", "Tree Fall", "Infrastructure"];

    // Try to find and parse JSON format inside Gemini's response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const matched = validCategories.find(cat => 
        parsed.category?.toLowerCase().includes(cat.toLowerCase())
      );

      return NextResponse.json({
        category: matched || 'Pothole',
        title: parsed.title || 'Community Issue Detected',
        description: parsed.description || 'Reported via automated image scanner.',
        severity: parsed.severity || 'Medium'
      });
    }

    // Fallback parser if Gemini outputs plain text instead of proper JSON
    const fallbackMatch = validCategories.find(cat => 
      rawText.toLowerCase().includes(cat.toLowerCase())
    );

    return NextResponse.json({ 
      category: fallbackMatch || 'Pothole',
      title: 'Community Issue Detected',
      description: 'Reported via automated image scanner.',
      severity: 'Medium'
    });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}