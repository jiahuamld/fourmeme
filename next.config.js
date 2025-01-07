/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: '/backendapi/:path*',
  //       destination: 'https://backend.agiverse.io/api/v1/:path*',
  //     },
  //   ];
  // },
  images: {
    domains: ['public.agiverse.io', 'backend.agiverse.io'],
  },
};

export default nextConfig;
