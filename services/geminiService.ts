import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Removes watermark from an image using Gemini's image editing capabilities.
 * @param base64Image The base64 encoded string of the image (without the data prefix).
 * @param mimeType The mime type of the image.
 * @returns The base64 encoded string of the processed image.
 */
export const removeWatermarkFromImage = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const ai = getClient();
    
    // We use the 'gemini-2.5-flash-image' model for image editing tasks as recommended.
    const model = 'gemini-2.5-flash-image';

    const prompt = "Remove any watermarks, logos, text overlays, or date stamps from this image. Fill in the background seamlessly to match the surrounding area. Output only the clean image.";

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Extract the image from the response
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content returned from Gemini.");
    }

    // Iterate to find the image part
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image data found in the response.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Helper to convert File to Base64 (pure data string)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/png;base64, prefix
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};