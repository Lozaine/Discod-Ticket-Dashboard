/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    DASHBOARD_SECRET: process.env.DASHBOARD_SECRET,
  },
}

module.exports = nextConfig