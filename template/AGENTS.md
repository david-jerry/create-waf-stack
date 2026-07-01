# This is NOT the Next.js you know

This project uses Next.js 16, which has breaking changes from earlier versions — APIs, conventions, and file structure may differ from training data. Notable: middleware lives in `src/proxy.ts` (exporting `proxy`), and route groups each own their own root `<html>` (there is no top-level `app/layout.tsx`). Read the relevant guide in `node_modules/next/dist/docs/` before writing framework code, and heed deprecation notices.

See `CLAUDE.md` for the full architecture contract.
