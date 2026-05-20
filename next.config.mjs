import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Pin workspace root so Turbopack doesn't pick the user's home dir.
  turbopack: {
    root: __dirname,
  },
  // Allow LAN access during dev (Network: 169.254.x.x / phone testing).
  allowedDevOrigins: ["169.254.83.119"],
}

export default nextConfig
