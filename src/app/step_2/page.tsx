"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { oneDark } from "@codemirror/theme-one-dark";

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [language, setLanguage] =
    useState<keyof typeof languageExtensions>("javascript");

  const router = useRouter();

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

        // Analyze the code
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
          // Redirect to /step-3 after successful submission
          router.push("/step-3");
        } else {
          console.error("Analysis failed:", analysisResult);
          alert(
            "Failed to analyze code: " +
              (analysisResult.message || "Unknown error"),
          );
          setIsLoading(false); // Reset loading only on error
        }
      } else {
        console.error("Failed to save code:", saveResult);
        alert(`Failed to save code: ${saveResult.message || "Unknown error"}`);
        setIsLoading(false); // Reset loading only on error
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
      setIsLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="mx-auto flex max-w-4xl flex-col space-y-6 p-6 w-full">
        <h2 className="text-4xl font-semibold text-center mb-6">Now let's try to write down your code!</h2>
        <div className="flex flex-col space-y-4">
        {/* Language Selector */}
        <div className="flex justify-end">
          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value as keyof typeof languageExtensions)
            }
            className="rounded-md border border-gray-600 bg-gray-800 text-white px-2 py-1"
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
          
          theme={oneDark}

          onChange={(value) => setCodeValue(value)}
          placeholder={placeholder}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            autocompletion: true,
            indentOnInput: true,
          }}
          className="rounded-md border border-gray-700 shadow-[0_4px_32px_0_rgba(255,255,255,0.25)]"
        />

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !codeValue.trim()}
            className="rounded-md border border-[#5FC68C] bg-transparent px-6 py-3 font-medium text-[#5FC68C] hover:bg-[#5FC68C]/10 transition-colors focus:ring-2 focus:ring-[#5FC68C]/50 focus:outline-none disabled:opacity-50 disabled:border-gray-500 disabled:text-gray-500"
          >
            {isLoading ? "Analyzing..." : "Submit Code"}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
