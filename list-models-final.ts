import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY;

async function run() {
    const versions = ['v1', 'v1beta'];

    for (const v of versions) {
        try {
            console.log(`\n--- Testing API Version: ${v} ---`);
            const client = new GoogleGenAI({ apiKey, apiVersion: v as any });
            const response = await client.models.list();
            console.log(`Success with ${v}! Models:`);
            // The SDK response for list() might be an array or an object with models property
            const models = Array.isArray(response) ? response : (response as any).models || [];
            models.forEach((m: any) => console.log(`- ${m.name}`));
        } catch (err: any) {
            console.error(`Error with ${v}:`, err.message);
        }
    }
}

run();
