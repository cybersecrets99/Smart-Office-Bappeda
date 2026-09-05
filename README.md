# e-KANJOLI Smart Office

Smart Office Bappeda & Litbang Terpadu — Persuratan, e-Disposisi, Tugas SLA, Perjalanan, Aset QR, Rapat, Arsip Google Ecosystem & PEKPPP.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Configure environment variables in `.env.local` based on `.env.example`.
3. Run the application: `npm run dev`

## Architecture

The application is being migrated incrementally to the final architecture:

`React UI → Application → Domain → Infrastructure`

The domain layer contains identity, RBAC 2-dimensi + ABAC, smart routing, workflow/state machine, document lifecycle and audit rules. Infrastructure adapters handle integrations and persistence concerns.

## Validation

Run TypeScript validation with `npm run lint`.
