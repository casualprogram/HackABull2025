"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import SimpleAudioRecorder from "@/components/SimpleAudioRecorder";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isWelcomeAudio, setIsWelcomeAudio] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showInitialButton, setShowInitialButton] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setShowInitialButton(true);
    setShowMessage(false);
    setShowPrompt(false);
  }, []);

  const handleButtonClick = async () => {
    try {
      // Start the transition sequence
      setShowInitialButton(false);
      setShowMessage(true);
      
      // Set welcome audio
      setAudioUrl("/audio/test2.mp3");
      setIsWelcomeAudio(true);
      
      // Set timer for ending the sequence
      setTimeout(() => {
        setShowMessage(false);
        setShowPrompt(true);
      }, 9000);
    } catch (err) {
      console.error("Error during transition:", err);
    }
  };

  // Handle auto-play when audioUrl changes
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch((error) => {
        console.error("Auto-play failed:", error);
        // This can happen due to browser autoplay policies
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
      setIsWelcomeAudio(false);
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
      setIsWelcomeAudio(false);
      setAudioUrl(url);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate speech");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full max-w-7xl mx-auto px-4">
        <header className="flex justify-between items-center py-6">
          <Link href="/">
            <div className="flex items-center">
              <Image src="/images/Bull-ishLogo.png" alt="Bull-ish Logo" width={40} height={40} className="mr-2" />
              <span className="text-xl font-semibold text-white">Bull.aio</span>
            </div>
          </Link>
        </header>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
        playsInline
        controls={isWelcomeAudio}
        onError={(e) => console.error('Audio error:', e)}
        hidden={true}
      >
        Your browser does not support the
        <code>audio</code> element.
      </audio>
      
      <AnimatePresence mode="wait">
        {showInitialButton && (
          <motion.div
            key="initial-button"
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={handleButtonClick}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ 
                scale: 1,
                y: [0, 8, 0]
              }}
              exit={{ scale: 0 }}
              transition={{
                duration: 0.5,
                y: {
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut"
                }
              }}
            >
              <Image src="/images/Bull-ishLogo.png" alt="Bull-ish Logo" width={40} height={40} />
            </motion.div>
            <motion.p
              className="text-white text-lg font-medium"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.7, 1, 0.7],
                transition: {
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut"
                }
              }}
            >
              Let's tap to start!
            </motion.p>
          </motion.div>
        )}
        {showMessage ? (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="text-4xl font-medium flex items-center justify-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
              >
                <span
                  className="inline-block"
                  style={{ opacity: showInitialButton ? 0 : 1, transition: 'opacity 1s' }}
                >
                  Hi there! I'm Bull.aio
                </span>
                <motion.div 
                  initial={{ scale: 1, x: -window.innerWidth / 2 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 70, damping: 15, delay: 0.5, duration: 1.5 }}
                >
                  <Image src="/images/Bull-ishLogo.png" alt="Bull-ish Logo" width={40} height={40} />
                </motion.div>
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
                software engineering behavioral interview
              </motion.p>
            </motion.div>
          </div>
        ) : showPrompt ? (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 88px)' }}>
            <div className="w-full max-w-2xl mx-auto px-6 py-8 flex flex-col items-center">
              <h1 className="text-white text-3xl font-bold mb-10 text-center">Behavioral Interview Practice</h1>
              
              {/* Audio Recorder Component */}
              <div className="w-full mb-12 p-6 bg-black rounded-xl flex justify-center">
                <SimpleAudioRecorder
                  onTranscriptionComplete={handleTranscriptionReceived}
                />
              </div>

              {/* Transcribed Text Display */}
              <div className="w-full space-y-6">
                <div>
                  <label className="block mb-3 text-white text-lg text-center">
                  </label>
                  <div className="relative">
                    <textarea
                      ref={(textArea) => {
                        if (textArea) {
                          textArea.style.height = 'auto';
                          textArea.style.height = textArea.scrollHeight + 'px';
                        }
                      }}
                      value={prompt}
                      readOnly
                      placeholder="Your response will appear here as you speak..."
                      className="w-full p-4 mt-1 bg-black rounded-xl border border-gray-800 text-white resize-none overflow-hidden min-h-[100px] cursor-not-allowed"
                      style={{ boxShadow: '0 4px 32.1px 0 rgba(255, 255, 255, 0.25)' }}
                      disabled={isLoading}
                      rows={4}
                    />
                  </div>
                </div>
                {isLoading && (
                  <div className="text-sm text-gray-400 text-center">
                    Generating response...
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
