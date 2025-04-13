// import React from "react";
// import fs from "fs/promises";
// import path from "path";
// import Link from "next/link";

// // Define interfaces for our JSON data
// // Update these interfaces to match your actual JSON structure
// interface FirstJsonData {
//   [key: string]: any;
//   error?: string;
// }

// interface SecondJsonData {
//   [key: string]: any;
//   error?: string;
// }

// interface JsonData {
//   firstJson: FirstJsonData;
//   secondJson: SecondJsonData;
// }

// // Define interfaces for the feedback cards
// interface CorrectnessData {
//   passed: string;
//   missedCase?: string;
// }

// interface EfficiencyData {
//   complexity: string;
//   suggestion?: string;
// }

// interface SummaryData {
//   pattern?: string;
//   recommendation?: string;
// }
// const PROMPT_TEMPLATE_PATH = path.join(
//   process.cwd(),
//   "src",
//   "app",
//   "step-3",
//   "summary.prompt",
// );
// const promptTemplate = await fs.readFile(PROMPT_TEMPLATE_PATH, "utf-8");

// // Function to read JSON files
// async function getJsonData(): Promise<JsonData> {
//   try {
//     // Replace these with your actual paths
//     // Mockup file paths - replace these with your actual paths
//     const file1Path = path.join(
//       process.cwd(),
//       "src",
//       "app",
//       "backend",
//       "data",
//       "chat_history.json",
//     );
//     const file2Path = path.join(process.cwd(), "./", "code-data.json");

//     // Read both files
//     const file1Data = await fs.readFile(file1Path, "utf8");
//     const file2Data = await fs.readFile(file2Path, "utf8");

//     // Parse JSON data
//     const firstJson: FirstJsonData = JSON.parse(file1Data);
//     const secondJson: SecondJsonData = JSON.parse(file2Data);

//     return {
//       firstJson,
//       secondJson,
//     };
//   } catch (error) {
//     console.error("Error loading JSON files:", error);
//     return {
//       firstJson: { error: "Failed to load first JSON file" },
//       secondJson: { error: "Failed to load second JSON file" },
//     };
//   }
// }

// // Function to generate summary using ChatGPT
// async function generateSummary(
//   firstJson: FirstJsonData,
//   secondJson: SecondJsonData,
// ): Promise<string> {
//   try {
//     // Create a prompt for ChatGPT
//     const prompt =
//       promptTemplate +
//       `
//       First JSON data:
//       ${JSON.stringify(firstJson, null, 2)}

//       Second JSON data:
//       ${JSON.stringify(secondJson, null, 2)}
//     `;

//     // Call ChatGPT API
//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify({
//         model: "gpt-4", // or whatever model you're using
//         messages: [
//           {
//             role: "system",
//             content:
//               "You are a helpful assistant that creates concise summaries with specific examples.",
//           },
//           {
//             role: "user",
//             content: prompt,
//           },
//         ],
//         temperature: 0.7,
//         max_tokens: 1000,
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.error?.message || "Failed to generate summary");
//     }

//     return data.choices[0].message.content;
//   } catch (error) {
//     console.error("Error generating summary:", error);
//     return "Failed to generate summary. Please try again later.";
//   }
// }

// export default async function SummaryPage() {
//   // Fetch the JSON data
//   const { firstJson, secondJson } = await getJsonData();

//   // Generate summary using ChatGPT
//   const summary = await generateSummary(firstJson, secondJson);

//   // Mock data for the feedback cards - in a real implementation, this would come from the backend
//   // You can parse the summary to extract this information or get it from another source
//   const correctnessData: CorrectnessData = {
//     passed: "80% correct!",
//     missedCase: "Missed edge case: empty array → expected 0, got undefined."
//   };

//   const efficiencyData: EfficiencyData = {
//     complexity: "O(n²) time complexity",
//     suggestion: "Consider using a hashmap to reduce lookup time."
//   };

