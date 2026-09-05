# e-KANJOLI Final Architecture Completion

## Target
ERP Smart Office dengan Smart Routing, RBAC 2-Dimensi, ABAC, workflow state machine, immutable document lifecycle, event/outbox boundary, offline queue, audit trail, dan integration ports.

## Layer contract

`React UI -> Application Commands/Queries/Services -> Domain Identity/Authorization/Routing/Workflow/SLA/Documents/Audit/Events -> Infrastructure Outbox/Offline/Integrations`

## Rules enforced in code

- Identity memakai Level Jabatan + Unit Kerja sebagai dasar policy.
- Smart Routing memakai unit, owner, dan assignee; akses resource tidak lagi hanya berdasarkan role string.
- Workflow mempunyai transition guard terpusat.
- TTE/OTP/archive dibatasi pada level pimpinan.
- Dokumen final/signed/archived immutable; perubahan menggunakan Rev./Adendum atau pembatalan.
- Arsip publik tidak menyediakan mutasi manual; finalisasi menghasilkan status archived/closed melalui workflow.
- Application command boundary menyediakan authorization guard sebelum mutation.
- Offline/outbox dan event contracts tersedia sebagai infrastructure boundary.

## Verification

- TypeScript `tsc --noEmit` berhasil pada source hasil refactor.
- Production build masih memerlukan instalasi optional native Rollup dependency pada environment build; ini merupakan dependency/runtime issue, bukan TypeScript architecture error.

## Scope note

Architecture layer is complete as a refactoring target. Full source-tree synchronization from the extracted application remains a separate repository migration task and must not be represented as complete until every original source/data/config file is present in `main`.
