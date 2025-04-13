// import React from 'react'
// import Link from 'next/link'

// function HomePage() {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
//       <div className="w-full max-w-7xl mx-auto px-4">
//         <header className="flex justify-between items-center py-6">
//           <div className="flex items-center">
//             <div className="w-10 h-10 rounded-full bg-[#82e0aa] mr-2"></div>
//             <span className="text-xl font-semibold">Bull.aio</span>
//           </div>
//           <nav>
//             <Link href="/contact" className="hover:underline">Contact</Link>
//           </nav>
//         </header>
//       </div>

//       <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
//         <h1 className="text-6xl font-bold mb-6">Bull.aio</h1>
//         <p className="text-xl mb-12">An AI all.in.one interview practice made by USF engineers.</p>
//         <Link
//           href="/practice"
//           className="bg-[#82e0aa] text-black font-medium py-3 px-8 rounded-md hover:bg-opacity-90 transition-colors"
//         >
//           Start Practicing
//         </Link>
//       </main>
//     </div>
//   );
// }

// export default HomePage

/** -------- -------- -------- -------- -------- -------- -------- -------- --------
 * THIS IS SPEECH TO TEXT FRONTEND SO FAR, I KNOW HOW IT WORK TONIGHT, I MIGHT FORGET TOMORROW.
 * MICHAEL AND YEF, YOU GUYS ARE FRONTEND MTF GOAT, PLS FIGURE IT OUT <3
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
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
      const response = await fetch("../backend/api/tts", {
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
      const response = await fetch("../backend/api/tts", {
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
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h1 
        className="text-4xl mb-12"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Can you tell me about the problem?
      </motion.h1>
      
      <motion.div 
        className="w-[855px] flex flex-col items-center gap-8"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <SimpleAudioRecorder
          onTranscriptionComplete={handleTranscriptionReceived}
        />

        <motion.div 
          className="w-full relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.textarea
            style={{
              boxShadow: '0 4px 32.1px rgba(255, 255, 255, 0.4)'
            }}
            className="w-[850px] h-32 bg-[#111] text-white rounded-lg p-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#4E4E4E]"
            placeholder="Your answer will be display here ..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          />
          <motion.button
            onClick={(e) => handleSubmit(e as any)}
            className="absolute right-4 bottom-4 text-green-500 hover:text-green-400"
            disabled={isLoading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </motion.svg>
          </motion.button>
        </motion.div>

        <audio
          ref={audioRef}
          src={audioUrl}
          className="hidden"
          autoPlay
        />
      </motion.div>
    </motion.div>
  );
}
