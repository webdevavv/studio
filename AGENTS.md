# Project instructions

Before working on this site, read [docs/AGENT-HANDBOOK.md](docs/AGENT-HANDBOOK.md) for services, approved prices, routes, components, mobile behavior, forms, and verification. Keep that handbook current when changing the site.

For design work, read and use `.agents/skills/taste-skill/SKILL.md` (upstream leonxlnx/taste-skill, commit 12af471f627f866411b4bd785b19646d3672784c). The user explicitly requested this skill. Project brief and user instructions take precedence. Preserve honest demo labels, conditional two-day promise, central prices and contacts, SSR, keyboard controls, and reduced-motion support. Work one approved stage at a time.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
