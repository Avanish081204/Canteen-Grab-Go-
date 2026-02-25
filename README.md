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
2. **Run the dev server**
   ```sh
   npm run dev
   ```
3. Open the printed `http://localhost:PORT/` URL in your browser.

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
