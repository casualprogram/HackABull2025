"use client";
import React, { useState, ChangeEvent } from "react";

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

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setCodeValue(e.target.value);
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

      // Call the onSubmit prop if provided
      if (onSubmit) {
        onSubmit(codeValue);
      }
    } catch (error) {
      console.error("Error during code submission:", error);
      alert(
        `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col space-y-6 p-6">
      <h2 className="text-xl font-semibold">Code Entry</h2>
      <div className="flex flex-col space-y-4">
        <textarea
          value={codeValue}
          onChange={handleChange}
          className="h-96 w-full rounded-md border border-gray-300 px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder={placeholder}
          spellCheck={false}
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
          <div className="prose max-w-none rounded-md bg-gray-50 p-4 whitespace-pre-wrap">
            {analysisResult}
          </div>
        </div>
      )}
    </div>
  );
}
