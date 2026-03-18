# Kế hoạch module

Tài liệu này định nghĩa các module trong `apps/backend`, trách nhiệm của chúng, dependency giữa chúng, và thứ tự nên triển khai trong TS monorepo.

---

## Module 1 — Core config

### Mục đích

Cung cấp lớp cấu hình runtime có kiểu dữ liệu rõ ràng cho backend mới.

### Trách nhiệm

- nạp biến môi trường
- nạp file YAML cấu hình nếu có
- validate bằng Zod
- chuẩn hóa default cho routing, retry, quota, port, và feature flags

### Phụ thuộc

- không phụ thuộc module nào khác

### Tham chiếu từ Go

- `legacy/go/internal/config/config.go`

### Deliverable

- config schema
- config loader
- runtime defaults
- test coverage cho config

### Độ phức tạp

Thấp

---

## Module 2 — Core domain

### Mục đích

Định nghĩa các business type ổn định mà mọi module khác cùng dùng.

### Trách nhiệm

- domain enums và value objects
- kiểu dữ liệu cho request lifecycle
- kiểu dữ liệu cho account state
- kiểu dữ liệu cho routing strategy
- kiểu dữ liệu cho provider capability

### Phụ thuộc

- có thể phụ thuộc rất nhẹ vào core config nếu cần shared enum

### Deliverable

- package domain types
- shared errors và result types

### Độ phức tạp

Thấp đến trung bình

---

## Module 3 — Persistence

### Mục đích

Cung cấp storage contract và implementation dựa trên PostgreSQL cho account, session, routing rules, và runtime state.

### Trách nhiệm

- thiết kế schema
- repository layer
- transaction cho account/routing updates
- lưu bền OAuth session và account state

### Phụ thuộc

- core domain

### Tham chiếu từ Go

- `legacy/go/internal/store/postgresstore.go`
- `legacy/go/sdk/auth/filestore.go`

### Scope MVP

- chỉ dùng PostgreSQL

### Để sau

- git store
- object store

### Độ phức tạp

Trung bình

---

## Module 4 — Auth orchestration

### Mục đích

Quản lý login flow, callback completion, refresh, và account inventory.

### Trách nhiệm

- khởi động login flow
- hoàn tất auth callback/device flow
- persist credentials
- refresh token
- expose account status cho admin UI

### Phụ thuộc

- core domain
- persistence

### Tham chiếu từ Go

- `legacy/go/sdk/auth/manager.go`
- `legacy/go/sdk/auth/interfaces.go`
- `legacy/go/internal/auth/*`
- `legacy/go/internal/api/handlers/management/oauth_*`

### Scope MVP

- hỗ trợ 1–2 provider đầu tiên
- hỗ trợ authorization code và device flow nếu phù hợp

### Để sau

- refresh manager nâng cao theo từng provider
- các provider khó có browser/fingerprint quirks riêng

### Độ phức tạp

Cao

---

## Module 5 — Routing engine

### Mục đích

Chọn account cho mỗi request dựa trên strategy, health, và quota-aware rules.

### Trách nhiệm

- duy trì account pool theo model/provider
- hỗ trợ `round-robin` và `fill-first`
- retry trên credential khác khi cần
- bỏ qua account đang suspended hoặc exhausted
- expose lý do chọn account để phục vụ observability

### Phụ thuộc

- core domain
- persistence
- quota module

### Tham chiếu từ Go

- `legacy/go/internal/config/config.go` phần routing
- `legacy/go/internal/registry/model_registry.go`
- `legacy/go/sdk/cliproxy/auth/selector.go`
- `legacy/go/sdk/cliproxy/auth/scheduler.go`

### Độ phức tạp

Cao

---

## Module 6 — Quota và cooldown

### Mục đích

Theo dõi account bị exhausted và cửa sổ cooldown.

### Trách nhiệm

- đánh dấu account/model là exhausted
- duy trì cooldown đến thời điểm có thể phục hồi
- xóa hoặc kéo dài cooldown khi có bằng chứng mới
- expose khả năng recover cho routing engine

### Phụ thuộc

- core domain
- persistence

### Tham chiếu từ Go

- `legacy/go/internal/registry/model_registry.go`
- `legacy/go/internal/auth/kiro/cooldown.go`

### Độ phức tạp

Trung bình đến cao

---

