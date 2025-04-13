// app/api/transcriptions/route.ts
// Get stored transcriptions - Currently in local data
import { NextResponse } from "next/server";
import { getTranscriptions } from "@/utils/transcriptionUtils";

export async function GET() {
  try {
    const transcriptions = getTranscriptions();
    return NextResponse.json(transcriptions);
  } catch (error) {
    console.error("Error fetching transcriptions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch transcriptions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
