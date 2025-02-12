/** @type {import('next').NextConfig} */

await import("./env.mjs");
import trace from "next/dist/trace/index.js";


const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
