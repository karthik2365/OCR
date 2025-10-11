"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import SigninSetup from "./login/signup"; // adjust the path
import { WobbleCardDemo } from "./_components/wobbleCard";
import { ImagesSliderDemo } from "./_components/imageSlider";

export default function Home() {
  return (
    <div>
      {/* <WobbleCardDemo/> */}
      <ImagesSliderDemo/>
            <Link href="/dashboard" className="bg-purple-500 text-white px-4 py-2 rounded">
              Go to Dashboard
            </Link>
      <SigninSetup/>
    </div>
  );
}