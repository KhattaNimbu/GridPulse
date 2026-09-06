import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: 'standalone',
  // The workspace root has its own lockfile alongside this app's, which
  // makes Next infer a monorepo root and nest the standalone output an
  // extra directory deep. Pin it so `.next/standalone/server.js` lands
  // where the Dockerfile expects it.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
