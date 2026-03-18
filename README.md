# CLI Proxy TS Monorepo

Repo này hiện được chuẩn hóa theo hướng TypeScript monorepo để phát triển backend và web UI song song.

## Cấu trúc chính

- `apps/backend/` — backend Node.js/TypeScript chính
- `apps/web/` — frontend web UI
- `packages/` — shared contracts, shared types, và workspace config
- `docs/` — tài liệu kiến trúc, module plan, sprint plan, và parity strategy cho toàn monorepo
- `legacy/go/` — codebase Go cũ, chỉ giữ lại để tham chiếu logic trong giai đoạn migration
- `legacy/web-reference/` — web UI cũ dùng làm tham chiếu cho flow, page, và component ideas

## Công cụ workspace

- `pnpm` để quản lý workspace
- `Turborepo` để chạy build/typecheck/dev theo graph của monorepo

## Lệnh thường dùng

- `pnpm install`
- `pnpm build`
- `pnpm typecheck`
- `pnpm dev:backend`
- `pnpm dev:web`
