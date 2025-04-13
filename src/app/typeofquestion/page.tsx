"use client";

import Link from "next/link";
import { Handshake, CodeIcon } from "lucide-react";


export default function TypeOfQuestion() {

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full max-w-7xl mx-auto px-4">
        <header className="flex justify-between items-center py-6">
          <Link href="/">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#82e0aa] mr-2"></div>
              <span className="text-xl font-semibold">Bull.aio</span>
            </div>
          </Link>
        </header>
      </div>
      <div className="flex flex-col items-center justify-center flex-grow" style={{ minHeight: 'calc(100vh - 88px)' }}>
      
      <div className="mb-12 text-center">
        <h1 className="mb-2 text-5xl font-semibold">What type of questions</h1>
        <h1 className="text-5xl font-semibold">do you want to practice for?</h1>
      </div>
      
      <div className="flex w-full max-w-4xl justify-center gap-6 px-4">
        <Link href="/behavioral" className="w-full">
          <button
            className="flex w-full flex-col rounded-lg bg-zinc-800 p-6 text-left transition-all hover:bg-zinc-700"
          >
            <Handshake className="mb-4 h-10 w-10 text-[oklch(87.1%_0.15_154.449)]" />
            <h2 className="mb-2 text-2xl font-bold">Behavioral</h2>
            <p className="text-gray-300">
              Focus on questions about your past experiences, decision-making, and problem-solving approach.
            </p>
          </button>
        </Link>
        
        <Link href="/technical" className="w-full">
          <button
            className="flex w-full flex-col rounded-lg bg-zinc-800 p-6 text-left transition-all hover:bg-zinc-700"
          >
            <CodeIcon className="mb-4 h-10 w-10 text-[oklch(87.1%_0.15_154.449)]" />
            <h2 className="mb-2 text-2xl font-bold">Technical</h2>
            <p className="text-gray-300">
              Practice coding questions, algorithms, data structures, or system design.
            </p>
          </button>
        </Link>
      </div>
      </div>
    </div>
  );
}