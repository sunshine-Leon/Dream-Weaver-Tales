import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API key found in .env");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function listModels() {
    try {
        console.log("Fetching models...");
        // @ts-ignore - checking if listModels exists on this SDK version
        const models = await ai.models.list();
        console.log("Available models:");
        console.log(JSON.stringify(models, null, 2));
    } catch (err) {
        console.error("Error listing models:", err);
    }
}

listModels();
