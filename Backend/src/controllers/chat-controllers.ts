import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import dotenv from "dotenv";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

dotenv.config();

// Validate API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not configured in environment variables");
}

if (!GEMINI_API_KEY.startsWith('AIza')) {
  throw new Error("Invalid GEMINI_API_KEY format. It should start with 'AIza'");
}

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Model names in order of preference
const MODEL_NAMES = [
  "gemini-1.5-flash",  // Primary choice - fastest
  "gemini-1.5-pro",    // Backup - more capable
  "gemini-pro",        // Fallback
  "gemini-1.0-pro"     // Last resort
];

// Cache for working model
let cachedModel: GenerativeModel | null = null;
let currentModelName: string = '';

// Test function to check model availability
async function testModel(modelName: string): Promise<GenerativeModel | null> {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    // Quick test generation with minimal content
    await model.generateContent("Hello");
    console.log(`✅ Model ${modelName} is available`);
    return model;
  } catch (error: any) {
    console.log(`❌ Model ${modelName} is not available:`, error.message);
    return null;
  }
}

// Get working model with caching
async function getWorkingModel(): Promise<GenerativeModel> {
  if (cachedModel) {
    return cachedModel;
  }

  for (const modelName of MODEL_NAMES) {
    const model = await testModel(modelName);
    if (model) {
      cachedModel = model;
      currentModelName = modelName;
      return model;
    }
  }
  throw new Error("No available Gemini models found");
}

// Reset cached model if needed
function resetModelCache() {
  cachedModel = null;
  currentModelName = '';
}

/**
 * Test the Gemini connection and model availability
 */
export const testGeminiConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Force test without cache
    resetModelCache();
    const model = await getWorkingModel();
    const result = await model.generateContent("Test response: Hello!");
    
    return res.status(200).json({
      message: "Gemini API is working",
      modelName: currentModelName,
      testResponse: result.response.text()
    });
  } catch (error: any) {
    console.error("Gemini Test Error:", error);
    return res.status(500).json({
      message: "Gemini API test failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Generate chat completion using Gemini AI
 */
export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    // Find and validate user
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({ message: "User not found or token invalid" });
    }

    // Save user message
    user.chats.push({ role: "user", content: message });

    try {
      // Get a working model (uses cache after first call)
      console.log("🔄 Getting Gemini model...");
      const model = await getWorkingModel();
      console.log(`✨ Using model: ${currentModelName}`);

      // Build conversation context - get recent chat history (excluding current message)
      const chatHistory = user.chats.slice(0, -1).slice(-9); // Last 9 previous messages + current = 10 total
      
      // Format chat history for Gemini
      const formattedHistory = chatHistory.map(chat => ({
        role: chat.role === "user" ? "user" : "model",
        parts: [{ text: chat.content }]
      }));

      // Start chat with history
      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      // Send the current message
      console.log("🤖 Generating response...");
      const result = await chat.sendMessage(message);
      
      if (!result?.response) {
        throw new Error("No response received from AI");
      }

      const aiResponse = result.response.text();
      if (!aiResponse?.trim()) {
        throw new Error("Empty response from AI");
      }

      // Save AI response
      user.chats.push({ role: "assistant", content: aiResponse });
      await user.save();

      return res.status(200).json({ chats: user.chats });

    } catch (aiError: any) {
      // Rollback user message if AI fails
      user.chats.pop();
      await user.save();

      console.error("AI Error:", aiError);
      
      // If it's a model-related error, reset cache
      if (aiError.message?.includes('model') || aiError.message?.includes('quota')) {
        resetModelCache();
      }
      
      return res.status(500).json({
        message: "Failed to get AI response",
        error: aiError instanceof Error ? aiError.message : "Unknown error"
      });
    }
  } catch (error: any) {
    console.error("Chat Error:", error);
    return res.status(500).json({
      message: "Failed to process chat",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Get all chats for the current user
 */
export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find and validate user
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({ message: "User not found or token invalid" });
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).json({ message: "Permission denied" });
    }

    return res.status(200).json({ 
      message: "OK",
      chats: user.chats 
    });

  } catch (error: any) {
    console.error("Get Chats Error:", error);
    return res.status(500).json({
      message: "Failed to get chats",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Delete all chats for the current user
 */
export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find and validate user
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({ message: "User not found or token invalid" });
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).json({ message: "Permission denied" });
    }

    // Clear chats
    //@ts-ignore
    user.chats = [];
    await user.save();

    return res.status(200).json({ 
      message: "Chats deleted successfully" 
    });

  } catch (error: any) {
    console.error("Delete Chats Error:", error);
    return res.status(500).json({
      message: "Failed to delete chats",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};