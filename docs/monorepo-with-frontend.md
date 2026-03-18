# Tổ chức TS monorepo hiện tại

Tài liệu này mô tả cách monorepo hiện tại được tổ chức sau khi đã tách riêng backend, frontend, và shared packages.

---

## Mục tiêu của layout hiện tại

Monorepo hiện tại được tổ chức để đạt các mục tiêu sau:

- backend và frontend độc lập trong vòng đời build/dev/deploy
- có lớp shared code rõ ràng nhưng không làm mờ ranh giới app
- giữ `legacy/go/` làm chuẩn tham chiếu logic cũ trong giai đoạn migration
- giữ `legacy/web-reference/` làm nguồn tham chiếu UI/UX và feature flow cũ
- đủ gọn cho team nhỏ nhưng vẫn bền khi mở rộng

---

## Layout hiện tại

```txt
.
  apps/
    backend/
    web/
  packages/
    api-contract/
    shared/
    tsconfig/
  docs/
  legacy/
    go/
    web-reference/
  package.json
  pnpm-workspace.yaml
  turbo.json
```

---

## Ý nghĩa từng phần

### `apps/backend/`

Đây là backend TypeScript chính của hệ thống.

Nơi đây chứa:

- HTTP server
- business modules
- routing/quota/auth/translator logic
- background jobs

### `apps/web/`

Đây là frontend web UI.

Nơi đây sẽ phát triển thành control plane để:

- quản lý account
- cấu hình routing/quota
- xem usage/health
- trigger login flow và các thao tác quản trị

### `packages/api-contract/`

Chứa public API contracts dùng chung giữa web và api.

Chỉ nên đặt ở đây những thứ thật sự là contract công khai, ví dụ:

- DTO types
- response shapes
- request/response schemas ở mức API public

### `packages/shared/`

Chứa shared types và primitives thực sự dùng chung.

Không nên biến package này thành nơi chứa business logic backend.

### `packages/tsconfig/`

Chứa base tsconfig presets cho toàn monorepo.

### `docs/`

Đây là hub tài liệu chung cho toàn monorepo. Tài liệu ở đây không chỉ dành cho backend, mà phục vụ cả việc phối hợp giữa API, Web, shared packages, và đối chiếu với `legacy/go/`.

### `legacy/`

Đây là khu vực chứa toàn bộ nguồn tham chiếu cũ. Nó không còn là phần chính để phát triển sản phẩm mới, nhưng vẫn là nguồn tham chiếu rất quan trọng cho:

- auth behavior
- routing/quota semantics
- translator parity
- edge case handling
- UI flow, settings pages, và control-plane feature ideas

---

## Những gì nên ở lại trong `apps/backend`

Các vùng sau phải ở lại backend app, không nên move sang `packages/` quá sớm:

- `auth`
- `routing`
- `quota`
- `providers`
- `translator`
- `runtime-sync`
- `jobs`

Lý do là đây là business logic nội bộ của backend.

---

## Những gì hợp lý để đưa vào `packages/`

### `packages/api-contract/`

Nên dùng cho:

- admin API request/response types
- health/status payloads
- account summary DTOs

### `packages/shared/`

Nên dùng cho:

- shared enums thật sự chung
- shared ids/primitives
- helper thuần và độc lập với app

### `packages/tsconfig/`

Nên dùng cho:

- base TS config
- common compiler defaults

---

## Quy tắc phối hợp giữa API và Web

- `apps/web` chỉ giao tiếp với `apps/backend` qua public API contracts
- `apps/web` không import trực tiếp business logic từ `apps/backend/src/modules/*`
- `apps/backend` không phụ thuộc vào code của frontend
- shared code chỉ được đưa vào `packages/*` khi có nhu cầu dùng lại thật sự

---

## Kết luận ngắn

Layout hiện tại đã là layout nên dùng cho giai đoạn tiếp theo:

- `apps/backend` cho backend
- `apps/web` cho frontend
- `packages/*` cho shared layer
- `docs/` cho tài liệu chung
- `legacy/` cho logic/UI reference

Nói ngắn gọn, phần “thêm frontend rồi mới tính chuyện chia app” đã qua rồi. Repo hiện tại đã là một TS monorepo đúng nghĩa và các tài liệu nên phản ánh đúng trạng thái này.
