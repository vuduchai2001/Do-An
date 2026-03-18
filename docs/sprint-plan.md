# Kế hoạch sprint

Kế hoạch này giả định monorepo sẽ được triển khai với `apps/backend` là modular monolith backend bằng TypeScript, `apps/web` là frontend tách riêng, và mục tiêu là ship một backend-first MVP trước khi theo đuổi full parity.

---

## Sprint 0 — Nền tảng workspace

### Mục tiêu

Biến workspace Node.js thành một application shell thật sự, đủ để các sprint sau không phải chen thêm hạ tầng nền vào giữa lúc đang implement nghiệp vụ.

### Phạm vi

- chốt tooling
- chốt baseline validation cho monorepo
- thêm config loading
- thêm logging conventions
- định nghĩa source layout
- setup hạ tầng local/dev cho PostgreSQL
- setup hạ tầng local/dev cho Redis
- setup test runner cho vùng active

### Bổ sung trọng tâm cho Sprint 0

#### 1) Hạ tầng — PostgreSQL và Redis

Sprint 0 nên dựng hạ tầng local/dev ngay từ đầu, dù business logic persistence đầy đủ sẽ nằm ở Sprint 1 trở đi.

Phạm vi tối thiểu nên gồm:

- thêm `compose.yaml` hoặc `docker-compose.yml` ở root của monorepo active, không dựa vào file trong `legacy/go`
- thêm service PostgreSQL cho persistence chính
- thêm service Redis cho cache/runtime coordination và các use case background về sau
- thêm env vars và default config để backend có thể biết cách kết nối tới Postgres/Redis
- thêm hướng dẫn khởi động local infra trong tài liệu hoặc README phù hợp

Mục tiêu của phần này không phải là dùng Redis cho mọi thứ ngay trong Sprint 0, mà là tránh việc đến Sprint 1 hoặc Sprint 7 mới bắt đầu giải bài toán hạ tầng từ con số 0.

#### 2) Test runner setup

Sprint 0 hiện nên xem test runner là một deliverable thật sự, không chỉ là ý định.

Phạm vi tối thiểu nên gồm:

- chọn một test runner thống nhất, thân thiện với TypeScript cho workspace active
- thêm script `test` ở package phù hợp, ít nhất cho `apps/backend`
- thêm script watch hoặc subset execution nếu framework hỗ trợ
- có ít nhất 1-2 smoke test hoặc config test để chứng minh runner chạy được
- ghi rõ cách chạy test toàn package và một test đơn lẻ

Vì dự án đang backend-first, hợp lý nhất là ưu tiên test runner cho `apps/backend` trước, sau đó mới mở rộng sang web khi frontend có đủ business surface để test.

### Deliverable

- Fastify app bootstrap
- config module
- baseline validation commands rõ ràng cho root/backend/web
- Postgres local/dev setup
- Redis local/dev setup
- test runner setup
- module folders và naming conventions

### Điều kiện hoàn thành

- `apps/backend` build và typecheck được
- `apps/web` build, typecheck, và lint được
- app khởi động được với cấu hình có cấu trúc rõ ràng
- local Postgres và Redis khởi động được từ repo active
- backend biết cách đọc cấu hình kết nối tới Postgres/Redis
- test runner hoạt động và chạy được ít nhất một test thực tế

### Review Sprint 0 theo trạng thái repo hiện tại

#### Những gì đã có

- monorepo `pnpm` + Turborepo đã được dựng
- `apps/backend` đã có Fastify bootstrap, config loader, và source layout rõ
- `apps/web` đã có Vite + TypeScript + ESLint riêng
- root đã có script `dev`, `build`, và `typecheck`
- backend đã có lớp persistence in-memory để phục vụ giai đoạn đầu

#### Những gì còn thiếu so với Sprint 0 hiện đang mô tả

- chưa có test runner active trong monorepo
- chưa có test files cho backend/web workspace active
- chưa có script `test` ở root hoặc package active
- chưa có local/dev infra cho PostgreSQL trong vùng active
- chưa có local/dev infra cho Redis trong vùng active
- chưa có file compose riêng cho monorepo active; file compose hiện tìm thấy nằm trong `legacy/go`
- root chưa có chiến lược linting toàn monorepo; hiện chỉ `apps/web` có lint script rõ ràng

#### Điều chỉnh khuyến nghị

- không xem Sprint 0 là “đã xong” chỉ vì app shell đã chạy được; phần test runner và hạ tầng nền vẫn còn thiếu
- tách rõ “validation baseline” khỏi “full linting”: hiện tại typecheck + web lint đã có, nhưng backend lint chưa phải một phần setup hoàn chỉnh
- giữ persistence thật với PostgreSQL ở Sprint 1, nhưng phải dựng kết nối/hạ tầng local ngay từ Sprint 0
- xem Redis là hạ tầng chuẩn bị sớm cho runtime cache, cooldown coordination, và jobs, dù việc dùng nó đầy đủ có thể đến sau
- không đợi đến khi viết business logic mới setup test runner; nên chốt nó trước để các sprint auth/routing/translator có chỗ bám để verify

### Thứ tự triển khai khuyến nghị cho Sprint 0

Để tránh bị nghẽn ở giữa Sprint 1 hoặc Sprint 2, Sprint 0 nên được triển khai theo thứ tự sau:

#### Bước 1 — Chốt baseline validation hiện có

Mục đích là đóng đinh trạng thái hiện tại trước khi thêm hạ tầng mới.

Nên xác nhận:

