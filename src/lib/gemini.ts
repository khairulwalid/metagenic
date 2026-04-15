import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface StockMetadata {
  title: string;
  description: string;
  keywords: string[];
}

export async function generateStockMetadata(
  fileBase64: string,
  mimeType: string
): Promise<StockMetadata> {
  const model = "gemini-3-flash-preview";

  const prompt = `Analyze this image/video for stock photography metadata. 
  Generate a professional title, a detailed description, and exactly 40-50 relevant keywords.
  The keywords should be comma-separated and optimized for search on platforms like Adobe Stock, Shutterstock, and Getty Images.
  Focus on conceptual keywords, colors, emotions, and technical aspects.
  
  Return the result in JSON format.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: fileBase64,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A concise, descriptive title (max 70 chars)" },
          description: { type: Type.STRING, description: "A detailed description (max 200 chars)" },
          keywords: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "A list of 40-50 relevant keywords"
          },
        },
        required: ["title", "description", "keywords"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  return JSON.parse(text) as StockMetadata;
}
