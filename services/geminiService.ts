import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "../types";

const MODEL_VISION_WRITER = "gemini-3-pro-preview";
const MODEL_TTS = "gemini-2.5-flash-preview-tts";

// Ensure API key is present
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-initialization' });

export const generateStoryFromImage = async (base64Image: string, mimeType: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found");

  try {
    const prompt = `
      Analyze the mood, lighting, and details of this image. 
      First, briefly identify the core atmosphere (e.g., melancholic, adventurous, serene).
      Then, acting as a master storyteller, ghostwrite a compelling opening paragraph (approx 100-150 words) for a story set in this world.
      Focus on sensory details and emotional resonance. Do not simply describe the image; tell a story.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_VISION_WRITER,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        temperature: 0.8, // Creative writing
      }
    });

    return response.text || "The spirits of the machine were silent. Please try again.";
  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
};

export const generateSpeechFromText = async (text: string, voice: VoiceName = VoiceName.Puck): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found");

  try {
    // Shorten text if it's too long to avoid timeout/limits for this demo, though usually fine.
    const safeText = text.length > 1000 ? text.substring(0, 1000) + "..." : text;

    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: {
        parts: [{ text: safeText }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice
            }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data returned from Gemini");
    }

    return base64Audio;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};
