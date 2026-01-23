# ZIP Radius Finder

A simple web app that finds all ZIP codes within a specified radius of a center ZIP code using the ZipCodeAPI service.

## Features

- Enter a center ZIP code and radius (in miles)
- Get a deduplicated, sorted list of ZIP codes within that radius
- One-click copy to clipboard
- Clean, minimal UI with Arachnid Works branding

## Prerequisites

- Node.js 18+ (or 20+)
- A ZipCodeAPI key (get one free at [zipcodeapi.com](https://www.zipcodeapi.com))

## Local Development

1. Clone the repository

2. Copy the environment example and add your API key:
   ```bash
   cp .env.example .env.local
   ```

3. Edit `.env.local` and set your API key:
   ```
   ZIPCODEAPI_KEY=your_api_key_here
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Vercel Deployment

1. Import this repo into Vercel

2. In Project Settings → Environment Variables, add:
   - `ZIPCODEAPI_KEY` = your API key

3. Deploy

## API Limits (Free Tier)

- 10 requests per hour
- 240 requests per day
- US ZIP codes only

For higher limits, see [ZipCodeAPI Plans](https://www.zipcodeapi.com/Plans).

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Deployed on Vercel
