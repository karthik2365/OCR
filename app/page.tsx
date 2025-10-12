"use client";

import { WobbleCardDemo } from "./_components/wobbleCard";
import { ImagesSliderDemo } from "./_components/imageSlider";
import HillFinder from "./maps/page";

export default function Home() {
  return (
    <div>
      <ImagesSliderDemo/>
      <br/>
      <br/>
      <WobbleCardDemo/>
      <HillFinder/>
    </div>
  );
}