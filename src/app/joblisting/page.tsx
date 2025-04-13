// src/app/joblisting/page.tsx
import { promises as fs } from "fs";
import path from "path";

// Interface for job data
interface Job {
  company: string;
  companyUrl: string;
  jobTitle: string;
  jobUrl: string;
  location: string;
  applyLink: string;
  datePosted: string;
  source?: string;
}

// Helper: Convert date string (e.g., "Oct 12") to Date object
function convertDate(dateString: string): Date | null {
  const months: { [key: string]: number } = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  const [monthStr, day] = dateString.split(" ");
  const month = months[monthStr];
  const currentYear = new Date().getFullYear();

  if (month === undefined || !day) {
    return null;
  }

  return new Date(currentYear, month, parseInt(day));
}

// Helper: Convert Markdown table to CSV
function convertMarkdownTableToCSV(markdown: string): string {
  const lines = markdown.trim().split("\n");
  const csvLines: string[] = [];

  const specialCharsRegex = /[\u21B3\u00A0]/g;
  const urlRegex = /<a href="([^"]+)">.*?<\/a>/g;

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cleanedLine = line.replace(urlRegex, "$1");

    const row = cleanedLine
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.replace(/(^\*{1,2}|\*{1,2}$)/g, ""))
      .map((item) => item.replace(specialCharsRegex, ""));

    if (row.length === 5) {
      const companyName = row[0].replace(/,/g, "");
      const jobTitle = row[1].replace(/,/g, " - ");
      const location = row[2].replace(/,\s+/g, " ");
      if (companyName) {
        csvLines.push(
          [companyName, jobTitle, location, row[3], row[4]].join(","),
        );
      }
    }
  }

  return csvLines.join("\n");
}

function filterFirstJobs(csvData: string): Job[] {
  const today = new Date();
  today.setDate(today.getDate() - 1);

  const lines = csvData.trim().split("\n");
  const jobs: Job[] = [];

  for (let i = 2; i < lines.length; i++) {
    const row = lines[i].split(",");
    if (row.length < 5) continue;

    const postDateStr = row[4]?.trim();
    const postDate = postDateStr ? convertDate(postDateStr) : null;

    if (postDate && postDate.toDateString() === today.toDateString()) {
      const companyRaw = row[0]?.trim() || "";
      const companyMatch = companyRaw.match(/\[(.+?)\]\((.+?)\)/);
      const companyName = companyMatch ? companyMatch[1] : companyRaw;
      const companyUrl = companyMatch ? companyMatch[2] : "";

      const jobTitleRaw = row[1]?.trim() || "";
      const jobTitleMatch = jobTitleRaw.match(/\[(.+?)\]\((.+?)\)/);
      const jobTitle = jobTitleMatch ? jobTitleMatch[1] : jobTitleRaw;
      const jobUrl = jobTitleMatch ? jobTitleMatch[2] : "";

      jobs.push({
        company: companyName,
        companyUrl,
        jobTitle,
        jobUrl,
        location: row[2]?.trim() || "",
        applyLink: row[3]?.trim() || "",
        datePosted: postDateStr || "",
        source: "FristSource",
      });
    }
  }

  return jobs;
}

function filterSecondJobs(csvData: string): Job[] {
  const today = new Date(); // Today

  const lines = csvData.trim().split("\n");
  const jobs: Job[] = [];

  for (let i = 2; i < lines.length; i++) {
    const row = lines[i].split(",");
    if (row.length < 5) continue; // Skip malformed rows

    const postDateStr = row[4]?.trim();
    const postDate = postDateStr ? convertDate(postDateStr) : null;

    if (postDate && postDate.toDateString() === today.toDateString()) {
      // Extract company name and URL, e.g., [Company](http://example.com)
      const companyRaw = row[0]?.trim() || "";
      const companyMatch = companyRaw.match(/\[(.+?)\]\((.+?)\)/);
      const companyName = companyMatch ? companyMatch[1] : companyRaw;
      const companyUrl = companyMatch ? companyMatch[2] : "";

      // Extract job title and URL, e.g., [Job Title](http://joburl.com)
      const jobTitleRaw = row[1]?.trim() || "";
      const jobTitleMatch = jobTitleRaw.match(/\[(.+?)\]\((.+?)\)/);
      const jobTitle = jobTitleMatch ? jobTitleMatch[1] : jobTitleRaw;
      const jobUrl = jobTitleMatch ? jobTitleMatch[2] : "";

      jobs.push({
        company: companyName,
        companyUrl,
        jobTitle,
        jobUrl,
        location: row[2]?.trim() || "",
        applyLink: row[3]?.trim() || "",
        datePosted: postDateStr || "",
        source: "SecondSource",
      });
    }
  }

  return jobs;
}

