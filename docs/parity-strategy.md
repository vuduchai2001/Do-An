# Chiến lược parity

Bản rewrite TypeScript nên dùng implementation Go trong `../legacy/go` làm chuẩn tham chiếu cho các hành vi quan trọng. Điều này không có nghĩa là mọi tính năng của Go đều phải được implement ngay trong hệ mới.

---

## Những gì bắt buộc phải giữ parity về hành vi

### 1. Hành vi chọn account

Node.js phải bám đúng semantics của:

- `round-robin`
- `fill-first`
- retry limits
- bỏ qua account đang exhausted hoặc suspended
- cooldown-aware recovery

Vùng tham chiếu trong Go:

- `legacy/go/internal/config/config.go`
- `legacy/go/internal/registry/model_registry.go`
- `legacy/go/sdk/cliproxy/auth/selector.go`
- `legacy/go/sdk/cliproxy/auth/scheduler.go`

### 2. Semantics của auth orchestration

Node.js phải bám theo các khái niệm trong Go về:

- khởi động login theo provider
- hoàn tất callback
- persist token
- refresh scheduling
- biểu diễn metadata của account

Vùng tham chiếu trong Go:

- `legacy/go/sdk/auth/*`
- `legacy/go/internal/auth/*`
- `legacy/go/internal/api/handlers/management/oauth_*`

### 3. Semantics của translation

Node.js phải giữ đúng hình dạng và ý nghĩa của translation pipeline, đặc biệt với các format được chọn cho MVP.

Vùng tham chiếu trong Go:

- `legacy/go/sdk/translator/*`
- `legacy/go/internal/translator/*`

### 4. Hành vi của gateway

Node.js phải khớp với:

- cách xử lý streaming và non-streaming
- request normalization
- kiểu propagate error
- thời điểm phát usage events

Vùng tham chiếu trong Go:

- `legacy/go/internal/api/server.go`
- `legacy/go/sdk/api/handlers/*`

---

## Những gì chưa cần parity ngay

- TUI
- tất cả provider trong `legacy/go/internal/auth/*`
- tất cả translator pairing trong `legacy/go/internal/translator/*`
- mọi storage backend
- mọi CLI convenience path

---

## Quy trình parity thực tế

### Bước 1 — Chọn capability slice

Không nên so sánh cả hệ thống cùng lúc. Hãy so sánh từng lát chức năng nhỏ.

Ví dụ:

- request tương thích OpenAI đi qua provider A
- multi-account selection dưới round-robin
- cooldown recovery sau khi quota bị exceeded

### Bước 2 — Ghi lại hành vi tham chiếu từ Go

Với mỗi slice, cần xác định:

- các file Go quan trọng
- input kỳ vọng
- output kỳ vọng
- các edge condition

### Bước 3 — Viết contract tests cho Node

Trước hoặc trong lúc implement, tạo contract tests để assert cùng một business behavior cho slice đã chọn.

### Bước 4 — Ghi nhận rõ các khác biệt có chủ đích

Nếu Node.js cố ý đơn giản hóa hoặc thay đổi một hành vi nào đó, phải ghi rõ trong module docs và release notes, không để drift xảy ra một cách âm thầm.

---

## Bảng theo dõi mức parity cho MVP

Với mỗi module trong MVP, theo dõi theo các mức:

- **Chưa bắt đầu**
- **Đã khớp về mặt khái niệm**
- **Đã khớp qua test**
- **Đã khớp ở mức production**

Cách này giúp migration progress được nhìn thấy rõ mà không giả vờ là full parity đã tồn tại quá sớm.

---

## Các mục tiêu parity nên làm đầu tiên

1. routing strategies và retry/cooldown behavior
2. auth lifecycle của provider đầu tiên
3. request path tương thích OpenAI
4. translation path đầu tiên
5. admin endpoints cho account inspection
