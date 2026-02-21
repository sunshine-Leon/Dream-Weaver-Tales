import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = "AIzaSyCvVl-69ExDPDEu4QriWdEPwEdd7lLw7Oc";

async function run() {
    const v = 'v1beta'; // Models like 3.0 are usually in v1beta first
    try {
        const client = new GoogleGenAI({ apiKey, apiVersion: v as any });
        const response = await client.models.list();
        const models = Array.isArray(response) ? response : (response as any).models || [];
        console.log(`Models for ${v}:`);
        models.forEach((m: any) => {
            if (m.name.includes('gemini')) console.log(m.name);
        });
    } catch (err: any) {
        console.error(`Error:`, err.message);
    }
}

run();
