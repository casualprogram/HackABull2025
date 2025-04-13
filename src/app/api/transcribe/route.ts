import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid"; // You'll need to install this: npm install uuid @types/uuid

// Interface for transcription data
interface TranscriptionEntry {
  id?: string;
  from: string;
  message: string;
  timestamp?: string; // ISO timestamp string instead of Firestore timestamp
  metadata?: {
    audioFileName?: string;
    audioFileType?: string;
    audioFileSize?: number;
  };
}

/**
 * Stores transcription as a JSON file
 */
async function storeTranscription(
  text: string,
  audioDetails?: { name: string; type: string; size: number },
): Promise<TranscriptionEntry> {
  try {
    // Create unique ID for the transcription
    const transcriptionId = uuidv4();

    // Create the transcription entry
    const entry: TranscriptionEntry = {
      id: transcriptionId,
      from: "user",
      message: text,
      timestamp: new Date().toISOString(), // Use ISO timestamp
      metadata: audioDetails
        ? {
            audioFileName: audioDetails.name,
            audioFileType: audioDetails.type,
            audioFileSize: audioDetails.size,
          }
        : undefined,
    };

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data", "transcriptions");
    fs.mkdirSync(dataDir, { recursive: true });

    // Write to JSON file
    const filePath = path.join(dataDir, `${transcriptionId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(entry, null, 2));

    console.log(
      `Transcription stored with ID: ${transcriptionId} at ${filePath}`,
    );

    return entry;
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

    // Store the transcription as JSON file
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
