"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

function signinSetup(){
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-6">Welcome to Clerk + Convex App</h1>

      <SignedOut>
        <div className="flex gap-4">
          <SignInButton mode="modal">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="bg-green-500 text-white px-4 py-2 rounded">Sign Up</button>
          </SignUpButton>
        </div>
      </SignedOut>


    </main>
  );
}

export default signinSetup;