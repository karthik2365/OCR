"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import SigninSetup from "./login/signup"; // adjust the path
import { WobbleCardDemo } from "./_components/wobbleCard";
import { ImagesSliderDemo } from "./_components/imageSlider";
import HillFinder from "./_maps/maps";

export default function Home() {
  return (
    <div>
      {/* <WobbleCardDemo/> */}
      <ImagesSliderDemo/>
      <HillFinder/>
    </div>
  );
}