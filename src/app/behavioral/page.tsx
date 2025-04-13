"use client";

import { useState, useRef, useEffect } from "react";
import SimpleAudioRecorder from "@/components/SimpleAudioRecorder";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Handle auto-play when audioUrl changes
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Auto-play failed:", error);
        // This can happen due to browser autoplay policies
        // We could show a message to the user here if needed
      });
    }
  }, [audioUrl]);

  // Function to handle transcription from SimpleAudioRecorder
  const handleTranscriptionReceived = (text: string) => {
    setPrompt(text);
    generateSpeech(text);
    // Optionally, you could auto-submit here if you want
    // handleSubmit(new Event('submit') as React.FormEvent);
  };

  // Modified to work directly with text, no event needed
  const generateSpeech = async (text: string) => {
    if (!text.trim()) {
      return; // Don't try to generate if no text
    }

    setIsLoading(true);

    try {
      const response = await fetch("../backend/api/behavioral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate speech");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("../backend/api/behavioral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate speech");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Text-to-Speech Demo</h1>
      {/* Audio Recorder Component */}
      <div className="mb-6 rounded-lg border border-gray-200 p-4">
        <h2 className="mb-2 text-xl font-semibold">Record Your Voice</h2>
        <SimpleAudioRecorder
          onTranscriptionComplete={handleTranscriptionReceived}
        />
      </div>

      {/* Text Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Text Input:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Transcribed text will appear here..."
            className="min-h-[100px] w-full rounded-lg border border-gray-300 p-3"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className={`w-full rounded-lg px-4 py-2 font-medium transition-colors ${
            isLoading || !prompt.trim()
              ? "cursor-not-allowed bg-gray-300 text-gray-500"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {isLoading ? "Generating..." : "Generate Speech"}
        </button>
      </form>
      {/* <form onSubmit={handleSubmit}>
        <label>
          Enter Prompt:
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., What else can option A do?"
            style={{ width: "100%", padding: "8px", margin: "10px 0" }}
            disabled={isLoading}
          />
        </label>
        <button
          type="submit"
          disabled={isLoading}
          style={{ padding: "8px 16px" }}
        >
          {isLoading ? "Generating..." : "Generate Speech"}
        </button>
      </form> */}
      {audioUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Generated Audio:</h3>
          <audio controls src={audioUrl} style={{ width: "100%" }} />
        </div>
      )}
    </div>
  );
}
