import { ElevenLabsClient } from "elevenlabs";
import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";

// Define the chat message interface
interface ChatMessage {
  from: "user" | "AI";
  message: string;
}

// Define the LLM response structure
interface LLMResponse {
  action: "FOLLOW_UP" | "GUIDANCE" | "READY";
  message: string;
  user_solution: {
    logic: string; // Changed from algorithm
  };
  thinking?: string;
}

// Initialize ElevenLabs client
const elevenLabsClient = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Paths to data files
const CHAT_HISTORY_PATH = path.join(
  process.cwd(),
  "src",
  "app",
  "backend",
  "data",
  "chat_history.json",
);

const PROMPT_TEMPLATE_PATH = path.join(
  process.cwd(),
  "src",
  "app",
  "backend",
  "data",
  "technical_prompt_template.prompt",
);

const LEETCODE_QUESTION = path.join(
  process.cwd(),
  "src",
  "app",
  "backend",
  "data",
  "leetcode.txt",
);

export async function generateSpeech(userPrompt: string): Promise<Buffer> {
  try {
    // Read chat history
    let chatHistory: ChatMessage[] = [];
    try {
      const chatHistoryRaw = await fs.readFile(CHAT_HISTORY_PATH, "utf-8");
      chatHistory = JSON.parse(chatHistoryRaw);
      // console.log("Current Chat history loaded:", chatHistory);
    } catch (error) {
      console.warn("No chat history found, starting fresh:", error);
      chatHistory = [];
    }

    // Read prompt template and LeetCode question
    const promptTemplate = await fs.readFile(PROMPT_TEMPLATE_PATH, "utf-8");
    const leetCodeQuestion = await fs.readFile(LEETCODE_QUESTION, "utf-8");

    // Format chat history for LLM context
    const formattedHistory = chatHistory
      .map((msg) => {
        try {
          const parsed = JSON.parse(msg.message);
          return `${msg.from === "user" ? "User" : "Assistant"}: ${
            parsed.message || msg.message
          }`;
        } catch {
          return `${msg.from === "user" ? "User" : "Assistant"}: ${
            msg.message
          }`;
        }
      })
      .join("\n");

    // Create system prompt
    const systemPrompt = promptTemplate
      .replace("{chat_history}", formattedHistory)
      .replace("{userPrompt}", userPrompt)
      .replace("{technical_question}", leetCodeQuestion);

    // console.log("SYSTEM PROMPT FOR LLM:", systemPrompt);

    // Call OpenAI GPT-3.5-turbo
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            systemPrompt +
            "\nReturn valid JSON with keys 'action' ('FOLLOW_UP', 'GUIDANCE', 'READY'), 'thinking' (1 sentence), 'message' (1-2 sentences, <100 chars), 'user_solution' ('logic'). Ensure complete JSON with no trailing commas.",
        },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 300, // Reduced for efficiency
      temperature: 0.7,
    });

    const assistantMessageRaw = completion.choices[0].message.content;
    console.log("LLM RAW RESPONSE:", assistantMessageRaw);

    // Parse JSON response
    let assistantMessage: LLMResponse = {
      action: "FOLLOW_UP",
      message: "",
      user_solution: { logic: "" },
    };
    try {
      if (
        assistantMessageRaw &&
        assistantMessageRaw.trim().startsWith("{") &&
        assistantMessageRaw.includes('"message"')
      ) {
        // Sanitize JSON
        let sanitizedRaw = assistantMessageRaw
          .replace(/\bFALSE\b/g, "false")
          .replace(/\bTRUE\b/g, "true")
          // Remove trailing commas
          .replace(/,\s*}/g, "}")
          .replace(/,\s*$/, "");
        // Fix unclosed JSON
        if (!sanitizedRaw.trim().endsWith("}")) {
          sanitizedRaw += "}";
        }
        console.log("SANITIZED RAW:", sanitizedRaw);
        assistantMessage = JSON.parse(sanitizedRaw);
        if (!assistantMessage.message) {
          throw new Error("No 'message' field in LLM response");
        }
      } else {
        throw new Error("Invalid or empty JSON response");
      }
    } catch (error) {
      console.error("Failed to parse LLM response as JSON:", error);
      // Fallback: Extract message with regex
      if (assistantMessageRaw) {
        const match = assistantMessageRaw.match(/"message"\s*:\s*"([^"]*)"/);
        if (match && match[1]) {
          assistantMessage.message = match[1].substring(0, 100);
        } else {
          assistantMessage.message = "Unable to generate a clear response";
        }
      }
    }

    // Use only the "message" field for speech
    const speechText = assistantMessage.message;
    console.log("SPEECH TEXT:", speechText);

    // Store full JSON (or raw) in history
    chatHistory.push({ from: "user", message: userPrompt });
    chatHistory.push({ from: "AI", message: assistantMessageRaw || "" });
    await fs.writeFile(
      CHAT_HISTORY_PATH,
      JSON.stringify(chatHistory, null, 2),
      "utf-8",
    );

    // Generate text-to-speech
    const voiceId = "21m00Tcm4TlvDq8ikWAM";
    const audioStream = await elevenLabsClient.textToSpeech.convert(voiceId, {
      text: speechText || "No response available",
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
      },
    });

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error("Failed to generate speech");
  }
}

export default generateSpeech;
