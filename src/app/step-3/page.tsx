import React from "react";
import fs from "fs/promises";
import path from "path";
import Link from "next/link";

// Define interfaces for our JSON data
// Update these interfaces to match your actual JSON structure
interface FirstJsonData {
  [key: string]: any;
  error?: string;
}

interface SecondJsonData {
  [key: string]: any;
  error?: string;
}

interface JsonData {
  firstJson: FirstJsonData;
  secondJson: SecondJsonData;
}

// Define interfaces for the feedback cards
interface CorrectnessData {
  passed: string;
  missedCase?: string;
}

interface EfficiencyData {
  complexity: string;
  suggestion?: string;
}

interface SummaryData {
  pattern?: string;
  recommendation?: string;
}
const PROMPT_TEMPLATE_PATH = path.join(
  process.cwd(),
  "src",
  "app",
  "step-3",
  "summary.prompt",
);
const promptTemplate = await fs.readFile(PROMPT_TEMPLATE_PATH, "utf-8");

// Function to read JSON files
async function getJsonData(): Promise<JsonData> {
  try {
    // Replace these with your actual paths
    // Mockup file paths - replace these with your actual paths
    const file1Path = path.join(
      process.cwd(),
      "src",
      "app",
      "backend",
      "data",
      "chat_history.json",
    );
    const file2Path = path.join(process.cwd(), "./", "code-data.json");

    // Read both files
    const file1Data = await fs.readFile(file1Path, "utf8");
    const file2Data = await fs.readFile(file2Path, "utf8");

    // Parse JSON data
    const firstJson: FirstJsonData = JSON.parse(file1Data);
    const secondJson: SecondJsonData = JSON.parse(file2Data);

    return {
      firstJson,
      secondJson,
    };
  } catch (error) {
    console.error("Error loading JSON files:", error);
    return {
      firstJson: { error: "Failed to load first JSON file" },
      secondJson: { error: "Failed to load second JSON file" },
    };
  }
}

// Function to generate summary using ChatGPT
async function generateSummary(
  firstJson: FirstJsonData,
  secondJson: SecondJsonData,
): Promise<string> {
  try {
    // Create a prompt for ChatGPT
    const prompt =
      promptTemplate +
      `
      First JSON data:
      ${JSON.stringify(firstJson, null, 2)}

      Second JSON data:
      ${JSON.stringify(secondJson, null, 2)}
    `;

    // Call ChatGPT API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4", // or whatever model you're using
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that creates concise summaries with specific examples.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to generate summary");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Failed to generate summary. Please try again later.";
  }
}

export default async function SummaryPage() {
  // Fetch the JSON data
  const { firstJson, secondJson } = await getJsonData();

  // Generate summary using ChatGPT
  const summary = await generateSummary(firstJson, secondJson);
  
  // Mock data for the feedback cards - in a real implementation, this would come from the backend
  // You can parse the summary to extract this information or get it from another source
  const correctnessData: CorrectnessData = {
    passed: "80% correct!",
    missedCase: "Missed edge case: empty array → expected 0, got undefined."
  };
  
  const efficiencyData: EfficiencyData = {
    complexity: "O(n²) time complexity",
    suggestion: "Consider using a hashmap to reduce lookup time."
  };
  
  const summaryData: SummaryData = {
    pattern: "This fits the \"Sliding Window\" pattern. You can try: LC 76 \"Minimum Window Substring\"."
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      {/* Header Title */}
      <h1 className="text-3xl font-semibold mb-8 text-center">
        That's great! You've got it 🎉<br />
        Here's some feedback from Bull.aio!
      </h1>

      {/* Feedback Cards Container */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Correctness Card */}
        <div className="bg-[#1E1E1E] rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-medium mb-4">Correctness</h2>
          <p className="text-xl text-[#5FC68C] mb-2">You've got {correctnessData.passed}</p>
          {correctnessData.missedCase && (
            <p className="text-l text-gray-300">{correctnessData.missedCase}</p>
          )}
        </div>

        {/* Efficiency Card */}
        <div className="bg-[#1E1E1E] rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-medium mb-4">Efficiency</h2>
          <p className="text-xl text-[#5FC68C] mb-2">{efficiencyData.complexity}.</p>
          {efficiencyData.suggestion && (
            <p className="text-l text-gray-300">{efficiencyData.suggestion}</p>
          )}
        </div>

        {/* Summary Card - Full Width */}
        <div className="bg-[#1E1E1E] rounded-lg p-6 shadow-lg md:col-span-2">
          <h2 className="text-xl font-medium mb-4">Summary</h2>
          <div className="text-l text-gray-300">
            {/* Display the AI-generated summary */}
            <div
              dangerouslySetInnerHTML={{
                __html: summary.replace(/\n/g, "<br />"),
              }}
            />
            {summaryData.pattern && (
              <p className="mt-4">{summaryData.pattern}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-4xl">
        <Link href="/step-2" className="flex-1">
          <button className="w-full py-3 px-6 border text-[#5FC68C] rounded-lg hover:bg-[#5FC68C]/10 transition-colors">
            Practice again
          </button>
        </Link>
        <Link href="/typeofquestion" className="flex-1">
          <button className="w-full py-3 px-6 bg-[#5FC68C] text-black rounded-lg hover:bg-[#5FC68C] transition-colors">
            Practice next problems
          </button>
        </Link>
      </div>
    </div>
  );
}
