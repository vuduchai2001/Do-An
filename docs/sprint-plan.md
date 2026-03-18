# Kế hoạch sprint

Kế hoạch này giả định monorepo sẽ được triển khai với `apps/backend` là modular monolith backend bằng TypeScript, `apps/web` là frontend tách riêng, và mục tiêu là ship một backend-first MVP trước khi theo đuổi full parity.

---

## Sprint 0 — Nền tảng workspace

### Mục tiêu

Biến workspace Node.js thành một application shell thật sự.

### Phạm vi

- chốt tooling
- thêm linting và testing
- thêm config loading
- thêm logging conventions
- định nghĩa source layout

### Deliverable

- Fastify app bootstrap
- config module
- test runner setup
- module folders và naming conventions

### Điều kiện hoàn thành

- `apps/backend` build và typecheck được
- test runner hoạt động
- app khởi động được với cấu hình có cấu trúc rõ ràng

---

## Sprint 1 — Nền tảng domain và persistence

### Mục tiêu

Tạo data model ổn định cho backend.

### Phạm vi

- account entity
- provider entity
- oauth session entity
- routing rule entity
- quota state entity
- usage event entity
- database migrations

### Deliverable

- database schema
- repositories
- domain types package

### Điều kiện hoàn thành

- có database schema an toàn cho admin operations
- repository layer bao phủ được các domain entity chính

---

## Sprint 2 — Auth orchestration MVP

### Mục tiêu

Làm cho onboarding account hoạt động được với các provider đầu tiên.

### Phạm vi

- endpoint khởi động login flow
- endpoint hoàn tất callback
- device flow support nếu cần cho provider được chọn
- persist account records
- endpoint xem trạng thái account ở mức cơ bản

### Deliverable

- auth module contracts
- auth adapter cho provider đầu tiên
- admin endpoints cho auth sessions

### Điều kiện hoàn thành

- kết nối được ít nhất một account thật end-to-end

---

## Sprint 3 — Routing và quota engine

### Mục tiêu

Làm cho platform có thể chọn account an toàn giữa nhiều account.

### Phạm vi

- chiến lược round-robin
- chiến lược fill-first
- exhausted account marking
- cooldown windows
- retry boundaries và alternate credential selection

### Deliverable

- routing engine
- quota module
- test cho account selection và failover

### Điều kiện hoàn thành

- multi-account pool chạy đúng dưới test mô phỏng

---

## Sprint 4 — Admin API cho control plane

### Mục tiêu

Expose management surface mà web UI cần.

### Phạm vi

- account list/detail/update endpoints
- routing config endpoints
- quota state endpoints
- usage summary endpoints
- health endpoints

### Deliverable

- admin route module
- admin service layer

### Điều kiện hoàn thành

- web UI quản được account và xem được routing/quota state

---

## Sprint 5 — Gateway API MVP

### Mục tiêu

Nhận request từ client và execute được qua provider đầu tiên.

### Phạm vi

- request shape tương thích OpenAI trước
- execution dạng non-streaming và streaming
- request auth
- usage event emission

### Deliverable

- gateway routes
- execution path cho provider đầu tiên
- basic error mapping

### Điều kiện hoàn thành

- client gọi proxy thành công qua ít nhất một provider

---

## Sprint 6 — Translator MVP

### Mục tiêu

Thêm translation layer cần thiết cho cross-protocol support.

### Phạm vi

- request envelope
- response envelope
- translation registry
- chỉ 1 hoặc 2 translation path đầu tiên
- stream translation tests

### Deliverable

- translator pipeline
- translation fixtures
- parity tests đối chiếu với `../legacy/go` nếu có sample phù hợp

### Điều kiện hoàn thành

- một format gateway có thể route sang ít nhất hai behavior path ở upstream

---

## Sprint 7 — Background jobs và runtime sync

### Mục tiêu

Xử lý token refresh và runtime state recovery mà không cần can thiệp thủ công.

### Phạm vi

- refresh jobs
- cooldown release checks
- runtime cache invalidation và rebuild
- account health state updates

### Deliverable

- jobs module
- runtime sync module

### Điều kiện hoàn thành

- account có thể tự refresh và recover dưới test scenario

---

## Sprint 8 — Hardening và provider thứ hai

### Mục tiêu

Chứng minh kiến trúc có thể mở rộng ra ngoài một provider path duy nhất.

### Phạm vi

- provider adapter thứ hai
- tăng observability
- failure drills
- dọn dẹp performance và streaming behavior

### Deliverable

- support provider thứ hai
- dashboard/logs tốt hơn
- bản nháp operational runbook

### Điều kiện hoàn thành

- platform support ít nhất hai provider với routing behavior ổn định

---

## Điểm cắt MVP khuyến nghị

Nếu cần có internal release sớm, MVP có thể dừng sau Sprint 6. Khi đó nên để lại các phần sau cho giai đoạn sau:

- websocket relay
- provider nâng cao
- git/object storage
- full translator matrix
- full parity auth cho mọi provider
