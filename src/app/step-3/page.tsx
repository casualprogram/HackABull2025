// // app/summary/page.tsx
// import React from "react";
// import fs from "fs/promises";
// import path from "path";

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

// // This function will run on the server
// async function getJsonData() {
//   try {
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
// ): Promise<string>
//   try {
//     // Create a prompt for ChatGPT
//     const prompt = `
//         Create a summary of development based on the following JSON data.
//         Include specific examples where relevant.

//         First JSON data:
//         ${JSON.stringify(firstJson, null, 2)}

//         Second JSON data:
//         ${JSON.stringify(secondJson, null, 2)}
//       `;

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

//   export default async function SummaryPage() {
//     // Fetch the JSON data
//     const { firstJson, secondJson } = await getJsonData();

//     // Generate summary using ChatGPT
//     const summary = await generateSummary(firstJson, secondJson);

//     return (
//       <div className="container mx-auto p-4">
//         <h1 className="mb-6 text-2xl font-bold">Summary</h1>

//         <div className="rounded-lg bg-white p-6 shadow-md">
//           <div className="prose max-w-none">
//             {/* Display the generated summary */}
//             <div
//               dangerouslySetInnerHTML={{
//                 __html: summary.replace(/\n/g, "<br />"),
//               }}
//             />
//           </div>
//         </div>

//         <div className="mt-8">
//           <details className="mb-4">
//             <summary className="cursor-pointer font-semibold">
//               View Raw JSON Data
//             </summary>
//             <div className="mt-2 overflow-auto rounded bg-gray-100 p-4">
//               <h3 className="mb-2 text-lg font-medium">First JSON:</h3>
//               <pre className="text-sm">
//                 {JSON.stringify(firstJson, null, 2)}
//               </pre>

//               <h3 className="mt-4 mb-2 text-lg font-medium">Second JSON:</h3>
//               <pre className="text-sm">
//                 {JSON.stringify(secondJson, null, 2)}
//               </pre>
//             </div>
//           </details>
//         </div>
//       </div>
//     );
//   }
// app/summary/page.tsx
import React from "react";
import fs from "fs/promises";
import path from "path";

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Summary</h1>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="prose max-w-none">
          {/* Display the generated summary */}
          <div
            dangerouslySetInnerHTML={{
              __html: summary.replace(/\n/g, "<br />"),
            }}
          />
        </div>
      </div>

      <div className="mt-8">
        <details className="mb-4">
          <summary className="cursor-pointer font-semibold">
            View Raw JSON Data
          </summary>
          <div className="mt-2 overflow-auto rounded bg-gray-100 p-4">
            <h3 className="mb-2 text-lg font-medium">First JSON:</h3>
            <pre className="text-sm">{JSON.stringify(firstJson, null, 2)}</pre>

            <h3 className="mt-4 mb-2 text-lg font-medium">Second JSON:</h3>
            <pre className="text-sm">{JSON.stringify(secondJson, null, 2)}</pre>
          </div>
        </details>
      </div>
    </div>
  );
}
