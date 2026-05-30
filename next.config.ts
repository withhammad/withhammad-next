import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cms.withhammad.com" },
      { protocol: "https", hostname: "withhammad.com" },
      { protocol: "https", hostname: "replicate.delivery" },
    ],
  },
};

export default withPayload(nextConfig);
