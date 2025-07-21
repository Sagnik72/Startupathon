# PropPlus.AI

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Dependencies

- next: 15.4.2
- react: 19.1.0
- react-dom: 19.1.0
- @heroicons/react: ^2.2.0
- @supabase/supabase-js: ^2.52.0
- @tailwindcss/postcss: ^4.1.11
- postcss: ^8.5.6
- tailwindcss: ^4.1.11
- typescript: ^5 (dev)
- eslint, @types/* (dev)

## Environment Variables

You must set the following environment variables for production deployment (e.g., in Vercel dashboard or a `.env` file):

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_KEY=your-supabase-anon-key
```

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Lint code

## Deployment (Vercel)

1. **Push your code to GitHub.**
2. **Connect your repository to Vercel** at https://vercel.com/import.
3. **Set environment variables** in the Vercel dashboard as described above.
4. Vercel will auto-detect Next.js and install dependencies from `package.json`.
5. The included `vercel.json` ensures smooth client-side routing for all pages.
6. After deployment, your app will be live at your Vercel domain.

## Notes
- Make sure your Supabase project has the correct schema (see code for required tables/columns).
- For custom domains or advanced configuration, see [Vercel Docs](https://vercel.com/docs).

---

## Getting Started (Local Development)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

---

For more, see [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
