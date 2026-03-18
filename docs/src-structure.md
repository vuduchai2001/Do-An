# Giải thích cấu trúc `src/`

Tài liệu này giải thích các file, thư mục, và module hiện có trong `apps/backend/src` sau Sprint 0. Mục tiêu là giúp người mới vào dự án đọc được cây source nhanh và hiểu phần nào đang là nền tảng, phần nào mới chỉ là placeholder chuẩn bị cho các sprint sau.

---

## Tổng quan

Hiện tại `apps/backend/src` được chia thành 5 phần chính:

```txt
src/
  app/
  core/
  jobs/
  modules/
  index.ts
```

Ý tưởng chung là:

- `index.ts` là điểm vào của ứng dụng
- `app/` lo bootstrap HTTP server và route registration
- `core/` chứa phần nền tảng dùng chung cho toàn hệ thống
- `modules/` chứa các business modules theo ranh giới domain
- `jobs/` dành cho background jobs và scheduler-related entrypoints

---

## File `src/index.ts`

### Vai trò

Đây là entrypoint nhỏ nhất của ứng dụng Node.js.

### Nhiệm vụ

- gọi hàm tạo server
- gọi hàm start server
- xử lý lỗi khởi động ở mức cao nhất

### Vì sao file này nên nhỏ

`index.ts` không nên chứa business logic, config logic, hay route definitions. Nó chỉ đóng vai trò “bật ứng dụng lên”. Cách tách này giúp test dễ hơn và tránh biến entrypoint thành một file phình to theo thời gian.

---

## Thư mục `src/app/`

### Vai trò

Đây là lớp bootstrap của HTTP application. Nếu `modules/` là nơi chứa nghiệp vụ, thì `app/` là nơi ghép các mảnh đó lại thành một server chạy được.

### Cấu trúc hiện tại

```txt
app/
  index.ts
  server.ts
  plugins/
  routes/
```

### `app/server.ts`

File này hiện là nơi:

- khởi tạo Fastify instance
- nạp config runtime
- gắn config vào app instance
- register routes
- start server

Trong tương lai, file này sẽ còn là nơi gắn thêm:

- logger plugin
- request id / tracing
- auth middleware ở mức app
- error handler toàn cục
- module registration theo phase

### `app/index.ts`

File re-export để tách cách import bootstrap logic ra khỏi implementation file. Mục tiêu là giữ import path gọn và chuẩn hóa điểm public của `app/`.

### `app/routes/`

Chứa các route-level plugin cơ bản. Hiện tại mới có `health.ts`.

#### `app/routes/health.ts`

Route health check của service. Đây là route tối thiểu để:

- kiểm tra app đang sống
- phục vụ deploy/monitoring ban đầu
- xác nhận server bootstrap đã hoạt động

### `app/plugins/`

Thư mục này hiện mới là placeholder. Về sau nên dùng cho các plugin cấp app như:

- logger setup
- request context
- auth integration
- module wiring

---

## Thư mục `src/core/`

### Vai trò

`core/` chứa các thành phần dùng chung cho toàn backend. Đây không phải là business logic của từng module cụ thể, mà là lớp nền phục vụ nhiều module cùng lúc.

### Cấu trúc hiện tại

```txt
core/
  config/
  domain/
  errors/
  logging/
  utils/
  index.ts
```

### `core/config/`

Đây là module cấu hình trung tâm.

Hiện tại nó gồm:

- `schema.ts` — định nghĩa schema bằng Zod
- `loader.ts` — đọc dữ liệu cấu hình và trả về config hợp lệ
- `index.ts` — public exports

#### Mục tiêu của `core/config`

- hợp nhất env vars và config file
- validate dữ liệu đầu vào
- cung cấp `AppConfig` typed cho toàn hệ thống

Trong các sprint sau, module này sẽ mở rộng ra để chứa:

- config cho database
- config cho auth providers
- config cho routing/quota/retry
- feature flags

### `core/domain/`

Đây là nơi đặt các type nền tảng của domain. Hiện tại nó chứa những khái niệm cơ bản như:

- `ProviderId`
- `AccountId`
- `ModelId`
- `RoutingStrategy`
- `QuotaState`
- `RequestEnvelope`
- `ResponseEnvelope`

Mục đích là để mọi module nói cùng một “ngôn ngữ domain” thay vì tự định nghĩa type riêng lẻ.

### `core/errors/`

Hiện là placeholder. Về sau nên chứa:

- error base classes
- domain errors
- provider errors đã normalize
- API-safe error mapping helpers

### `core/logging/`

