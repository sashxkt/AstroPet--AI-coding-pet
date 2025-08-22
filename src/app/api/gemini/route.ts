import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing Gemini API key." }, { status: 500 });
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });
    return NextResponse.json({ text: response.text });
  } catch (e) {
    return NextResponse.json({ error: "Gemini API error." }, { status: 500 });
  }
}
