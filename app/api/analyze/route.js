import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const data = await request.json();
    const { imageBase64 } = data;

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const prompt = `
      You are the core verification engine for CommunityHero.
      Look closely at this image uploaded by a citizen:
      Identify the category string matching this list exactly: Pothole, Water Leak, Streetlight, Waste, Tree Fall, Infrastructure.
      
      Return ONLY the plain single word category from the list. Do not include markdown formatting, punctuation, or extra sentences.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64
          }
        }
      ]
    });

    const categoryText = response.text ? response.text.trim() : "Pothole";
    return NextResponse.json({ category: categoryText });

  } catch (error) {
    console.error("Gemini Vision API Error:", error);
    return NextResponse.json({ error: "Processing failure" }, { status: 500 });
  }
}