// Helper: Save jobs to JSON
async function saveJobsToJSON(jobs: Job[], outputPath: string): Promise<void> {
  await fs.writeFile(outputPath, JSON.stringify(jobs, null, 2), "utf-8");
}

async function fetchFirstJobs(): Promise<Job[]> {
  const markdownDownloadUrl = process.env.JobSource1;
  if (!markdownDownloadUrl) {
    console.error("JobSource1 is not defined in .env.local");
    return [];
  }

  const dataDir = path.join(process.cwd(), "src/app/joblisting/data");
  const csvFilePath = path.join(dataDir, "firstSource_jobs.csv");
  const jsonFilePath = path.join(dataDir, "firstSource_todayJobs.json");

  try {
    // Fetch Markdown file
    const response = await fetch(markdownDownloadUrl, {
      method: "GET",
      headers: { "Content-Type": "text/plain" },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch firstSource Markdown: ${response.status}`,
      );
    }

    const markdownData = await response.text();

    // Convert to CSV
    const csvContent = convertMarkdownTableToCSV(markdownData);

    // Save CSV to file
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(csvFilePath, csvContent, "utf-8");

    // Filter jobs
    const filteredJobData = filterFirstJobs(csvContent);

    // Save filtered jobs to JSON
    await saveJobsToJSON(filteredJobData, jsonFilePath);

    return filteredJobData;
  } catch (error) {
    console.error("Error processing firstSource listings:", error);
    return [];
  }
}

async function fetchSecondJobs(): Promise<Job[]> {
  const markdownDownloadUrl = process.env.JobSource2;
  if (!markdownDownloadUrl) {
    console.error("JobSource2 is not defined in .env.local");
    return [];
  }

  const dataDir = path.join(process.cwd(), "src/app/joblisting/data");
  const csvFilePath = path.join(dataDir, "secondSource_jobs.csv");
  const jsonFilePath = path.join(dataDir, "secondSource_todayJobs.json");

  try {
    // Fetch Markdown file
    const response = await fetch(markdownDownloadUrl, {
      method: "GET",
      headers: { "Content-Type": "text/plain" },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch secondSource Markdown: ${response.status}`,
      );
    }

    const markdownData = await response.text();

    // Convert to CSV
    const csvContent = convertMarkdownTableToCSV(markdownData);

    // Save CSV to file
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(csvFilePath, csvContent, "utf-8");

    // Filter jobs
    const filteredJobData = filterSecondJobs(csvContent);

    // Save filtered jobs to JSON
    await saveJobsToJSON(filteredJobData, jsonFilePath);

    return filteredJobData;
  } catch (error) {
    console.error("Error processing secondSource listings:", error);
    return [];
  }
}

// Main fetch and process logic
async function fetchAndProcessJobs(): Promise<Job[]> {
  // Fetch both sources concurrently
  const [firstJobs, secondJobs] = await Promise.all([
    fetchFirstJobs(),
    fetchSecondJobs(),
  ]);

  // Combine jobs
  return [...firstJobs, ...secondJobs];
}

// Server Component
export default async function JobListingPage() {
  const jobs = await fetchAndProcessJobs();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Job Listings</h1>
      {jobs.length === 0 ? (
        <p className="text-gray-500">No job listings available.</p>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job, index) => (
            <div
              key={`${job.jobUrl || job.applyLink}-${index}`}
              className="rounded-md border bg-white p-4 shadow-sm"
            >
              {job.jobUrl ? (
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-semibold text-blue-600 hover:underline"
                >
                  {job.jobTitle}
                </a>
              ) : (
                <h2 className="text-xl font-semibold">{job.jobTitle}</h2>
              )}
              <p className="mt-1 text-gray-700">
                {job.companyUrl ? (
                  <a
                    href={job.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {job.company}
                  </a>
                ) : (
                  job.company
                )}
              </p>
              <p className="text-gray-500">{job.location}</p>
              <p className="text-gray-500">Posted: {job.datePosted}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
