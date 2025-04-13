"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          
          mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunksRef.current.push(e.data);
            }
          };

          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            chunksRef.current = [];
          };
        })
        .catch(err => console.error('Error accessing microphone:', err));
    }
  }, []);

  const handleRecordClick = () => {
    if (!mediaRecorderRef.current) return;

    if (!isRecording) {
      chunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[#E0E7FF] text-3xl font-semibold mb-8"
      >
        Can you tell me about the problem?
      </motion.h1>

      <motion.div
        className="relative"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.button
          className={`w-24 h-24 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500' : 'bg-[#82e0aa]'} shadow-lg hover:shadow-xl transition-shadow`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRecordClick}
        >
          <motion.div
            animate={{
              scale: isRecording ? [1, 1.2, 1] : 1
            }}
            transition={{
              repeat: isRecording ? Infinity : 0,
              duration: 1
            }}
          >
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V6z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </motion.div>
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[#E0E7FF] text-sm mt-4"
      >
        Click to start recording
        <br />
        or input as text below.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 w-full max-w-md"
      >
        <div className="w-full max-w-[600px] mx-auto px-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Your answer will be display here ..."
                  className="w-full p-2 mt-1 bg-gray-700 rounded border border-gray-600 text-white"
                  disabled={isLoading}
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors w-full"
            >
              {isLoading ? "Generating..." : "Generate Speech"}
            </button>
          </form>
          {audioUrl && (
            <div className="mt-6 p-4 bg-gray-800 rounded">
              <h3 className="text-lg font-semibold mb-2">Recorded Audio:</h3>
              <audio controls src={audioUrl} className="w-full" />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}