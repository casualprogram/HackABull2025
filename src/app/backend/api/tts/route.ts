// import { NextResponse } from "next/server";
// import { generateSpeech } from "./ElevenLabsAnalyze";

// export async function POST(request: Request) {
//   try {
//     const { prompt } = await request.json();

//     if (!prompt) {
//       return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
//     }

//     const audioBuffer = await generateSpeech(prompt);

//     return new NextResponse(audioBuffer, {
//       headers: {
//         "Content-Type": "audio/mpeg",
//         "Content-Disposition": "attachment; filename=output.mp3",
//       },
//     });
//   } catch (error) {
//     console.error("Error in TTS API:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 },
//     );
//   }
// }

// File: src/app/backend/api/tts/route.ts
import { NextResponse } from "next/server";
import { generateSpeech } from "./ElevenLabsAnalyze";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Get the audio buffer from your current generateSpeech function
    const audioBuffer = await generateSpeech(prompt);

    // Determine if this should be a READY action based on specific criteria
    // This is a placeholder - replace with your actual logic that determines
    // when the user should move to the next step
    const promptLower = prompt.toLowerCase();

    // Only set action to READY for very specific prompts that indicate
    // the user is ready to move on to solving the problem
    const isReady =
      promptLower.includes("i'm ready") ||
      promptLower.includes("let's solve") ||
      promptLower.includes("start the problem") ||
      promptLower.includes("begin solving");

    const action = isReady ? "READY" : "FOLLOW_UP";
    console.log("Setting action to:", action, "based on prompt:", prompt);

    // Create response with audio buffer
    const response = new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "attachment; filename=output.mp3",
        // Add the action as a custom header
        "X-Action-Type": action,
        // Add CORS headers to ensure the custom header is accessible
        "Access-Control-Expose-Headers": "X-Action-Type",
        "Access-Control-Allow-Origin": "*", // Or specific domain in production
      },
    });

    return response;
  } catch (error) {
    console.error("Error in TTS API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
