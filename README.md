# CarInsurancer

A personal project for comparing U.S. auto insurance quotes. Choose a car and coverage, then enter quotes from insurers. Automatic retrieval is pending provider access.

## Run locally

Use Node.js 22.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Run `npm run build` to verify a production build.

Vehicle options come from FuelEconomy.gov. To enable car images, set `CAR_IMAGE_API_KEY` in `.env.local` and keep it out of Git. Entered quotes clear on reload.

Built with Next.js, React, TypeScript, and Tailwind CSS. See [DESIGN.md](DESIGN.md).
