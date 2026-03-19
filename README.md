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
- Root hiện có shared ESLint + Prettier config cho các workspace active

## Lệnh thường dùng

- `pnpm install`
- `pnpm build`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm format`
- `pnpm format:check`
- `pnpm dev:backend`
- `pnpm dev:web`
- `pnpm --filter @cliproxy/backend test`
- `pnpm --filter @cliproxy/backend test:watch`
- `pnpm --filter @cliproxy/backend lint`
- `pnpm --filter @cliproxy/backend format`
- `pnpm --filter @cliproxy/backend format:check`
- `pnpm --filter @cliproxy/backend db:migrate`
- `pnpm --filter @cliproxy/backend db:migrate:reset`
- `pnpm --filter @cliproxy/web lint`
- `pnpm --filter @cliproxy/web format`
- `pnpm --filter @cliproxy/web format:check`

## Hạ tầng local/dev

Repo active hiện có skeleton hạ tầng local cho PostgreSQL và Redis tại `compose.yaml`.

## Cấu hình backend

Backend hiện theo hướng **YAML-centric**:

- file cấu hình chính: `apps/backend/config.yaml`
- file mẫu: `apps/backend/config.example.yaml`
- precedence hiện tại: **defaults < YAML < env overrides**

Điều này có nghĩa là:

- các giá trị nền nên nằm trong YAML
- env dùng để override theo môi trường chạy
- secrets nhạy cảm vẫn nên ưu tiên đặt trong env thay vì commit vào YAML

### Khởi động hạ tầng

```bash
docker compose up -d
```

### Dừng hạ tầng

```bash
docker compose down
```

### Biến môi trường backend liên quan

- `DATABASE_URL` — override `postgres.url` trong YAML
- `REDIS_URL` — override `redis.url` trong YAML
- `PERSISTENCE_MODE` — chọn `memory` hoặc `postgres`
- `PORT` / `HOST` — override `server.port` / `server.host` trong YAML
- `LOG_LEVEL` / `LOG_PRETTY` — override `logging.*` trong YAML

### Lệnh persistence cho backend

```bash
pnpm --filter @cliproxy/backend db:migrate
pnpm --filter @cliproxy/backend db:migrate:reset
PERSISTENCE_MODE=postgres pnpm --filter @cliproxy/backend dev
```

Hiện tại backend đã có PostgreSQL-backed persistence cho `providers`, `accounts`, `oauthSessions`, `routingRules`, `quotaStates`, và `usageEvents`.