//   const summaryData: SummaryData = {
//     pattern: "This fits the \"Sliding Window\" pattern. You can try: LC 76 \"Minimum Window Substring\"."
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
//       {/* Header Title */}
//       <h1 className="text-3xl font-semibold mb-8 text-center">
//         That's great! You've got it 🎉<br />
//         Here's some feedback from Bull.aio!
//       </h1>

//       {/* Feedback Cards Container */}
//       <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//         {/* Correctness Card */}
//         <div className="bg-[#1E1E1E] rounded-lg p-6 shadow-lg">
//           <h2 className="text-xl font-medium mb-4">Correctness</h2>
//           <p className="text-xl text-[#5FC68C] mb-2">You've got {correctnessData.passed}</p>
//           {correctnessData.missedCase && (
//             <p className="text-l text-gray-300">{correctnessData.missedCase}</p>
//           )}
//         </div>

//         {/* Efficiency Card */}
//         <div className="bg-[#1E1E1E] rounded-lg p-6 shadow-lg">
//           <h2 className="text-xl font-medium mb-4">Efficiency</h2>
//           <p className="text-xl text-[#5FC68C] mb-2">{efficiencyData.complexity}.</p>
//           {efficiencyData.suggestion && (
//             <p className="text-l text-gray-300">{efficiencyData.suggestion}</p>
//           )}
//         </div>

//         {/* Summary Card - Full Width */}
//         <div className="bg-[#1E1E1E] rounded-lg p-6 shadow-lg md:col-span-2">
//           <h2 className="text-xl font-medium mb-4">Summary</h2>
//           <div className="text-l text-gray-300">
//             {/* Display the AI-generated summary */}
//             <div
//               dangerouslySetInnerHTML={{
//                 __html: summary.replace(/\n/g, "<br />"),
//               }}
//             />
//             {summaryData.pattern && (
//               <p className="mt-4">{summaryData.pattern}</p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Navigation Buttons */}
//       <div className="flex flex-col sm:flex-row gap-4 w-full max-w-4xl">
//         <Link href="/step-2" className="flex-1">
//           <button className="w-full py-3 px-6 border text-[#5FC68C] rounded-lg hover:bg-[#5FC68C]/10 transition-colors">
//             Practice again
//           </button>
//         </Link>
//         <Link href="/typeofquestion" className="flex-1">
//           <button className="w-full py-3 px-6 bg-[#5FC68C] text-black rounded-lg hover:bg-[#5FC68C] transition-colors">
//             Practice next problems
//           </button>
//         </Link>
//       </div>
//     </div>
//   );
// }
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

// Function to analyze code complexity from secondJson
async function getComplexityData(
  secondJson: SecondJsonData,
): Promise<EfficiencyData> {
  try {
    // Extract code solution from secondJson (using whatever property is available in your JSON)
    const solution = secondJson || "";

    if (!solution) {
      return {
        complexity: "O(n) time complexity",
        suggestion: "Could not determine complexity - no code found.",
      };
    }

    // Create a prompt for complexity analysis
    const prompt = `
      Analyze the following code for time complexity only:
      
      ${solution}
      
      Provide:
      1. The Big O time complexity of approach (just the notation) if it's constant display O(1)
      2. A brief suggestion for optimization (one sentence only)
    `;

    // Call API for analysis
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an expert in algorithm analysis. Give concise answers.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to analyze complexity");
    }

    // Parse the response to extract complexity and suggestion
    const analysisText = data.choices[0].message.content;

    // Simple parsing - keep it minimal to avoid errors
    const timeComplexityMatch = analysisText.match(/O\(([^)]+)\)/i);
    let suggestion = "";

    // Look for a sentence that contains the word "suggestion", "optimize", or "improvement"
    const sentences = analysisText.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (
        /suggestion|optimize|improvement|consider|recommend/i.test(sentence)
      ) {
        suggestion = sentence.trim();
        break;
      }
    }

    // If no suggestion found, use the last sentence as a fallback
    if (!suggestion && sentences.length > 1) {
      suggestion = sentences[sentences.length - 1].trim();
    }

    return {
      complexity: timeComplexityMatch
        ? `O(${timeComplexityMatch[1]}) time complexity`
        : "O(n) time complexity",
      suggestion:
        suggestion || "Consider using a more efficient data structure.",
    };
  } catch (error) {
    console.error("Error analyzing complexity:", error);
    return {
      complexity: "O(n) time complexity",
      suggestion: "Analysis unavailable - using default value.",
    };
  }
}

