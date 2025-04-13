import React from "react";
import fs from "fs/promises";
import path from "path";
import Link from "next/link";

// Define interfaces for our JSON data
interface FirstJsonData {
  [key: string]: any;
  error?: string;
}

interface JsonData {
  firstJson: FirstJsonData;
}

interface SummaryData {
  pattern?: string;
  recommendation?: string;
}

const PROMPT_TEMPLATE_PATH = path.join(
  process.cwd(),
  "src",
  "app",
  "sum-bvh",
  "sum_behavior.prompt",
);
const promptTemplate = await fs.readFile(PROMPT_TEMPLATE_PATH, "utf-8");

// Function to read JSON files
async function getJsonData(): Promise<JsonData> {
  try {
    // Mockup file path - replace with your actual path
    const file1Path = path.join(
      process.cwd(),
      "src",
      "app",
      "backend",
      "data",
      "chat_behavioral.json",
    );

    // Read the file
    const file1Data = await fs.readFile(file1Path, "utf8");

    // Parse JSON data
    const firstJson: FirstJsonData = JSON.parse(file1Data);

    return {
      firstJson,
    };
  } catch (error) {
    console.error("Error loading JSON file:", error);
    return {
      firstJson: { error: "Failed to load JSON file" },
    };
  }
}

// Function to generate summary using ChatGPT
async function generateSummary(firstJson: FirstJsonData): Promise<string> {
  try {
    // Create a prompt for ChatGPT
    const prompt =
      promptTemplate +
      `
      First JSON data:
      ${JSON.stringify(firstJson, null, 2)}
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
  const { firstJson } = await getJsonData();

  // Generate summary using ChatGPT
  const summary = await generateSummary(firstJson);

  // Basic summary data
  const summaryData: SummaryData = {
    pattern:
      "Consider reviewing common behavioral questions for tech interviews.",
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
      {/* Header Title */}
      <h1 className="mb-8 text-center text-3xl font-semibold">
        That's great! You've got it 🎉
        <br />
        Here's some feedback from Bull.aio!
      </h1>

      {/* Summary Card Container */}
      <div className="mb-8 w-full max-w-4xl">
        {/* Summary Card */}
        <div className="rounded-lg bg-[#1E1E1E] p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-medium">Summary</h2>
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
      <div className="flex w-full max-w-4xl flex-col gap-4 sm:flex-row">
        <Link href="./" className="flex-1">
          <button className="w-full rounded-lg border px-6 py-3 text-[#5FC68C] transition-colors hover:bg-[#5FC68C]/10">
            Practice again
          </button>
        </Link>
        <Link href="./" className="flex-1">
          <button className="w-full rounded-lg bg-[#5FC68C] px-6 py-3 text-black transition-colors hover:bg-[#5FC68C]">
            Practice next problems
          </button>
        </Link>
      </div>
    </div>
  );
}
