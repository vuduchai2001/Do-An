# Tài liệu TS monorepo

Thư mục này chứa blueprint kiến trúc, migration plan, và implementation plan cho toàn bộ TypeScript monorepo.

## Các tài liệu

- `architecture-overview.md` — kiến trúc đích, ranh giới runtime, và các nguyên tắc thiết kế
- `module-plan.md` — kế hoạch theo từng module, dependency, và thứ tự triển khai
- `project-structure.md` — giải thích cấu trúc project hiện tại, các vùng active, và cách đọc monorepo
- `coding-style.md` — quy ước coding style, import, naming, typing, và cách theo local conventions
- `monorepo-with-frontend.md` — đề xuất tổ chức lại monorepo nếu thêm frontend web UI
- `sprint-plan.md` — kế hoạch triển khai theo từng sprint từ MVP đến giai đoạn hardening
- `parity-strategy.md` — cách đối chiếu hành vi với `../legacy/go`

## Mục tiêu

Monorepo này không phải là một bản port từng dòng từ codebase Go. Đây là một hệ TypeScript mới, trong đó:

- `apps/backend` là backend chính
- `apps/web` là frontend web UI
- `packages/*` là lớp dùng chung cho contracts, shared types, và config nền
- `legacy/go/` chỉ được giữ lại để tham chiếu logic và hành vi trong giai đoạn migration
- `legacy/web-reference/` là web UI cũ dùng để tham chiếu flow, page structure, và feature ideas

## Ghi chú về layout hiện tại

Repo hiện đã được chuẩn hóa thành TS monorepo với `apps/backend`, `apps/web`, và `packages/*`. Thư mục `legacy/` giữ toàn bộ nguồn tham chiếu cũ cho giai đoạn migration.
