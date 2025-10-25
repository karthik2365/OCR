import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Adjust for larger PDFs if needed
    },
  },};

export default nextConfig;
