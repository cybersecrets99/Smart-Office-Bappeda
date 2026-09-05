# E-KANJOLI Enterprise Architecture Blueprint v3.0

Project: e-Kanjoli Smart Office Bappeda & Litbang

## Golden Rules
1. Smart Routing by Unit Kerja + Level Jabatan.
2. Zero-Touch Archiving: final outputs are automatically PDF/QR and stored in Google Drive `08_ARSIP`; human archive menu is view-only.
3. Final documents are immutable; corrections use Revisi/Adendum and old versions are marked `[DIBATALKAN]`.
4. Staff create drafts, Kabid reviews/bounces, Kaban/Sekretaris approves and TTEs.

## Public Service Routing
- Sekretariat: PPID.
- Perencanaan Makro: LYN-001, LYN-005, LYN-006, LYN-008.
- Perencanaan Ekonomi: LYN-005/008 for economic OPD, LYN-007.
- Sosbud/Fispra: LYN-005/008 by domain.
- Litbang: LYN-002, LYN-003, LYN-004, LYN-009.

## CRUD / Identity
Authorization uses job level + unit, with ABAC-style resource context. Technical ADMIN_BIDANG is merged into staff authority; system administration remains in Sekretariat/SUPERADMIN.

## Workflow Hardening
- Bouncing to Front Office / cross-unit rerouting.
- Plh/Plt delegation for TTE/disposition.
- Kasubag Umum Fast-Track for routine mail.
- Telegram SLA escalation at warning/breach thresholds.

## Infrastructure
- Telegram OTP for critical actions.
- QR + cryptographic verification for final documents.
- Yearly Google Sheets sharding.
- Closed-loop disposition completion notifications.
- IndexedDB/offline outbox with idempotent synchronization.

## Execution Roadmap
1. Types/data for 2D identity and system configuration.
2. Context + smart routing.
3. Bouncing UI + OTP for finalization.
4. Move authorization/business rules from AppContext into application/domain services.
5. Complete operational source-tree migration to GitHub and verify build/tests.