Hiện là placeholder cho logging abstractions dùng chung. Về sau có thể chứa:

- logger factory
- request logger helpers
- audit logging helpers
- structured event emitters

### `core/utils/`

Nơi để các tiện ích chung, nhưng cần kiểm soát chặt để không biến thành “bãi chứa helper”. Chỉ nên đặt ở đây những hàm thực sự generic, không gắn business logic của một module riêng.

---

## Thư mục `src/modules/`

### Vai trò

Đây là trái tim của backend. Mỗi thư mục con trong `modules/` đại diện cho một vùng nghiệp vụ hoặc một capability lớn của hệ thống.

### Cấu trúc hiện tại

```txt
modules/
  admin/
  auth/
  gateway/
  persistence/
  providers/
  quota/
  routing/
  runtime-sync/
  translator/
  usage/
  ws-relay/
  index.ts
```

Hiện tại đa số các module mới chỉ có `types.ts` và `index.ts`. Đây là chủ ý đúng cho Sprint 0: khóa contract trước, implement sau.

### `modules/admin/`

Module dành cho control plane phục vụ web UI.

Về sau sẽ chứa:

- admin routes
- admin service layer
- account management use cases
- routing config management
- usage/quota inspection endpoints

### `modules/auth/`

Module điều phối login, callback, session, token refresh, và account inventory.

Hiện tại phần này mới dừng ở contracts như:

- `OAuthSession`
- `AuthCredentials`
- `AuthService`
- `AuthRepository`

Đây sẽ là một trong những module khó nhất của dự án.

### `modules/gateway/`

Module dành cho client-facing API. Đây là nơi nhận request từ client và phối hợp với routing + providers + translator để xử lý request.

Ở giai đoạn đầu, gateway nên tập trung vào OpenAI-compatible API trước.

### `modules/persistence/`

Module chứa repository contracts và về sau là database implementation. Nó sẽ là lớp nối giữa domain logic và PostgreSQL.

### `modules/providers/`

Module bao bọc logic riêng của từng provider. Về sau mỗi provider nên có adapter riêng để tránh trộn behavior giữa các provider vào cùng một chỗ.

### `modules/quota/`

Module theo dõi exhausted state, cooldown, và khả năng retry/recover của account.

### `modules/routing/`

Module chọn account cho request. Đây là nơi hiện thực các chiến lược như:

- `round-robin`
- `fill-first`
- retry/failover
- skip account không khỏe

### `modules/runtime-sync/`

Module đồng bộ runtime state khi config, account, hoặc quota state thay đổi. Nó thay thế vai trò của nhiều watcher-based flow trong bản Go.

### `modules/translator/`

Module chuyển đổi request/response giữa gateway format và provider format. Đây là một vùng nhạy về parity và sẽ cần test rất kỹ.

### `modules/usage/`

Module ghi nhận usage, audit events, và observability-related data ở cấp domain.

### `modules/ws-relay/`

Module tùy chọn cho websocket relay behavior. Chưa phải ưu tiên ở MVP.

### `modules/index.ts`

Public export file cho toàn bộ `modules/`. Có thể dùng để gom các public contracts chung, nhưng không nên biến thành chỗ re-export quá mức nếu làm mờ ranh giới module.

---

## Thư mục `src/jobs/`

### Vai trò

Nơi đặt background jobs và scheduler entrypoints.

Hiện mới là placeholder. Về sau thư mục này sẽ chứa:

- token refresh jobs
- cooldown recovery jobs
- runtime rebuild jobs
- scheduled cleanup jobs

Lưu ý: business rules vẫn nên nằm trong module domain tương ứng; `jobs/` chỉ nên là nơi trigger và orchestration các task nền.

---

## Cách đọc `src/` hiện tại cho đúng

Nếu bạn mới tham gia codebase, nên đọc theo thứ tự này:

1. `src/index.ts`
2. `src/app/server.ts`
3. `src/core/config/*`
4. `src/core/domain/*`
5. `src/modules/*/types.ts`
6. quay lại `docs/module-plan.md` để hiểu module nào sẽ được implement trước

---

## Những gì còn thiếu ở `src/` hiện tại

Sau Sprint 0, cấu trúc đã đúng hướng nhưng vẫn còn thiếu các phần sau:

- implementation thật của persistence
- domain entities chi tiết hơn
- route registration cho admin/gateway
- provider adapter đầu tiên
- routing engine implementation
- translator implementation đầu tiên
- error model và logging abstractions hoàn chỉnh

Điều này là bình thường. Mục tiêu của Sprint 0 là dựng khung đúng, không phải giải quyết hết nghiệp vụ.
