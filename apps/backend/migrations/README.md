# Backend migrations

Thư mục này chứa SQL migrations cho `apps/backend`.

## Quy ước

- Migrations được chạy theo thứ tự tên file tăng dần.
- Mỗi migration nên là forward-only và có thể đọc/audit được.
- Không phụ thuộc vào magic generation; SQL nên explicit để dễ review.

## Các lệnh

```bash
pnpm --filter @cliproxy/backend db:migrate
pnpm --filter @cliproxy/backend db:migrate:reset
```

## Yêu cầu

- `DATABASE_URL` phải trỏ tới PostgreSQL đang chạy.
- Có thể dùng `docker compose up -d` ở repo root để bật Postgres local.
