
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'


"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserAuth } from "./context/AuthContext";


function HomePage() {
  const { user, googleSignIn, logOut } = UserAuth();
  const [loading, setLoading] = useState(true);

  const handleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setLoading(false);
    };
    checkAuthentication();
  }, [user]);

  return (

    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/images/homebackground.png")' }}>
      <div className="w-full max-w-7xl mx-auto px-4">
        <header className="flex justify-between items-center py-6">
          <Link href="/">
            <div className="flex items-center">
              <Image 
                src="/images/Bull-ishLogo.png" 
                alt="Bull-ish Logo" 
                width={40} 
                height={40} 
                className="mr-2"
              />
              <span className="text-xl font-semibold">Bull.aio</span>
            </div>
          </Link>
          <nav>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </nav>
        </header>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
      <h1 className="text-7xl font-semibold mb-6">Interview Practice With</h1>
        <h1 className="text-7xl font-bold mb-6 bg-gradient-to-b from-[#5FC68C] to-[#D2F44A] text-transparent bg-clip-text">Bull.aio</h1>
        <p className="text-xl mb-12">An all.in.one software engineering interview practice AI made by USF engineers.</p>

        <Link
          href="/typeofquestion"
          className="hover:bg-opacity-90 rounded-md bg-[#82e0aa] px-8 py-3 font-medium text-black transition-colors"
        >
          Start Practicing
        </Link>
      </main>
    </div>
  );
}

export default HomePage;

