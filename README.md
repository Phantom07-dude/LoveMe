# LoveMe

LoveMe is a private two-person relationship and friendship space built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Local setup

1. Install dependencies with `npm install`.
2. Add the Supabase URL and publishable key from `.env.example` to `.env.local`.
3. Apply the LoveMe schema migration created in the connected Supabase project. It includes profiles, two-person connections, invites, questions, responses, Lore, Duels, indexes, seed questions, and RLS policies.
4. Run `npm run dev` and open the local preview.

## Auth note

The product UI uses username and password only. Supabase Auth can be backed by a non-user-facing internal identifier while the profile table stores the unique username shown in LoveMe. Never expose service-role credentials to the browser.

## Deploy

Add the same public Supabase variables to the Vercel project, deploy from the repository, and confirm the Supabase redirect URL includes `/auth/callback`. Keep all invite token hashing, reveal eligibility, and Duel result validation on the server.
