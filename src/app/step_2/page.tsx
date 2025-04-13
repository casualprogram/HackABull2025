"use client";
import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript"; // Example: JavaScript syntax
import { python } from "@codemirror/lang-python"; // Example: Python syntax
import { java } from "@codemirror/lang-java"; // Example: Java syntax
import { oneDark } from "@codemirror/theme-one-dark"; // Optional dark theme

interface CodeSubmitProps {
  onSubmit?: (code: string) => void;
  initialValue?: string;
  placeholder?: string;
}

export default function CodeInputWithButton({
  onSubmit,
  initialValue = "",
  placeholder = "Enter your code here...",
}: CodeSubmitProps) {
  const [codeValue, setCodeValue] = useState<string>(initialValue);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [language, setLanguage] =
    useState<keyof typeof languageExtensions>("javascript"); // Default language

  // Map languages to CodeMirror extensions
  const languageExtensions = {
    javascript: [javascript()],
    python: [python()],
    java: [java()],
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("Submitting code, length:", codeValue.length);

      // Send the code to the save API endpoint
      const saveResponse = await fetch("backend/api/code_analizer/save_code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: codeValue }),
      });

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        console.error("API response not OK:", saveResponse.status, errorText);
        throw new Error(`API error: ${saveResponse.status} - ${errorText}`);
      }

      const saveResult = await saveResponse.json();
      if (saveResult.success) {
        console.log("Code saved successfully:", saveResult);

        // After saving, analyze the code with the new API
        const analysisResponse = await fetch(
          "/backend/api/code_analizer/analyze",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: codeValue }),
          },
        );

        if (!analysisResponse.ok) {
          throw new Error(`Analysis API error: ${analysisResponse.status}`);
        }

        const analysisResult = await analysisResponse.json();
        if (analysisResult.success) {
          console.log("Analysis completed:", analysisResult);
          setAnalysisResult(analysisResult.analysis);
        } else {
          console.error("Analysis failed:", analysisResult);
          setAnalysisResult(
            "Failed to analyze code: " +
              (analysisResult.message || "Unknown error"),
          );
        }
      } else {
        console.error("Failed to save code:", saveResult);
        alert(`Failed to save code: ${saveResult.message || "Unknown error"}`);
      }

      if (onSubmit) {
        onSubmit(codeValue);
      }
    } catch (error) {
      console.error("Error during code submission:", error);
      alert(
        `An error occurred: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col space-y-6 p-6">
      <h2 className="text-xl font-semibold">Code Entry</h2>
      <div className="flex flex-col space-y-4">
        {/* Language Selector */}
        <div className="flex justify-end">
          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value as keyof typeof languageExtensions)
            }
            className="rounded-md border border-gray-300 px-2 py-1"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>

        {/* CodeMirror Editor */}
        <CodeMirror
          value={codeValue}
          height="400px"
          extensions={languageExtensions[language]}
          theme={oneDark} // Optional: dark theme
          onChange={(value) => setCodeValue(value)}
          placeholder={placeholder}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            autocompletion: true,
            indentOnInput: true,
          }}
          className="rounded-md border border-gray-300"
        />

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !codeValue.trim()}
            className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-blue-300"
          >
            {isLoading ? "Analyzing..." : "Done"}
          </button>
        </div>
      </div>

      {/* Analysis Results Section */}
      {analysisResult && (
        <div className="mt-8 rounded-md border p-4">
          <h3 className="mb-3 text-lg font-medium">Code Analysis Results</h3>
          <div className="prose max-w-none rounded-md p-4 whitespace-pre-wrap">
            {analysisResult}
          </div>
        </div>
      )}
    </div>
  );
}
