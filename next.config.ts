import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Self-contained server build for the Hostinger VPS (pm2 runs
  // .next/standalone/server.js). Vercel understands standalone natively, so
  // this is safe on both targets during the migration window.
  output: "standalone",
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cms.withhammad.com" },
      { protocol: "https", hostname: "withhammad.com" },
      { protocol: "https", hostname: "replicate.delivery" },
      // Payload uploads land in Vercel Blob. Without this, every CMS-uploaded
      // image (media + product covers) 400s through next/image in production.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default withPayload(nextConfig);
