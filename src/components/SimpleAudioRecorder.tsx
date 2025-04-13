// components/SimpleAudioRecorder.tsx
// Component for Getting Audio from Microphone
"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SimpleAudioRecorderProps {
  onTranscriptionComplete?: (text: string) => void;
}

const SimpleAudioRecorder: React.FC<SimpleAudioRecorderProps> = ({
  onTranscriptionComplete,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<
    Array<{ blob: Blob; url: string; transcription?: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });

        const audioUrl = URL.createObjectURL(audioBlob);
        await transcribeAudioBlob(audioBlob);
        // // Add the new recording to the array
        // const newRecordings = [
        //   ...recordings,
        //   { blob: audioBlob, url: audioUrl },
        // ];
        // setRecordings(newRecordings);

        // // Automatically start transcription using the index of the recording we just added
        // const newIndex = newRecordings.length - 1;
        // transcribeRecording(newIndex);

        //const audioUrl = URL.createObjectURL(audioBlob);
        //setRecordings((prev) => [...prev, { blob: audioBlob, url: audioUrl }]);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Close the media stream
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    }
  };
  const transcribeAudioBlob = async (blob: Blob) => {
    try {
      setIsLoading(true);

      // Create FormData to send the audio file
      const formData = new FormData();
      formData.append("audio", blob);
      // const transcribeRecording = async (index: number) => {
      //   try {
      //     setIsLoading(true);
      //     const recording = recordings[index];

      //     // Create FormData to send the audio file
      //     const formData = new FormData();
      //     formData.append("audio", recording.blob);

      // Call our API route
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const data = await response.json();
      const audioUrl = URL.createObjectURL(blob);

      // Add the new recording with transcription already included
      const newRecording = {
        blob: blob,
        url: audioUrl,
        transcription: data.text,
      };
      // Update the recording with the transcription
      const updatedRecordings = [...recordings];
      // updatedRecordings[index] = {
      //   ...recording,
      //   transcription: data.text,
      // };

      //setRecordings(updatedRecordings);
      setRecordings((prev) => [...prev, newRecording]);

      if (onTranscriptionComplete && data.text) {
        onTranscriptionComplete(data.text);
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      alert(
        "Failed to transcribe: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // For use in parent component
  const MyComponent = React.forwardRef((props, ref) => {
    const isRecording = useRef(false);
    const isLoading = useRef(false);

    const startRecording = () => {
      /* ... */
    };
    const stopRecording = () => {
      /* ... */
    };
    const transcribeRecording = (index: number) => {
      /* ... */
    };

    React.useImperativeHandle(ref, () => ({
      startRecording,
      stopRecording,
      transcribeRecording,
      isRecording: isRecording.current,
      isLoading: isLoading.current,
    }));

    return <div>{/* ... */}</div>;
  });

  return (
    <motion.div 
      className="flex flex-col items-center justify-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isLoading}
        className={`w-20 h-20 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-[#82E0AA] hover:bg-[#66B18C]'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: isRecording ? [1, 1.1, 1] : 1,
          transition: {
            repeat: isRecording ? Infinity : 0,
            duration: 2
          }
        }}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-black"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={{ rotate: isRecording ? [0, 360] : 0 }}
          transition={{
            duration: 4,
            repeat: isRecording ? Infinity : 0,
            ease: "linear"
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </motion.svg>
      </motion.button>
      <AnimatePresence mode="wait">
        <motion.p 
          key={isRecording ? 'recording' : 'idle'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm text-gray-300 text-center"
        >
          {isRecording ? 'Recording in progress...' : 'Click to start recording'}
          <br />
          or input as text below.
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
};

export default SimpleAudioRecorder;