## Module 7 — Gateway API

### Mục đích

Expose proxy API dành cho client.

### Trách nhiệm

- ưu tiên route tương thích OpenAI trước
- validate và normalize request
- gọi routing và provider execution
- xử lý streaming response
- phát usage events

### Phụ thuộc

- routing
- providers
- translator
- usage

### Tham chiếu từ Go

- `legacy/go/internal/api/server.go`
- `legacy/go/sdk/api/handlers/openai/*`

### Scope MVP

- chỉ cần surface kiểu OpenAI chat/completions trước

### Độ phức tạp

Trung bình đến cao

---

## Module 8 — Admin API

### Mục đích

Cung cấp control plane cho web UI.

### Trách nhiệm

- CRUD account
- endpoint cho login session
- endpoint cho routing config
- endpoint cho quota inspection và manual controls
- endpoint cho usage và health

### Phụ thuộc

- auth
- routing
- quota
- usage
- persistence

### Tham chiếu từ Go

- `legacy/go/internal/api/handlers/management/*`

### Độ phức tạp

Trung bình

---

## Module 9 — Provider adapters

### Mục đích

Đóng gói logic execution và capability riêng của từng provider.

### Trách nhiệm

- execute request lên upstream
- công bố model support và capability
- map provider errors sang platform errors
- phối hợp với auth và translator modules

### Phụ thuộc

- auth
- translator
- core domain

### Tham chiếu từ Go

- `legacy/go/internal/runtime/executor/*`
- `legacy/go/internal/auth/*`

### Scope MVP

- tối đa 2 provider đầu tiên

### Độ phức tạp

Cao

---

## Module 10 — Translator pipeline

### Mục đích

Chuyển đổi request và response giữa format gateway và format của provider.

### Trách nhiệm

- request envelope transformation
- response transformation
- stream chunk translation
- translation registry và middleware

### Phụ thuộc

- core domain

### Tham chiếu từ Go

- `legacy/go/sdk/translator/pipeline.go`
- `legacy/go/sdk/translator/registry.go`
- `legacy/go/internal/translator/*`

### Scope MVP

- chỉ implement các đường dịch cần thiết cho gateway/provider đã chọn

### Độ phức tạp

Cao

---

## Module 11 — Usage và observability

### Mục đích

Ghi nhận hoạt động request, usage theo account, và thông tin vận hành.

### Trách nhiệm

- request counters
- tích lũy token usage
- báo cáo success/failure
- audit events cho account state transition

### Phụ thuộc

- persistence hoặc in-memory store tùy phase

### Tham chiếu từ Go

- `legacy/go/internal/usage/logger_plugin.go`

### Độ phức tạp

Thấp đến trung bình

---

## Module 12 — Runtime sync và jobs

### Mục đích

Tính toán lại runtime state khi config hoặc account state thay đổi.

### Trách nhiệm

- refresh in-memory pools
- schedule token refresh jobs
- kích hoạt cooldown recovery checks
- rebuild cache cho model/account availability

### Phụ thuộc

- auth
- routing
- quota
- persistence

### Tham chiếu từ Go

- `legacy/go/internal/watcher/*`
- `legacy/go/sdk/cliproxy/auth/scheduler.go`

### Độ phức tạp

Trung bình đến cao

---

## Module 13 — Websocket relay

### Mục đích

Cung cấp websocket support theo kiểu relay trong trường hợp provider cần.

### Trách nhiệm

- quản lý websocket session
- correlation message
- relay request/response

### Phụ thuộc

- providers
- auth

### Tham chiếu từ Go

- `legacy/go/internal/wsrelay/*`

### Scope MVP

- tùy chọn, không bắt buộc ở giai đoạn đầu

### Độ phức tạp

Trung bình

---

## Thứ tự triển khai khuyến nghị

1. core config
2. core domain
3. persistence
4. auth orchestration skeleton
5. quota và cooldown
6. routing engine
7. admin API
8. gateway API
9. provider adapter đầu tiên
10. translator MVP
11. usage
12. runtime sync và jobs
13. provider adapter thứ hai
14. websocket relay nếu thật sự cần

---

## Các phần chủ động không port trực tiếp

- TUI
- login UX định hướng CLI
- mô hình vận hành dựa vào file watcher làm trung tâm
- full parity cho tất cả provider ngay trong đợt đầu
