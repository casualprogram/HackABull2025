// utils/transcriptionUtils.ts
// Utilities for data Storage
import fs from "fs";
import path from "path";

export interface TranscriptionEntry {
  from: string;
  message: string;
}

export function getTranscriptions(): TranscriptionEntry[] {
  try {
    const filePath = path.join(process.cwd(), "data", "transcriptions.json");

    if (!fs.existsSync(filePath)) {
      return [];
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading transcriptions:", error);
    return [];
  }
}
