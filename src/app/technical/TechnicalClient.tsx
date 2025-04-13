// src/app/technical/TechnicalClient.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MicrophoneIcon } from "@heroicons/react/24/solid";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

type Props = {
  leetCodeQuestion: string;
};

export default function TechnicalClient({ leetCodeQuestion }: Props) {
  const [prompt, setPrompt] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showInitialButton, setShowInitialButton] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [llmActionState, setLlmActionState] = useState<
    "FOLLOW_UP" | "GUIDANCE" | "READY"
  >("FOLLOW_UP");
  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<any>(null);

  // Derived state to determine when to show the solution button
  const showSolutionButton = llmActionState === "READY";

  useEffect(() => {
    setShowInitialButton(true);
    setShowMessage(false);
    setShowPrompt(false);
  }, []);

  // Log the current action state whenever it changes
  useEffect(() => {
    console.log("Current LLM Action State:", llmActionState);
  }, [llmActionState]);

  const startRecording = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(transcript);
        setPrompt(transcript); // Update the prompt with the transcribed text
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        // Auto-submit when recording ends if there's a transcript
        if (transcript) {
          handleSubmit();
        }
      };

      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleButtonClick = async () => {
    try {
      if (audioRef.current) {
        setShowInitialButton(false);
        setShowMessage(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        audioRef.current.volume = 0.5;
        await audioRef.current.play();
        setTimeout(() => {
          setShowMessage(false);
          setShowPrompt(true);
        }, 9000);
      }
    } catch (err) {
      console.warn("Audio playback failed:", err);
    }
  };

  // Handle solution button click
  const handleSolutionClick = () => {
    console.log("Solution button clicked - navigating to solution page");
    window.location.href = "/step_2";
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

      // Get the action state from the response header
      const actionType = response.headers.get("X-Action-Type");
      if (actionType) {
        console.log("Received action type from API:", actionType);
        setLlmActionState(actionType as "FOLLOW_UP" | "GUIDANCE" | "READY");
      } else {
        console.warn("No X-Action-Type header received in response");
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      // Don't reset showMessage state here to prevent welcome message from showing again
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate speech");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });
    }
  }, [audioUrl]);

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto w-full max-w-7xl px-4">
        <header className="flex items-center justify-between py-6">
          <Link href="/">
            <div className="flex items-center">
              <div className="mr-2 h-10 w-10 rounded-full bg-[#82e0aa]"></div>
              <span className="text-xl font-semibold text-white">Bull.aio</span>
            </div>
          </Link>

          {/* Solution button in header when ready
          {showSolutionButton && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              onClick={handleSolutionClick}
              className="flex items-center rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
            >
              <span className="mr-2">View Solution</span>
              <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
            </motion.button>
          )} */}
        </header>
      </div>

      <audio
        ref={audioRef}
        src="/audio/test.mp3"
        preload="auto"
        playsInline
        onError={(e) => console.error("Audio error:", e)}
      >
        Your browser does not support the <code>audio</code> element.
      </audio>

      <AnimatePresence mode="wait">
        {showInitialButton && (
          <motion.div
            key="initial-button"
            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={handleButtonClick}
          >
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-green-400"
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                y: [0, 8, 0],
              }}
              exit={{ scale: 0 }}
              transition={{
                duration: 0.5,
                y: {
                  duration: 1.5,
                  ease: "easeInOut",
                },
              }}
            ></motion.div>
            <motion.p
              className="text-lg font-medium text-white"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.7, 1, 0.7],
                transition: {
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                },
              }}
            >
              Click me!
            </motion.p>
          </motion.div>
        )}
        {showMessage ? (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <motion.div
              className="space-y-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="flex items-center justify-center gap-3 text-6xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
              >
                <span
                  className="inline-block"
                  style={{
                    opacity: showInitialButton ? 0 : 1,
                    transition: "opacity 1s",
                  }}
                >
                  Hi there! I'm Bull.aio
                </span>
                <motion.div
                  className="h-10 w-10 rounded-full bg-green-400"
                  initial={{ scale: 1, x: -window.innerWidth / 2 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 70,
                    damping: 15,
                    delay: 0.5,
                    duration: 1.5,
                  }}
                />
              </motion.h1>
              <motion.p
                className="text-4xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 1.0 }}
              >
                I'm here to help you practice for your
                <br />
              </motion.p>
              <motion.p
                className="text-4xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4.5, duration: 1.5 }}
              >
                software engineering technical interview
              </motion.p>
            </motion.div>
          </div>
        ) : showPrompt ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center flex-grow text-white"
            style={{ minHeight: 'calc(100vh - 88px)' }}
          >
            <div className="w-full max-w-[600px] mx-auto px-4">
              <h1 className="text-3xl font-semibold text-center mb-4">Can you tell me about the problem?</h1>
              <div className="text-lg text-gray-300 mb-8 text-center">{leetCodeQuestion}</div>
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center mb-8">
                  <motion.button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-[#82e0aa] hover:bg-[#72d09a]'}`}
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      scale: isRecording ? [1, 1.1, 1] : 1,
                      transition: {
                        duration: 1.5,
                        repeat: isRecording ? Infinity : 0,
                        ease: 'easeInOut'
                      }
                    }}
                  >
                    <motion.div
                      animate={{
                        opacity: isRecording ? [1, 0.5, 1] : 1,
                        transition: {
                          duration: 1.5,
                          repeat: isRecording ? Infinity : 0,
                          ease: 'easeInOut'
                        }
                      }}
                    >
                      <MicrophoneIcon className="w-12 h-12 text-white" />
                    </motion.div>
                  </motion.button>
                  
                  <p className="text-gray-400 text-sm mt-4 text-center">
                    {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                    <br />
                    or input as text below.
                  </p>
                </div>

                <div>
                  <label className="block mb-2">
                    Your Input:
                    <textarea
                      ref={(textArea) => {
                        if (textArea) {
                          textArea.style.height = 'auto';
                          textArea.style.height = textArea.scrollHeight + 'px';
                        }
                      }}
                      value={prompt}
                      readOnly
                      placeholder="Your answer will be display here ..."
                      className="w-full p-2 mt-1 bg-gray-700/50 rounded border border-gray-600 text-white resize-none overflow-hidden min-h-[100px] cursor-not-allowed opacity-75"
                      disabled={isLoading}
                      rows={4}
                    />
                  </label>
                </div>

                {isLoading && (
                  <div className="text-sm text-gray-400">
                    Generating response...
                  </div>
                )}
              </div>


              {/* Solution button in prompt view when ready */}
              {showSolutionButton && showPrompt && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  onClick={handleSolutionClick}
                  className="mt-6 flex w-full items-center justify-center rounded-md bg-[#82e0aa] px-4 py-2 text-white transition-colors hover:bg-[#72d09a]"
                >
                  <span className="mr-2">You're ready! Start Coding!</span>
                </motion.button>
              )}

              {/* Debug information
              <div className="mt-8 rounded-md border border-gray-700 bg-gray-900/50 p-4">
                <h3 className="mb-2 text-lg font-semibold">Debug Info:</h3>
                <p>
                  Current Action State:{" "}
                  <span className="font-mono">{llmActionState}</span>
                </p>
                <p>
                  Show Solution Button:{" "}
                  <span className="font-mono">
                    {showSolutionButton ? "true" : "false"}
                  </span>
                </p>
              </div> */}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
