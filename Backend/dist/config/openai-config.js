// /config/gemini-config.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
}
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//# sourceMappingURL=openai-config.js.map