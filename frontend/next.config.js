/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  reactStrictMode: true,
  // Prefer TypeScript route files and ignore .js to avoid duplicate route conflicts
  pageExtensions: ['tsx', 'ts']
}
