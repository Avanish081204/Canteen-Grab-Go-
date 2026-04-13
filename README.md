# Canteen Grab & Go

## Overview

**Canteen Grab & Go** is a smart canteen ordering and token management system that lets students place orders, track their status in real time, and reduce waiting time at the counter.

## Tech stack

- **Vite** (React + TypeScript)
- **Tailwind CSS**
- **shadcn-ui**

## Getting started (local development)

1. **Install dependencies**
   ```sh
   npm install
   ```
2. **Configure environment variables**

   Copy the example file and fill in your own credentials:
   ```sh
   cp .env.example .env
   ```
   Then open `.env` and add your values:
   | Variable | Description |
   |---|---|
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key |
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_RAZORPAY_KEY_ID` | Your Razorpay Key ID (test or live) |

   > ⚠️ **Never commit `.env` to version control.** It is listed in `.gitignore`.

3. **Run the dev server**
   ```sh
   npm run dev
   ```
4. Open the printed `http://localhost:PORT/` URL in your browser.

## Build for production

```sh
npm run build
```

The static production files will be generated in the `dist` folder.

## Deploying

You can host the contents of the `dist` folder on any static hosting service, for example:

- **Netlify** – drag and drop the `dist` folder in the dashboard.
- **Vercel** – import the repo, set `npm run build` as the build command and `dist` as the output folder.
- **GitHub Pages / any static server** – upload the contents of `dist` to your web root.
