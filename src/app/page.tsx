"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserAuth } from "./context/AuthContext";
import Image from "next/image";

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
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: 'url("/images/homebackground.png")' }}
    >
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
              <span className="text-xl font-semibold">Bull.aio</span>
            </div>
          </Link>
          <nav>
            <ul className="flex items-center space-x-4">
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact
                </Link>
              </li>
              <li>
                {loading ? null : !user ? (
                  <button 
                    onClick={handleSignIn} 
                    className="cursor-pointer border border-[#5FC68C] px-4 py-1 rounded text-[#5FC68C] hover:bg-[#5FC68C] hover:bg-opacity-10 transition-colors"
                  >
                    Login with Google
                  </button>
                ) : (
                  <div>
                    <p>Welcome, {user.displayName}</p>
                    <p className="cursor-pointer" onClick={handleSignOut}>
                      Sign out
                    </p>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </header>
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="mb-6 text-7xl font-semibold">Interview Practice With</h1>
        <h1 className="mb-6 bg-gradient-to-b from-[#5FC68C] to-[#D2F44A] bg-clip-text text-7xl font-bold text-transparent">
          Bull.aio
        </h1>
        <p className="mb-12 text-xl">
          An all.in.one software engineering interview practice AI made by USF
          engineers.
        </p>

        <div className="flex space-x-4">
        <Link
            href="/joblisting"
            className="rounded-md border border-[#5FC68C] px-8 py-3 font-medium text-[#5FC68C] hover:scale-105 transition-transform duration-200"
          >
            Today's Job
          </Link>
          
          <Link
            href="/typeofquestion"
            className="hover:bg-opacity-90 hover:scale-105 rounded-md bg-[#82e0aa] px-8 py-3 font-medium text-black transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Start Practicing
          </Link>

        </div>
      </main>
    </div>
  );
}

export default HomePage;