- root chạy được `pnpm build` và `pnpm typecheck`
- backend chạy được `pnpm --filter @cliproxy/backend build` và `typecheck`
- web chạy được `pnpm --filter @cliproxy/web build`, `typecheck`, và `lint`

Nếu có chỗ nào đang lệch, nên sửa baseline này trước khi thêm infra hoặc test runner, để tránh trộn lỗi cũ với lỗi setup mới.

#### Bước 2 — Chuẩn hóa config nền cho infra

Trước khi thêm compose và service thật, nên chốt naming/config contracts cho:

- `DATABASE_URL` hoặc các biến cấu hình Postgres tương đương
- các biến cấu hình Redis
- local defaults hợp lý cho development
- cách backend phân biệt mode in-memory với mode dùng service thật nếu cần giữ cả hai trong giai đoạn chuyển tiếp

Mục tiêu là để `core/config` biết các shape cấu hình này từ sớm, dù code persistence thật chưa hoàn thành.

#### Bước 3 — Dựng local/dev infra cho Postgres và Redis

Sau khi config contracts rõ, mới thêm infra file vào vùng active của monorepo.

Nên hoàn thành ở bước này:

- file compose của monorepo active
- service Postgres
- service Redis
- volume/network cơ bản nếu cần
- hướng dẫn start/stop/reset local infra

#### Bước 4 — Wire backend với cấu hình infra

Ở bước này chưa cần PostgreSQL repository đầy đủ, nhưng backend nên biết cách đọc config kết nối và fail rõ ràng nếu cấu hình sai.

Có thể giữ persistence in-memory là mặc định tạm thời, nhưng code config không nên giả vờ là Postgres/Redis chưa tồn tại.

#### Bước 5 — Chốt test runner cho backend trước

Vì dự án đang backend-first, test runner nên được dựng cho `apps/backend` trước khi nghĩ đến test frontend.

Nên chốt ở bước này:

- framework test chính
- script `test`
- script chạy watch hoặc subset nếu hỗ trợ
- cách import/setup runner với TypeScript hiện tại

#### Bước 6 — Thêm smoke tests đầu tiên

Sau khi runner chạy được, thêm một số test nhỏ nhưng có giá trị nền:

- config loader test
- health route test
- một test đơn giản cho persistence in-memory hoặc một utility quan trọng

Mục đích không phải đạt coverage cao, mà là chứng minh từ Sprint 0 trở đi repo đã có nơi để verify thay vì chỉ dựa vào typecheck/build.

#### Bước 7 — Cập nhật tài liệu vận hành tối thiểu

Sprint 0 chỉ thực sự “xong” khi người khác clone repo có thể biết:

- chạy app thế nào
- bật infra local thế nào
- chạy validate/test thế nào
- fallback tạm thời là gì nếu Postgres path chưa hoàn thiện

---

### Checklist implementation cho Sprint 0

#### Checklist A — PostgreSQL local/dev setup

- [ ] thêm file `compose.yaml` hoặc `docker-compose.yml` ở root repo active
- [ ] thêm service PostgreSQL với version được chốt rõ
- [ ] cấu hình port, database name, username, password cho local dev
- [ ] thêm volume persistence phù hợp cho local
- [ ] thêm env vars hoặc config defaults vào backend config schema
- [ ] ghi rõ connection string format trong tài liệu
- [ ] xác nhận backend đọc được config Postgres mà không phá mode hiện tại
- [ ] ghi rõ cách reset database local nếu cần

#### Checklist B — Redis local/dev setup

- [ ] thêm service Redis vào compose của repo active
- [ ] chốt port và local defaults rõ ràng
- [ ] thêm env vars hoặc config defaults cho Redis vào backend config schema
- [ ] xác định rõ Redis ở Sprint 0 chỉ là infra readiness, chưa bắt buộc phải có business usage đầy đủ
- [ ] ghi rõ use case dự kiến: runtime cache, cooldown coordination, jobs/background state
- [ ] ghi rõ cách khởi động và xác nhận service chạy local

#### Checklist C — Test runner setup cho backend

- [ ] chọn test runner chính cho `apps/backend`
- [ ] cài dependency runner và TypeScript integration tương ứng
- [ ] thêm script `test`
- [ ] thêm script `test:watch` hoặc tương đương nếu phù hợp
- [ ] nếu runner hỗ trợ, ghi rõ cách chạy một test đơn lẻ
- [ ] thêm test setup file nếu framework cần
- [ ] xác nhận test runner chạy được trong workspace mà không phá `build` và `typecheck`

#### Checklist D — Smoke tests tối thiểu

- [ ] thêm ít nhất một test cho `core/config`
- [ ] thêm ít nhất một test cho health route hoặc server bootstrap path
- [ ] thêm ít nhất một test cho persistence in-memory hoặc utility có vai trò nền
- [ ] ghi rõ lệnh chạy test toàn package
- [ ] ghi rõ lệnh chạy một test đơn lẻ nếu đã hỗ trợ

#### Checklist E — Tài liệu và DX

- [ ] cập nhật README hoặc docs tương ứng với hướng dẫn khởi động infra
- [ ] cập nhật AGENTS/docs nếu command surface thay đổi
- [ ] ghi rõ lệnh validation chuẩn sau mỗi thay đổi backend/web
- [ ] ghi rõ những gì vẫn còn tạm thời ở cuối Sprint 0, đặc biệt là persistence in-memory

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
- thay thế dần persistence in-memory bằng PostgreSQL-backed repositories

### Deliverable

- database schema
- repositories
- domain types package
- PostgreSQL-backed persistence path đầu tiên chạy được end-to-end trên local infra đã setup từ Sprint 0

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
