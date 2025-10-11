"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import SigninSetup from "./login/signup"; // adjust the path

export default function Home() {
  return (
    <div>
      <SigninSetup />
      <SignedIn>
          <div className="flex flex-col items-center gap-4">
            <UserButton />
            <Link href="/dashboard" className="bg-purple-500 text-white px-4 py-2 rounded">
              Go to Dashboard
            </Link>
          </div>
      </SignedIn>
    </div>

  );
}