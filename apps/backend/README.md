# API backend workspace

Đây là backend Node.js/TypeScript chính của monorepo TS mới.

## Mục tiêu giai đoạn hiện tại

- xây backend-first control plane và gateway mới
- giữ `legacy/go/` làm nơi tham chiếu logic cũ
- chuẩn bị cho việc phát triển song song với web UI trong cùng monorepo

## Vai trò trong monorepo

- `apps/backend` — backend chính
- `apps/web` — frontend web UI
- `packages/*` — shared contracts, shared types, base config

## Tài liệu chung

Toàn bộ tài liệu kiến trúc, migration plan, module plan, và sprint plan hiện được đặt ở `../../docs/` để dùng chung cho toàn monorepo.

## Legacy references

- logic cũ: `../../legacy/go/`
- web UI cũ: `../../legacy/web-reference/`
