import { ElevenLabsClient } from "elevenlabs";
import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";

// Define the chat message interface
interface ChatMessage {
  from: "user" | "AI";
  message: string;
}

// Define the LLM response structure for behavioral questions
interface LLMResponse {
  action: "FOLLOW_UP" | "REFLECTION" | "COMPLETE";
  message: string;
  user_response: {
    strength: string;
    improvement: string;
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
  "chat_behavioral.json",
);

const PROMPT_TEMPLATE_PATH = path.join(
  process.cwd(),
  "src",
  "app",
  "backend",
  "data",
  "behavior_prompt_template.prompt",
);

const BEHAVIORAL_QUESTIONS_PATH = path.join(
  process.cwd(),
  "src",
  "app",
  "backend",
  "data",
  "behavioral_questions.txt",
);

/**
 * Selects a random behavioral question from the provided file
 * @returns {Promise<string>} A randomly selected behavioral question
 */
export async function getRandomBehavioralQuestion(): Promise<string> {
  try {
    // Read the file content
    const fileContent = await fs.readFile(BEHAVIORAL_QUESTIONS_PATH, "utf-8");

    // Split the content by double newlines to get individual questions
    const questions = fileContent
      .split(/\n\n+/)
      .filter((question) => question.trim().length > 0);

    // If no questions are found, throw an error
    if (questions.length === 0) {
      throw new Error("No behavioral questions found in the file");
    }

    // Generate a random index
    const randomIndex = Math.floor(Math.random() * questions.length);

    // Return the randomly selected question
    return questions[randomIndex];
  } catch (error) {
    console.error("Error selecting random behavioral question:", error);
    // Return a default question in case of error
    return "Tell me about a time when you demonstrated leadership skills.";
  }
}

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

    // Read prompt template and behavioral questions
    const promptTemplate = await fs.readFile(PROMPT_TEMPLATE_PATH, "utf-8");

    // Get a random behavioral question if this is a new conversation
    let currentQuestion = "";
    if (chatHistory.length === 0) {
      currentQuestion = await getRandomBehavioralQuestion();
      // Add the question to chat history as if AI asked it
      chatHistory.push({
        from: "AI",
        message: JSON.stringify({
          action: "FOLLOW_UP",
          message: currentQuestion,
          user_response: { strength: "", improvement: "" },
        }),
      });
      await fs.writeFile(
        CHAT_HISTORY_PATH,
        JSON.stringify(chatHistory, null, 2),
        "utf-8",
      );
    } else {
      // Extract the current question from history
      try {
        // Find the most recent question from AI
        for (let i = chatHistory.length - 1; i >= 0; i--) {
          if (chatHistory[i].from === "AI") {
            try {
              const parsedMessage = JSON.parse(chatHistory[i].message);
              currentQuestion = parsedMessage.message;
              break;
            } catch (e) {
              // If parsing fails, try the next message
              continue;
            }
          }
        }
      } catch (error) {
        console.warn("Could not extract current question:", error);
        // Fallback to getting a new random question
        currentQuestion = await getRandomBehavioralQuestion();
      }
    }

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
      .replace("{current_question}", currentQuestion);

    console.log("SYSTEM PROMPT FOR LLM:", systemPrompt);

    // Call OpenAI with function calling to ensure structured output
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125", // Use a model that supports function calling
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      functions: [
        {
          name: "provide_interview_response",
          description: "Generate a structured interview response",
          parameters: {
            type: "object",
            properties: {
              action: {
                type: "string",
                enum: ["FOLLOW_UP", "REFLECTION", "COMPLETE"],
                description: "The type of response to give",
              },
              thinking: {
                type: "string",
                description: "Internal thinking (1 sentence)",
              },
              message: {
                type: "string",
                description:
                  "Response to the candidate (1-2 sentences, <100 chars)",
              },
              user_response: {
                type: "object",
                properties: {
                  strength: {
                    type: "string",
                    description: "The strongest aspect of the user's response",
                  },
                  improvement: {
                    type: "string",
                    description:
                      "One specific area where the user could improve",
                  },
                },
                required: ["strength", "improvement"],
              },
            },
            required: ["action", "message", "user_response"],
          },
        },
      ],
      function_call: { name: "provide_interview_response" },
      max_tokens: 300,
      temperature: 0.7,
    });

    // Extract the function arguments from the response
    let assistantMessage: LLMResponse = {
      action: "FOLLOW_UP",
      message: "",
      user_response: {
        strength: "",
        improvement: "",
      },
    };

    // Parse the function call arguments
    if (completion.choices[0].message.function_call) {
      try {
        const functionCall = completion.choices[0].message.function_call;
        console.log("FUNCTION CALL:", functionCall);

        if (functionCall.arguments) {
          assistantMessage = JSON.parse(functionCall.arguments);
          console.log("PARSED RESPONSE:", assistantMessage);
        } else {
          throw new Error("No arguments in function call");
        }
      } catch (error) {
        console.error("Failed to parse function call arguments:", error);
        assistantMessage.message =
          "I couldn't process your response correctly. Could you please try again?";
      }
    } else {
      console.warn("No function call in response");
      // If there's a content field, try to extract a message from it
      if (completion.choices[0].message.content) {
        assistantMessage.message =
          completion.choices[0].message.content.substring(0, 100);
      } else {
        assistantMessage.message = "Unable to generate a clear response";
      }
    }

    // Use only the "message" field for speech
    const speechText = assistantMessage.message;
    console.log("SPEECH TEXT:", speechText);

    // Store the complete response in chat history
    const rawResponseForHistory = JSON.stringify(assistantMessage);

    chatHistory.push({ from: "user", message: userPrompt });
    chatHistory.push({ from: "AI", message: rawResponseForHistory });
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
