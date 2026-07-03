import type { NextConfig } from "next";

const supabaseImageHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "alfsrxwabllyldcbofok.supabase.co";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: supabaseImageHost,
        pathname: "/storage/v1/object/public/**",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
