"use client";

import { WobbleCardDemo } from "./_components/wobbleCard";
import { ImagesSliderDemo } from "./_components/imageSlider";

export default function Home() {
  return (
    <div>
      <ImagesSliderDemo/>
      <br/>
      <br/>
      <WobbleCardDemo/>
    </div>
  );
}