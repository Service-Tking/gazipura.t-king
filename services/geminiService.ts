
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Use correct model names and property access for .text per guidelines
export const getErpInsights = async (module: string, data: any) => {
  // Always use a new instance right before use with process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Complex reasoning task
      contents: `Analyze the following ERP ${module} data and provide a brief professional summary with 3 actionable insights: ${JSON.stringify(data)}`,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });
    // Fix: Access .text as a property, not a method
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate insights at this time.";
  }
};

export const generateJobCardDescription = async (complaints: string) => {
  // Always use a new instance right before use with process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Technical reasoning task
      contents: `As an expert vehicle engineer, expand these brief vehicle complaints into a professional technical job description: ${complaints}`,
    });
    // Fix: Access .text as a property
    return response.text;
  } catch (error) {
    return complaints;
  }
};
