import { GoogleGenAI, Modality } from "@google/genai";

// Initialize the Gemini API client
// We use the environment variable directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface StoryOptions {
  animals: OptionItem[];
  scenes: OptionItem[];
  items: OptionItem[];
  styles: OptionItem[];
}

export interface OptionItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export interface GeneratedStory {
  title: string;
  content: string;
  imagePrompt: string;
}

/**
 * Generates the selection options for the user.
 */
export async function generateOptions(): Promise<StoryOptions> {
  const model = "gemini-2.5-flash-latest"; // Fast model for JSON generation
  
  const prompt = `
    Generate a JSON object containing 4 lists for a children's story generator:
    1. 'animals': 5 cute or interesting animals.
    2. 'scenes': 5 magical or cozy settings.
    3. 'items': 5 interesting objects.
    4. 'styles': 5 story styles (e.g., Funny, Adventurous, Sleepy, Rhyming, Fable).

    For each item in the lists, provide:
    - 'id': a unique string id
    - 'name': the display name
    - 'emoji': a relevant emoji
    - 'description': a very short 3-5 word description

    Ensure the vocabulary is suitable for children.
    Return ONLY the JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as StoryOptions;
  } catch (error) {
    console.error("Error generating options:", error);
    // Fallback data in case of error
    return {
      animals: [
        { id: 'a1', name: 'Fluffy Bunny', emoji: '🐰', description: 'A soft white rabbit' },
        { id: 'a2', name: 'Wise Owl', emoji: '🦉', description: 'Reads many books' },
        { id: 'a3', name: 'Brave Lion', emoji: '🦁', description: 'King of the jungle' },
        { id: 'a4', name: 'Playful Puppy', emoji: '🐶', description: 'Loves to chase balls' },
        { id: 'a5', name: 'Slow Turtle', emoji: '🐢', description: 'Takes his time' },
      ],
      scenes: [
        { id: 's1', name: 'Magic Forest', emoji: '🌲', description: 'Glowing mushrooms everywhere' },
        { id: 's2', name: 'Cloud Castle', emoji: '☁️', description: 'Floating in the sky' },
        { id: 's3', name: 'Underwater City', emoji: '🐠', description: 'Bubbles and coral' },
        { id: 's4', name: 'Candy Land', emoji: '🍭', description: 'Sweet and sticky' },
        { id: 's5', name: 'Space Station', emoji: '🚀', description: 'Stars all around' },
      ],
      items: [
        { id: 'i1', name: 'Magic Wand', emoji: '✨', description: 'Casts sparkly spells' },
        { id: 'i2', name: 'Old Map', emoji: '🗺️', description: 'Shows hidden treasure' },
        { id: 'i3', name: 'Golden Key', emoji: '🔑', description: 'Opens any door' },
        { id: 'i4', name: 'Flying Carpet', emoji: '🧶', description: 'Zooms through air' },
        { id: 'i5', name: 'Invisibility Cloak', emoji: '🧥', description: 'Hides you away' },
      ],
      styles: [
        { id: 'st1', name: 'Funny', emoji: '😂', description: 'Makes you laugh' },
        { id: 'st2', name: 'Adventurous', emoji: '⚔️', description: 'Exciting journey' },
        { id: 'st3', name: 'Sleepy', emoji: '😴', description: 'Good for bedtime' },
        { id: 'st4', name: 'Rhyming', emoji: '🎵', description: 'Like a song' },
        { id: 'st5', name: 'Fable', emoji: '📖', description: 'Teaches a lesson' },
      ]
    };
  }
}

/**
 * Generates the story text based on user selections.
 */
export async function generateStory(selections: {
  animals: OptionItem[];
  scenes: OptionItem[];
  items: OptionItem[];
  styles: OptionItem[];
}): Promise<GeneratedStory> {
  const model = "gemini-2.5-flash-latest"; // Good for text generation

  const animalNames = selections.animals.map(i => i.name).join(", ");
  const sceneNames = selections.scenes.map(i => i.name).join(", ");
  const itemNames = selections.items.map(i => i.name).join(", ");
  const styleNames = selections.styles.map(i => i.name).join(", ");

  const prompt = `
    Write a bedtime story for a US elementary school student (simple grammar and vocabulary).
    
    The story MUST include:
    - Characters: ${animalNames}
    - Settings: ${sceneNames}
    - Objects: ${itemNames}
    - Style: ${styleNames}

    Length: 100 to 300 words.
    
    Return a JSON object with:
    - 'title': A catchy title for the story.
    - 'content': The full story text.
    - 'imagePrompt': A detailed description for an AI image generator to create an illustration for this story.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate story");

  return JSON.parse(text) as GeneratedStory;
}

/**
 * Generates an illustration for the story.
 */
export async function generateIllustration(imagePrompt: string): Promise<string> {
  // Use a model capable of image generation
  const model = "gemini-2.5-flash-image"; 
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: imagePrompt }]
      },
      config: {
        // Note: responseMimeType is not supported for image generation models usually, 
        // but we just want the image data from the response parts.
      }
    });

    // Extract image from response
    // The SDK returns the image in the response structure
    // We need to iterate through parts to find the inlineData
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image found in response");
  } catch (error) {
    console.error("Error generating illustration:", error);
    // Return a placeholder if generation fails
    return "https://picsum.photos/seed/story/1024/1024";
  }
}

/**
 * Generates audio for the story.
 */
export async function generateAudio(text: string): Promise<string | null> {
  const model = "gemini-2.5-flash-preview-tts";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Puck" // Friendly voice
            }
          }
        }
      }
    });

    // Extract audio from response
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('audio/')) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No audio found in response");
  } catch (error) {
    console.error("Error generating audio:", error);
    return null;
  }
}
