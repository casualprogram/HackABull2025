// app/api/save-code/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises"; // Using promises version for better async handling
import path from "path";

export async function POST(request: Request) {
  try {
    // Get the code from the request body
    const body = await request.json();
    const { code } = body;

    if (code === undefined) {
      return NextResponse.json(
        { success: false, message: "No code provided" },
        { status: 400 },
      );
    }

    // Create the data object
    const data = {
      total_code: code,
    };

    // Define the path to save the JSON file
    const filePath = path.join(process.cwd(), "code-data.json");

    // Write to the file (using async version)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: "Code saved successfully",
      filePath,
    });
  } catch (error) {
    console.error("Error saving code:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save code",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
