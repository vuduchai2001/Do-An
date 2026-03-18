# Tổng quan kiến trúc

## Mục tiêu

Xây dựng một TypeScript monorepo theo hướng backend-first để thay thế dần service Go hiện tại, trong khi vẫn giữ lại những hành vi sản phẩm quan trọng:

- xác thực nhiều tài khoản theo từng provider
- routing và load balancing có nhận biết trạng thái account
- xử lý quota, cooldown, và retry
- gateway tương thích OpenAI
- management API phục vụ web UI
- translation giữa format gateway và format của provider
- background refresh và cập nhật runtime state

Trong monorepo này:

- `apps/backend` là backend chính
- `apps/web` là frontend web UI
- `packages/*` là lớp dùng chung
- `legacy/go/` là chuẩn tham chiếu hành vi ở giai đoạn migration
- `legacy/web-reference/` là nguồn tham chiếu UI/UX và flow quản trị cũ

---

## Các nguyên tắc thiết kế

### 1. Giữ hành vi domain, không giữ nguyên cấu trúc file

Codebase Go hiện tại đã có logic trưởng thành cho auth, routing, quota, translation, và runtime update. Bản Node.js cần giữ lại các khái niệm đó, nhưng không nên cố mô phỏng cây package Go một cách máy móc.

### 2. Ưu tiên modular monolith trước

MVP nên là một backend deploy được dưới dạng một service, với ranh giới module bên trong rõ ràng. Nếu tách microservice quá sớm, việc giữ parity và debug vận hành sẽ khó hơn nhiều.

### 3. Dùng `../legacy/go` làm chuẩn parity

Khi có chỗ nào không rõ hành vi, bản Go là nguồn tham chiếu chính. Bản Node.js cần có kiểm tra parity rõ ràng cho những module quan trọng nhất.

### 4. Ship theo từng lớp năng lực

Triển khai platform theo đúng thứ tự phụ thuộc:

1. shared types và configuration
2. persistence và domain models
3. auth orchestration và account inventory
4. routing và quota state
5. gateway/admin APIs
6. provider adapters và translation
7. runtime sync và background jobs

### 5. Cắt scope MVP một cách quyết liệt

Không nên đuổi theo full parity của tất cả provider ngay từ đầu. Hãy tập trung vào sản phẩm nhỏ nhất nhưng đủ chứng minh hướng đi của platform.

---

## Hình dạng runtime mục tiêu

## Mô hình process

Ở giai đoạn MVP, hệ thống nên chạy dưới một process Node.js duy nhất với:

- Fastify làm HTTP server
- scheduler chạy trong process cho các tác vụ refresh/cooldown
- PostgreSQL làm persistence chính
- websocket support ở mức tùy chọn nếu thật sự cần relay behavior

## Các bề mặt chính

### Gateway API

Đây là API surface bên ngoài dành cho client. Ở giai đoạn MVP, nên tập trung vào các endpoint tương thích OpenAI trước.

Trách nhiệm:

- xác thực request đầu vào của client gọi proxy
- normalize request
- chọn model/account qua routing engine
- gọi provider adapter tương ứng
- xử lý response dạng stream và non-stream
- phát sự kiện usage

### Admin API

Đây là control plane dành cho web UI.

Trách nhiệm:

- quản lý account
- orchestration các flow login
- quản lý config và routing rules
- xem usage và health
- xem trạng thái quota và can thiệp thủ công khi cần

### Background jobs

Trách nhiệm:

- refresh token sắp hết hạn
- gỡ cooldown và phục hồi account bị suspend khi phù hợp
- persist các thay đổi trạng thái nền
- đồng bộ lại runtime cache sau khi admin cập nhật dữ liệu

---

## Ranh giới module nội bộ

Backend nên được chia thành các module nội bộ sau.

### 1. `core/config`

Nạp biến môi trường và cấu hình YAML, validate chúng, và expose contract cấu hình runtime cho toàn hệ thống.

### 2. `core/domain`

Định nghĩa các kiểu dữ liệu chia sẻ và value object dùng xuyên suốt các module.

Ví dụ:

- provider id
- account id
- model id
- quota state
- routing strategy
- request/response envelope

### 3. `modules/persistence`

Xử lý truy cập database và repository layer.

### 4. `modules/auth`

Điều phối login, callback completion, token refresh, account inventory, và lưu trữ auth data.

### 5. `modules/routing`

Sở hữu logic chọn account, chiến lược routing, giới hạn retry, health state của account, và load balancing có nhận biết cooldown.

### 6. `modules/quota`

Theo dõi account đã exhausted, cửa sổ cooldown, và khả năng retry.

### 7. `modules/gateway`

Expose các API handler phía client và kết nối routing engine với provider adapters.

### 8. `modules/admin`

Expose control-plane API cho web UI.

### 9. `modules/providers`

Chứa các provider-specific adapter. Mỗi adapter phải triển khai một contract rõ ràng cho execution, model support, auth compatibility, và error mapping.

### 10. `modules/translator`

Triển khai pipeline chuyển đổi request/response giữa format gateway và format của provider.

### 11. `modules/usage`

Thu thập usage, success/failure, và các sự kiện liên quan đến quota.

### 12. `modules/runtime-sync`

Quản lý việc refresh runtime sau khi config hoặc account thay đổi. Module này thay thế mô hình vận hành dựa nhiều vào file watcher như ở bản Go.

### 13. `modules/ws-relay`

Module tùy chọn dành cho websocket relay behavior. Không bắt buộc trong MVP.

---

## Gợi ý cấu trúc source

```txt
apps/
  backend/
    src/
      app/
        server.ts
        plugins/
        routes/
      core/
        config/
        domain/
        errors/
        logging/
        utils/
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
      jobs/
      tests/
  web/
    src/
packages/
  api-contract/
  shared/
  tsconfig/
```

---

## Những gì chủ động loại khỏi MVP

- full parity của mọi provider
- full parity của toàn bộ translator matrix
- thay thế TUI
- persistence theo git/object-store
- kiến trúc worker phân tán
- analytics pipeline có cardinality cao

---

## Các vùng rủi ro cao nhất

### Auth

Auth theo từng provider là vùng tốn công nhất nếu muốn tái tạo đúng hành vi.

### Translator

Translation là vùng nhạy về behavior và sẽ cần fixture cũng như contract tests.

### Routing và quota state

Thử thách chính không nằm ở thuật toán round-robin thuần. Cái khó là giữ account state, quyết định retry, và cooldown timing luôn đúng khi có nhiều request đồng thời.
