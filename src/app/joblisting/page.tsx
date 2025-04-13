// src/app/joblisting/page.tsx
import { promises as fs } from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";

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
    <div className="min-h-screen bg-black relative">
      <div className="absolute top-0 left-0 w-full h-[1006px] overflow-hidden">
        <Image
          src="/images/StageLightBackground 1.png"
          alt="Stage Light Background"
          width={1920}
          height={1080}
          className="object-cover w-full h-full"
          priority
        />
      </div>
      
      {/* Navigation Header */}
      <div className="relative z-10 w-full">
        <div className="mx-auto w-full max-w-7xl px-4">
          <header className="flex items-center justify-between py-6">
            <Link href="/">
              <div className="flex items-center">
                <Image
                  src="/images/Bull-ishLogo.png"
                  alt="Bull-ish Logo"
                  width={40}
                  height={40}
                  className="mr-2"
                />
                <span className="text-xl font-semibold text-white">Bull.aio</span>
              </div>
            </Link>
            <nav>
              <ul className="flex items-center space-x-4">
                <li>
                  <Link href="/contact" className="text-white hover:underline">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </header>
        </div>
      </div>
      
      <div className="relative z-10 mx-auto max-w-4xl p-6 pt-[335px]">
      <div className="text-center mb-8">
      <h1 className="mb-3 text-8xl font-bold bg-gradient-to-b from-[#FFFFFF] from-0% to-[#96A29C] to-100% bg-clip-text text-transparent">Bull.aio Job Board</h1>
        <p className="text-lg text-gray-400">These are all newly updated job available for our software engineering Bulls</p>
      </div>
      {jobs.length === 0 ? (
        <p className="text-gray-400">No job listings available.</p>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job, index) => (
            <div
              key={`${job.jobUrl || job.applyLink}-${index}`}
              className="rounded-xl border border-gray-800 bg-black p-5 relative overflow-hidden"
            >
              {job.jobUrl ? (
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-semibold text-white hover:text-[#5FC68C] transition-colors"
                >
                  {job.jobTitle}
                </a>
              ) : (
                <h2 className="text-xl font-semibold text-white">{job.jobTitle}</h2>
              )}
              <p className="mt-2 text-gray-300">
                {job.companyUrl ? (
                  <a
                    href={job.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:underline"
                  >
                    {job.company}
                  </a>
                ) : (
                  job.company
                )}
              </p>
              <div className="mt-3 flex items-center space-x-2 text-gray-400">
                <span>{job.location}</span>
                <span>•</span>
                <span>Posted: {job.datePosted}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
