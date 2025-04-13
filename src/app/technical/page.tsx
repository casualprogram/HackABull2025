// "use client";

// import { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// export default function Home() {
//   const [prompt, setPrompt] = useState("");
//   const [audioUrl, setAudioUrl] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [showMessage, setShowMessage] = useState(false);
//   const [showInitialButton, setShowInitialButton] = useState(true);
//   const [showPrompt, setShowPrompt] = useState(false);
//   const audioRef = useRef<HTMLAudioElement>(null);

//   useEffect(() => {
//     setShowInitialButton(true);
//     setShowMessage(false);
//     setShowPrompt(false);
//   }, []);

//   const handleButtonClick = async () => {
//     try {
//       if (audioRef.current) {
//         // Start the transition sequence
//         setShowInitialButton(false);

//         // Start the welcome message animation immediately
//         setShowMessage(true);

//         // Wait before playing audio
//         await new Promise((resolve) => setTimeout(resolve, 500));
//         audioRef.current.volume = 0.5;
//         await audioRef.current.play();

//         // Set timer for ending the sequence
//         setTimeout(() => {
//           setShowMessage(false);
//           setShowPrompt(true);
//         }, 9000);
//       }
//     } catch (err) {
//       console.warn("Audio playback failed:", err);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const response = await fetch("../backend/api/tts", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ prompt }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to generate speech");
//       }

//       const audioBlob = await response.blob();
//       const url = URL.createObjectURL(audioBlob);
//       setAudioUrl(url);
//       setShowMessage(true);
//     } catch (error) {
//       console.error("Error:", error);
//       alert("Failed to generate speech");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (audioUrl) {
//       const audio = new Audio(audioUrl);
//       audio.play().catch((error) => {
//         console.error("Audio playback failed:", error);
//         // Handle the error appropriately
//       });
//     }
//   }, [audioUrl]);

//   return (
//     <div className="min-h-screen bg-black">
//       <div className="mx-auto w-full max-w-7xl px-4">
//         <header className="flex items-center justify-between py-6">
//           <Link href="/">
//             <div className="flex items-center">
//               <div className="mr-2 h-10 w-10 rounded-full bg-[#82e0aa]"></div>
//               <span className="text-xl font-semibold text-white">Bull.aio</span>
//             </div>
//           </Link>
//         </header>
//       </div>

//       <audio
//         ref={audioRef}
//         src="audio/test.mp3"
//         preload="auto"
//         playsInline
//         onError={(e) => console.error("Audio error:", e)}
//       >
//         Your browser does not support the
//         <code>audio</code> element.
//       </audio>

