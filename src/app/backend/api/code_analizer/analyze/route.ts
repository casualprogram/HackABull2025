// app/api/analyze-code/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";

// Define interfaces
interface UserCode {
  total_code: string;
}

interface CodeAnalysisResponse {
  quality: "LOW" | "AVERAGE" | "HIGH";
  message: string;
  analysis: {
    logic: string;
    suggestions: string[];
    optimizations: string[];
  };
  thinking?: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Paths to data files
const CODE_DATA_PATH = path.join(process.cwd(), "code-data.json");
const PROMPT_TEMPLATE_PATH = path.join(
  process.cwd(),
  "src",
  "app",
  "backend",
  "data",
  "code_analysis_prompt_template.prompt",
);

// Fallback prompt if template file doesn't exist
const FALLBACK_PROMPT = `You are a code analysis expert. Analyze the following code and provide constructive feedback:

{user_code}

Evaluate the code quality, suggest improvements, and identify potential optimizations.`;

// Function to fill template with analysis results
function fillTemplate(template: string, analysisResults: any): string {
  let filledTemplate = template;

  // Replace simple placeholders
  for (const [key, value] of Object.entries(analysisResults)) {
    if (typeof value === "string") {
      filledTemplate = filledTemplate.replace(
        new RegExp(`{{${key}}}`, "g"),
        value,
      );
    }
  }

  // Handle array values (for suggestions, optimizations, etc.)
  for (const [key, value] of Object.entries(analysisResults)) {
    if (Array.isArray(value)) {
      const placeholder = `{{${key}}}`;
      if (filledTemplate.includes(placeholder)) {
        const bulletPoints = value.map((item) => `- ${item}`).join("\n");
        filledTemplate = filledTemplate.replace(
          new RegExp(placeholder, "g"),
          bulletPoints,
        );
      }
    }
  }

  return filledTemplate;
}

export async function POST(request: Request) {
  try {
    const { code, template } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: "No code provided" },
        { status: 400 },
      );
    }

    // Read existing code data if available
    let codeData: UserCode = { total_code: code };
    try {
      await fs.access(CODE_DATA_PATH);
      const existingData = await fs.readFile(CODE_DATA_PATH, "utf-8");
      codeData = JSON.parse(existingData);
    } catch (error) {
      console.warn("No existing code data found or couldn't access it:", error);
      // Will continue with the provided code
    }

    // Load prompt template
    let promptTemplate;
    try {
      promptTemplate = await fs.readFile(PROMPT_TEMPLATE_PATH, "utf-8");
    } catch (error) {
      console.warn("Prompt template not found, using fallback:", error);
      promptTemplate = FALLBACK_PROMPT;
    }

    // Format the system prompt
    const systemPrompt = promptTemplate.replace(
      "{user_code}",
      codeData.total_code || code,
    );

    // Call OpenAI for analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            systemPrompt +
            "\nReturn valid JSON with keys 'quality' ('LOW', 'AVERAGE', 'HIGH'), 'message' (summary), 'analysis' (with 'logic', 'suggestions' array, 'optimizations' array), and 'thinking' (optional). Ensure complete JSON with no trailing commas.",
        },
        {
          role: "user",
          content: "Analyze this code and provide detailed feedback.",
        },
      ],
      temperature: 0.7,
    });

    const assistantMessageRaw = completion.choices[0].message.content;
    console.log("LLM RAW RESPONSE:", assistantMessageRaw);

    // Parse JSON response
    let analysisResult: CodeAnalysisResponse = {
      quality: "AVERAGE",
      message: "Unable to generate a complete analysis",
      analysis: {
        logic: "No logic assessment available",
        suggestions: ["No suggestions available"],
        optimizations: ["No optimizations available"],
      },
    };

    try {
      if (assistantMessageRaw && assistantMessageRaw.trim().startsWith("{")) {
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
        analysisResult = JSON.parse(sanitizedRaw);
      } else {
        throw new Error("Invalid or empty JSON response");
      }
    } catch (error) {
      console.error("Failed to parse LLM response as JSON:", error);
      // Use fallback values set above
    }

    // Use the template or create default format
    const analysisTemplate =
      template ||
      `# Code Analysis Report\n\n## Quality Assessment\n{{quality}}\n\n## Overall Summary\n{{message}}\n\n## Logic Analysis\n{{logic}}\n\n## Suggested Improvements\n{{suggestions}}\n\n## Optimization Opportunities\n{{optimizations}}\n\n*Analysis generated on {{date}}*`;

    // Fill the template with analysis results
    const formattedAnalysis = fillTemplate(analysisTemplate, {
      quality: analysisResult.quality,
      message: analysisResult.message,
      logic: analysisResult.analysis.logic,
      suggestions: analysisResult.analysis.suggestions,
      optimizations: analysisResult.analysis.optimizations,
      thinking: analysisResult.thinking || "No additional insights provided",
      date: new Date().toLocaleDateString(),
    });

    // Save both code and analysis to a file
    const dataToSave = {
      total_code: code,
      analysis: formattedAnalysis,
      raw_analysis: analysisResult,
      timestamp: new Date().toISOString(),
    };

    await fs.writeFile(
      CODE_DATA_PATH,
      JSON.stringify(dataToSave, null, 2),
      "utf-8",
    );

    return NextResponse.json({
      success: true,
      message: "Code analyzed successfully",
      analysis: formattedAnalysis,
      rawAnalysis: analysisResult,
      savedPath: CODE_DATA_PATH,
    });
  } catch (error) {
    console.error("Error analyzing code:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to analyze code",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
