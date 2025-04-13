import { promises as fs } from "fs";
import path from "path";
import TechnicalClient from "./TechnicalClient";

// Define the absolute path to the file
const LEETCODE_QUESTION_PATH = path.join(
  process.cwd(),
  "src",
  "app",
  "backend",
  "data",
  "leetcode.txt",
);

export default async function TechnicalPage() {
  // Read the file server-side
  const leetCodeQuestion = await fs.readFile(LEETCODE_QUESTION_PATH, "utf-8");

  // Pass the content to the Client Component
  return <TechnicalClient leetCodeQuestion={leetCodeQuestion} />;
}