//       <AnimatePresence mode="wait">
//         {showInitialButton && (
//           <motion.div
//             key="initial-button"
//             className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-4"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.5 }}
//             onClick={handleButtonClick}
//           >
//             <motion.div
//               className="flex h-10 w-10 items-center justify-center rounded-full bg-green-400"
//               initial={{ scale: 0 }}
//               animate={{
//                 scale: 1,
//                 y: [0, 8, 0],
//               }}
//               exit={{ scale: 0 }}
//               transition={{
//                 duration: 0.5,
//                 y: {
//                   repeat: Infinity,
//                   duration: 1.5,
//                   ease: "easeInOut",
//                 },
//               }}
//             ></motion.div>
//             <motion.p
//               className="text-lg font-medium text-white"
//               initial={{ opacity: 0 }}
//               animate={{
//                 opacity: [0.7, 1, 0.7],
//                 transition: {
//                   repeat: Infinity,
//                   duration: 1.5,
//                   ease: "easeInOut",
//                 },
//               }}
//             >
//               Click me!
//             </motion.p>
//           </motion.div>
//         )}
//         {showMessage ? (
//           <div className="absolute inset-0 flex items-center justify-center text-white">
//             <motion.div
//               className="space-y-4 text-center"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.8 }}
//             >
//               <motion.h1
//                 className="flex items-center justify-center gap-3 text-6xl font-bold"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 1.5 }}
//               >
//                 <span
//                   className="inline-block"
//                   style={{
//                     opacity: showInitialButton ? 0 : 1,
//                     transition: "opacity 1s",
//                   }}
//                 >
//                   Hi there! I'm Bull.aio
//                 </span>
//                 <motion.div
//                   className="h-10 w-10 rounded-full bg-green-400"
//                   initial={{ scale: 1, x: -window.innerWidth / 2 }}
//                   animate={{ scale: 1, x: 0 }}
//                   transition={{
//                     type: "spring",
//                     stiffness: 70,
//                     damping: 15,
//                     delay: 0.5,
//                     duration: 1.5,
//                   }}
//                 />
//               </motion.h1>
//               <motion.p
//                 className="text-4xl"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 2.5, duration: 1.0 }}
//               >
//                 I'm here to help you practice for your
//                 <br />
//               </motion.p>
//               <motion.p
//                 className="text-4xl"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 4.5, duration: 1.5 }}
//               >
//                 software engineering technical interview
//               </motion.p>
//             </motion.div>
//           </div>
//         ) : showPrompt ? (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.5 }}
//             className="flex flex-grow flex-col items-center justify-center text-white"
//             style={{ minHeight: "calc(100vh - 88px)" }}
//           >
//             <div className="mx-auto w-full max-w-[600px] px-4">
//               <h1 className="mb-4 text-2xl font-bold">Text-to-Speech Demo</h1>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label className="mb-2 block">
//                     Enter Prompt:
//                     <input
//                       type="text"
//                       value={prompt}
//                       onChange={(e) => setPrompt(e.target.value)}
//                       placeholder="e.g., What else can option A do?"
//                       className="mt-1 w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
//                       disabled={isLoading}
//                     />
//                   </label>
//                 </div>
//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="w-full rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
//                 >
//                   {isLoading ? "Generating..." : "Generate Speech"}
//                 </button>
//               </form>
//               {audioUrl && (
//                 <div className="mt-6 rounded bg-gray-800 p-4">
//                   <h3 className="mb-2 text-lg font-semibold">
//                     Generated Audio:
//                   </h3>
//                   <audio controls src={audioUrl} className="w-full" />
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         ) : null}
//       </AnimatePresence>
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showInitialButton, setShowInitialButton] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Initialize the component state only once on mount
    setShowInitialButton(true);
    setShowMessage(false);
    setShowPrompt(false);
    setShowContinueButton(false);
  }, []);

  const handleButtonClick = async () => {
    try {
      if (audioRef.current) {
        // Start the transition sequence
        setShowInitialButton(false);

        // Start the welcome message animation immediately
        setShowMessage(true);

        // Wait before playing audio
        await new Promise((resolve) => setTimeout(resolve, 500));
        audioRef.current.volume = 0.5;
        await audioRef.current.play();

        // Set timer for ending the sequence
        setTimeout(() => {
          setShowMessage(false);
          setShowPrompt(true);
        }, 9000);
      }
    } catch (err) {
      console.warn("Audio playback failed:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowContinueButton(false); // Hide continue button when submitting new prompt

    try {
      const response = await fetch("../backend/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      // Check if the action is "READY" from the custom header
      const action = response.headers.get("X-Action-Type");
      console.log("Action from header:", action);

      // ONLY set showContinueButton to true if action is exactly "READY"
      // No fallback conditions anymore
      if (action === "READY") {
        console.log(
          "Setting showContinueButton to true because action is READY",
        );
        setShowContinueButton(true);
      } else {
        console.log("Action is not READY, button will not show");
        setShowContinueButton(false);
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);

      // Clean up the previous audio URL if it exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(url);

      // Important: We now want to show the prompt area, not the message
      setShowMessage(false);
      setShowPrompt(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate speech");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Play audio when URL changes
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });

      // Cleanup function to revoke URL when component unmounts or audioUrl changes
      return () => {
        audio.pause();
        URL.revokeObjectURL(audioUrl);
      };
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
        </header>
      </div>

      <audio
        ref={audioRef}
        src="audio/test.mp3"
        preload="auto"
        playsInline
        onError={(e) => console.error("Audio error:", e)}
      >
        Your browser does not support the
        <code>audio</code> element.
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
                  repeat: Infinity,
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
            className="flex flex-grow flex-col items-center justify-center text-white"
            style={{ minHeight: "calc(100vh - 88px)" }}
          >
            <div className="mx-auto w-full max-w-[600px] px-4">
              <h1 className="mb-4 text-2xl font-bold">Text-to-Speech Demo</h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block">
                    Enter Prompt:
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., What else can option A do?"
                      className="mt-1 w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
                      disabled={isLoading}
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
                >
                  {isLoading ? "Generating..." : "Generate Speech"}
                </button>
              </form>
              {audioUrl && (
                <div className="mt-6 rounded bg-gray-800 p-4">
                  <h3 className="mb-2 text-lg font-semibold">
                    Generated Audio:
                  </h3>
                  <audio controls src={audioUrl} className="w-full" />

                  {/* Continue button using Link component - ONLY shows when action is READY */}
                  {showContinueButton && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="mt-4"
                    >
                      <Link href="/step-2" passHref>
                        <div className="w-full cursor-pointer rounded-md bg-[#82e0aa] px-6 py-3 text-center font-bold text-black transition-colors hover:bg-green-600">
                          Start Solving the Problem →
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
