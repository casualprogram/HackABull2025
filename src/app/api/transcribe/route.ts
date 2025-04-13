// app/api/transcribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";
import { db } from "@/lib/firebase"; // Import your Firebase configuration
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Interface for transcription data
interface TranscriptionEntry {
  from: string;
  message: string;
  timestamp?: any; // Firestore timestamp
  metadata?: {
    audioFileName?: string;
    audioFileType?: string;
    audioFileSize?: number;
  };
}

/**
 * Stores transcription in Firebase Firestore
 */
async function storeTranscription(
  text: string,
  audioDetails?: { name: string; type: string; size: number },
): Promise<TranscriptionEntry> {
  try {
    // Create the transcription entry
    const entry: TranscriptionEntry = {
      from: "user",
      message: text,
      timestamp: serverTimestamp(), // Add server timestamp
      metadata: audioDetails
        ? {
            audioFileName: audioDetails.name,
            audioFileType: audioDetails.type,
            audioFileSize: audioDetails.size,
          }
        : undefined,
    };

    // Add document to Firestore
    const transcriptionsRef = collection(db, "transcriptions");
    const docRef = await addDoc(transcriptionsRef, entry);

    console.log(`Transcription stored with ID: ${docRef.id}`);

    // Return the entry with the document ID
    return {
      ...entry,
      id: docRef.id,
    } as TranscriptionEntry;
  } catch (error) {
    console.error("Error storing transcription:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 },
      );
    }

    // Log file details
    console.log(
      `Received audio file: ${audioFile.name}, type: ${audioFile.type}, size: ${audioFile.size} bytes`,
    );

    // Check if API key exists
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY not found in environment variables");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    // Initialize ElevenLabs client
    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    // Convert File to Blob
    const audioArrayBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioArrayBuffer], { type: audioFile.type });

    // Call ElevenLabs API
    console.log("Calling ElevenLabs API...");
    const transcription = await client.speechToText.convert({
      file: audioBlob,
      model_id: "scribe_v1",
      tag_audio_events: true,
      language_code: "eng",
      diarize: true,
    });

    console.log("Transcription received:", transcription);

    // Store the transcription in Firebase
    const storedEntry = await storeTranscription(transcription.text, {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
    });

    return NextResponse.json({
      ...transcription,
      stored: storedEntry,
    });
  } catch (error) {
    console.error("Error in transcription API:", error);
    return NextResponse.json(
      {
        error: "Failed to transcribe audio",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// // app/api/transcribe/route.ts
// // Speech to Text Conversion Logic
// import { NextRequest, NextResponse } from "next/server";
// import { ElevenLabsClient } from "elevenlabs";
// import fs from "fs";
// import path from "path";

// // Function to store transcription in a JSON file
// async function storeTranscription(text: string) {
//   try {
//     // Create data directory if it doesn't exist
//     const dataDir = path.join(process.cwd(), "data");
//     if (!fs.existsSync(dataDir)) {
//       fs.mkdirSync(dataDir, { recursive: true });
//     }

//     // Create the JSON file path
//     const filePath = path.join(dataDir, "transcriptions.json");

//     // Create the transcription entry
//     const entry = {
//       from: "user",
//       message: text,
//     };

//     // Read existing data or create new array
//     let transcriptions = [];
//     if (fs.existsSync(filePath)) {
//       const fileContent = fs.readFileSync(filePath, "utf8");
//       transcriptions = JSON.parse(fileContent);
//     }

//     // Add new entry and write back to file
//     transcriptions.push(entry);
//     fs.writeFileSync(filePath, JSON.stringify(transcriptions, null, 2));

//     console.log(`Transcription stored in ${filePath}`);
//     return entry;
//   } catch (error) {
//     console.error("Error storing transcription:", error);
//     throw error;
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();
//     const audioFile = formData.get("audio") as File;

//     if (!audioFile) {
//       return NextResponse.json(
//         { error: "No audio file provided" },
//         { status: 400 },
//       );
//     }

//     // Log file details
//     console.log(
//       `Received audio file: ${audioFile.name}, type: ${audioFile.type}, size: ${audioFile.size} bytes`,
//     );

//     // Check if API key exists
//     if (!process.env.ELEVENLABS_API_KEY) {
//       console.error("ELEVENLABS_API_KEY not found in environment variables");
//       return NextResponse.json(
//         { error: "API key not configured" },
//         { status: 500 },
//       );
//     }

//     // Initialize ElevenLabs client
//     const client = new ElevenLabsClient({
//       apiKey: process.env.ELEVENLABS_API_KEY,
//     });

//     // Convert File to Blob
//     const audioArrayBuffer = await audioFile.arrayBuffer();
//     const audioBlob = new Blob([audioArrayBuffer], { type: audioFile.type });

//     // Call ElevenLabs API
//     console.log("Calling ElevenLabs API...");
//     const transcription = await client.speechToText.convert({
//       file: audioBlob,
//       model_id: "scribe_v1",
//       tag_audio_events: true,
//       language_code: "eng",
//       diarize: true,
//     });

//     console.log("Transcription received:", transcription);

//     // Store the transcription in JSON file
//     const storedEntry = await storeTranscription(transcription.text);

//     //console.log("Transcription received:", transcription.text);
//     return NextResponse.json({
//       ...transcription,
//       stored: storedEntry,
//     });
//   } catch (error) {
//     console.error("Error in transcription API:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to transcribe audio",
//         details: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 },
//     );
//   }
// }