// Function to generate point summary from secondJson
async function getCorrectnessData(
  secondJson: SecondJsonData,
): Promise<CorrectnessData> {
  try {
    // Extract code from secondJson (using whatever property is available in your JSON)
    const solution = secondJson || "";

    if (!solution) {
      return {
        passed: "80% correct!",
        missedCase: "Could not evaluate code - using default value.",
      };
    }

    // Create a prompt for score analysis
    const prompt = `
      Evaluate the following code solution on a scale of 1-10 where 10 is perfect:
      
      ${solution}
      
      Provide only a single number from 1-10 representing the score.
    `;

    // Call API for analysis
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an expert code reviewer. Give only the numeric score, nothing else.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 10,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to generate score");
    }

    // Parse the response to extract score
    const analysisText = data.choices[0].message.content.trim();
    const scoreMatch = analysisText.match(/(\d+)/);

    const score = scoreMatch
      ? Math.min(Math.max(parseInt(scoreMatch[1]), 1), 10)
      : 8;
    const scorePercentage = `${score * 10}% correct!`;

    return {
      passed: scorePercentage,
      missedCase: "Review edge cases for comprehensive testing.",
    };
  } catch (error) {
    console.error("Error generating correctness data:", error);
    return {
      passed: "80% correct!",
      missedCase: "Analysis unavailable - using default value.",
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

  // Get correctness and efficiency data using our new functions
  const correctnessData = await getCorrectnessData(secondJson);
  const efficiencyData = await getComplexityData(secondJson);

  // Mock data for the summary section - in a real implementation, this would come from the backend
  // You can parse the summary to extract this information or get it from another source
  const summaryData: SummaryData = {
    pattern:
      'This fits the "Sliding Window" pattern. You can try: LC 76 "Minimum Window Substring".',
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
      {/* Header Title */}
      <h1 className="mb-8 text-center text-3xl font-semibold">
        That's great! You've got it 🎉
        <br />
        Here's some feedback from Bull.aio!
      </h1>

      {/* Feedback Cards Container */}
      <div className="mb-8 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Correctness Card */}
        <div className="rounded-lg bg-[#1E1E1E] p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-medium">Correctness</h2>
          <p className="mb-2 text-xl text-[#5FC68C]">
            You've got {correctnessData.passed}
          </p>
          {correctnessData.missedCase && (
            <p className="text-l text-gray-300">{correctnessData.missedCase}</p>
          )}
        </div>

        {/* Efficiency Card */}
        <div className="rounded-lg bg-[#1E1E1E] p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-medium">Efficiency</h2>
          <p className="mb-2 text-xl text-[#5FC68C]">
            {efficiencyData.complexity}.
          </p>
          {efficiencyData.suggestion && (
            <p className="text-l text-gray-300">{efficiencyData.suggestion}</p>
          )}
        </div>

        {/* Summary Card - Full Width */}
        <div className="rounded-lg bg-[#1E1E1E] p-6 shadow-lg md:col-span-2">
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
        <Link href="/step-2" className="flex-1">
          <button className="w-full rounded-lg border px-6 py-3 text-[#5FC68C] transition-colors hover:bg-[#5FC68C]/10">
            Practice again
          </button>
        </Link>
        <Link href="/typeofquestion" className="flex-1">
          <button className="w-full rounded-lg bg-[#5FC68C] px-6 py-3 text-black transition-colors hover:bg-[#5FC68C]">
            Practice next problems
          </button>
        </Link>
      </div>
    </div>
  );
}
