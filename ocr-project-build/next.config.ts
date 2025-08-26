import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental:{
    serverActions:{
      bodySizeLimit: '10mb', // Set to a higher limit if required
    },
  },
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
