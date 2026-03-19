# Phase 1 Patch Plan

Tài liệu này chuyển Phase 1 plan thành patch plan cực cụ thể theo file để tiện theo dõi implementation.

Trọng tâm của file này là **Phase 1 / Slice 1**:

- `providers`
- `accounts`
- `oauth_sessions`

Mục tiêu là đưa backend từ **in-memory persistence** sang **PostgreSQL-backed persistence** theo hướng adapter swap, không mở rộng feature scope.

---

## Phase 1 persistence rulebook

Các rule này dùng để giữ boundary của persistence sạch, giảm scope creep, và giữ đường lui rẻ nếu sau này muốn cân nhắc ORM.

### 1) Chỉ repository contract được phép đi lên application layer

- Service, use-case, route handler chỉ được nói chuyện với `repositories.ts`.
- Không import `pg`, SQL helper, hoặc row types trực tiếp từ route/service layer.

### 2) SQL không được rò ra ngoài persistence module

- Mọi câu SQL phải nằm trong `apps/backend/src/modules/persistence/**`.
- Không để query string rải ở `app/`, `core/`, `auth/`, `routing/`, hay module khác.

### 3) Raw DB rows không được leak ra ngoài adapter

- PostgreSQL rows chỉ tồn tại trong adapter layer.
- Mọi dữ liệu đi ra ngoài persistence phải được map thành domain entities hoặc return shape đã chốt bởi repository contract.

### 4) `records.ts` là shape persistence, không phải domain API

- `records.ts` phục vụ lưu trữ/mapping.
- Business logic không nên thao tác trực tiếp với persistence records trừ khi đang ở adapter layer.

### 5) Domain entities không được phụ thuộc vào storage concerns

- Không kéo SQL/nullability/column layout vào domain entities chỉ để “tiện map”.
- Nếu persistence shape khác domain shape, hãy xử lý bằng mapper.

### 6) Migrations phải explicit và forward-only

- Không phụ thuộc vào migration magic khó audit.
- Mọi thay đổi schema phải có file migration rõ ràng, có thể đọc được, và có thể chạy lặp lại trong môi trường local/test.

### 7) Giữ implementation selection ở một chỗ

- Việc chọn `memory` hay `postgres` chỉ nên diễn ra ở bootstrap của persistence.
- Không branch theo mode ở nhiều chỗ trong application layer.

### 8) Parity tests là hàng rào bắt buộc

- Mỗi repository PostgreSQL mới phải được kiểm tra lại bằng contract/parity tests so với memory implementation.
- Không cutover chỉ vì query “có vẻ đúng”.

### 9) Không tối ưu hóa DB quá sớm

- Tránh đưa quá nhiều SQL đặc thù/cực tối ưu vào Slice 1 nếu chưa cần.
- Ưu tiên đúng behavior, rõ boundary, dễ verify trước; tối ưu sâu để sau.

### 10) Chỉ cân nhắc ORM sau khi có pain thật

- Không thêm ORM chỉ vì “sau này có thể cần”.
- Chỉ re-evaluate khi CRUD/admin endpoints thực sự chiếm phần lớn công việc hoặc boilerplate persistence bắt đầu làm chậm delivery.

### 11) ID generation phải đi qua utility dùng chung

- Không tự generate ID theo kiểu `Date.now() + Math.random()` trong từng repository.
- Mọi implementation persistence nên dùng utility chung để giữ hành vi nhất quán.
- Với backend hiện tại, utility này đã được nâng lên UUID v7 để tối ưu hơn cho indexing và ordering ở database.

---

## Mục tiêu của Slice 1

- giữ nguyên repository contracts hiện có càng nhiều càng tốt
- thêm migration system tối thiểu
- thêm PostgreSQL-backed repositories cho `providers`, `accounts`, `oauth_sessions`
- thêm wiring chọn `memory` hoặc `postgres`
- thêm parity tests giữa memory và postgres implementations

---

## Patch plan cực cụ thể theo file

### 1) `apps/backend/package.json`

**Loại thay đổi:** update  
**Sửa gì:**

- thêm dependency runtime:
  - `pg`
- thêm dependency dev:
  - `@types/pg` nếu cần
- thêm scripts:
  - `db:migrate`
  - `db:migrate:reset`
  - có thể thêm `db:migrate:status` nếu script hỗ trợ

**Kết quả mong đợi:**

- backend có DB driver thật
- có command surface rõ để chạy migration local

---

### 2) `apps/backend/src/core/config/schema.ts`

**Loại thay đổi:** update  
**Sửa gì:**

- thêm schema cho `persistence.mode` với giá trị:
  - `memory`
  - `postgres`
- giữ `postgres.url` như hiện tại

**Kết quả mong đợi:**

- config có cơ chế chọn implementation persistence rõ ràng

---

### 3) `apps/backend/src/core/config/loader.ts`

**Loại thay đổi:** update  
**Sửa gì:**

- đọc thêm env:
  - `PERSISTENCE_MODE`
- map vào `config.persistence.mode`

**Kết quả mong đợi:**

- runtime có thể bật Postgres bằng env/config

---

### 4) `apps/backend/src/core/config/index.ts`

**Loại thay đổi:** update  
**Sửa gì:**

- export type/config mới liên quan đến `persistence`

**Kết quả mong đợi:**

- các module khác import được config đã mở rộng

---

### 5) `apps/backend/migrations/0001_init_providers_accounts_oauth_sessions.sql`

**Loại thay đổi:** add  
**Sửa gì:**

- tạo các bảng:
  - `providers`
  - `accounts`
  - `oauth_sessions`
- thêm:
  - primary keys
  - foreign keys
  - uniqueness constraints
  - timestamps
  - JSON columns nếu domain đang có metadata/config tương ứng

**Kết quả mong đợi:**

- có baseline schema đầu tiên cho Slice 1

---

### 6) `apps/backend/migrations/README.md`

**Loại thay đổi:** add  
**Sửa gì:**

- mô tả cách chạy migration
- quy ước thứ tự migration
- cách reset DB local

**Kết quả mong đợi:**

- migration flow không bị phụ thuộc vào knowledge truyền miệng

---

### 7) `apps/backend/scripts/migrate.mjs`

**Loại thay đổi:** add  
**Sửa gì:**

- script Node nhỏ để:
  - đọc `DATABASE_URL`
  - apply các file `.sql`
  - ghi lại migration đã chạy

**Kết quả mong đợi:**

- có migration runner explicit, không cần ORM nặng

---

### 8) `apps/backend/scripts/reset-db.mjs`

**Loại thay đổi:** add  
**Sửa gì:**

- script dev-only để:
  - reset local schema
  - chạy lại migration

**Kết quả mong đợi:**

- dễ test đi test lại Postgres path

---

### 9) `apps/backend/src/modules/persistence/postgres/client.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- tạo `Pool` từ `pg`
- expose helper:
  - `createPostgresPool(...)`
  - `closePostgresPool(...)`
- có thể thêm transaction helper mỏng nếu cần

**Kết quả mong đợi:**

- kết nối DB được gom tại một chỗ

---

### 10) `apps/backend/src/modules/persistence/postgres/types.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- định nghĩa row types cho:
  - `ProviderRow`
  - `AccountRow`
  - `OAuthSessionRow`

**Kết quả mong đợi:**

- mapping SQL row ↔ domain có type rõ ràng

---

### 11) `apps/backend/src/modules/persistence/postgres/mappers.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- mapper:
  - row → domain
  - create/update input → SQL params
- xử lý:
  - branded IDs
  - `Date`
  - JSON fields

**Kết quả mong đợi:**

- tránh lặp conversion logic trong từng repo

---

### 12) `apps/backend/src/modules/persistence/postgres/provider-repository.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- implement `ProviderRepository`
- methods:
  - `findById`
  - `findByType`
  - `findByStatus`
  - `findAll`
  - `create`
  - `update`
  - `delete`

**Kết quả mong đợi:**

- PostgreSQL-backed provider repository đầu tiên

---

### 13) `apps/backend/src/modules/persistence/postgres/account-repository.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- implement `AccountRepository`
- giữ semantics gần nhất với memory store:
  - create/update/delete
  - filter theo provider/status
  - timestamps

**Kết quả mong đợi:**

- account persistence thật có FK tới provider

---

### 14) `apps/backend/src/modules/persistence/postgres/oauth-session-repository.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- implement `OAuthSessionRepository`
- support:
  - `findById`
  - `findByState`
  - `findByProvider`
  - `findExpired`
  - `create`
  - `update`
  - `delete`
  - `deleteExpired`

**Kết quả mong đợi:**

- durable session persistence cho auth groundwork

---

### 15) `apps/backend/src/modules/persistence/postgres/index.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- export:
  - client
  - repo implementations
  - mapper/types nếu cần public nội bộ

**Kết quả mong đợi:**

- boundary rõ cho Postgres adapter layer

---

### 16) `apps/backend/src/modules/persistence/bootstrap.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- chọn implementation dựa trên `config.persistence.mode`
- trả về `PersistenceRepositories`
- khi `postgres`:
  - init pool
  - inject vào repos
- khi `memory`:
  - dùng memory repositories hiện có

**Kết quả mong đợi:**

- adapter swap diễn ra ở một chỗ duy nhất

---

### 17) `apps/backend/src/modules/persistence/memory/`

**Loại thay đổi:** update  
**Sửa gì:**

- tách in-memory implementation theo strategy folder thay vì dồn toàn bộ vào một file lớn
- giữ factory rõ ràng kiểu:
  - `memory/bootstrap.ts`
  - `createInMemoryRepositories()`
- chia các repo thành file riêng tương ứng với postgres adapter:
  - `provider-repository.ts`
  - `account-repository.ts`
  - `oauth-session-repository.ts`
  - `routing-rule-repository.ts`
  - `quota-state-repository.ts`
  - `usage-event-repository.ts`

**Kết quả mong đợi:**

- memory và postgres có cấu trúc strategy đối xứng hơn

---

### 18) `apps/backend/src/modules/persistence/index.ts`

**Loại thay đổi:** update  
**Sửa gì:**

- export thêm:
  - `bootstrap.ts`
  - `postgres/index.ts`
- giữ export cũ để tránh vỡ import

**Kết quả mong đợi:**

- module persistence có entrypoint rõ cho adapter selection

---

### 19) `apps/backend/src/app/server.ts`

**Loại thay đổi:** update  
**Sửa gì:**

- inject persistence bootstrap vào startup path
- nếu dùng Postgres:
  - khởi tạo repositories từ config
- nếu cần, đăng ký cleanup hook để đóng pool khi app close

**Kết quả mong đợi:**

- backend có thể chạy với `PERSISTENCE_MODE=postgres`

---

### 20) `apps/backend/test/helpers/postgres.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- helper test để:
  - lấy test DB connection
  - reset dữ liệu giữa các test
  - chạy migration trước suite nếu cần

**Kết quả mong đợi:**

- test Postgres không lặp boilerplate

---

### 21) `apps/backend/test/persistence/contracts/provider-repository.contract.test.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- contract tests dùng chung cho `ProviderRepository`
- chạy được với:
  - memory implementation
  - postgres implementation

**Kết quả mong đợi:**

- parity behavior cho provider repo

---

### 22) `apps/backend/test/persistence/contracts/account-repository.contract.test.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- contract tests dùng chung cho `AccountRepository`
- cover:
  - create/update/delete
  - `findByProvider`
  - `findByStatus`
  - timestamps

**Kết quả mong đợi:**

- parity behavior cho account repo

---

### 23) `apps/backend/test/persistence/contracts/oauth-session-repository.contract.test.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- contract tests dùng chung cho `OAuthSessionRepository`
- cover:
  - state lookup
  - expired session logic
  - `deleteExpired`

**Kết quả mong đợi:**

- parity behavior cho session repo

---

### 24) `apps/backend/test/persistence/memory/*.test.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- wire contract tests với memory repositories

**Kết quả mong đợi:**

- hành vi hiện tại được đóng đinh làm chuẩn tham chiếu

---

### 25) `apps/backend/test/persistence/postgres/*.test.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- wire contract tests với postgres repositories
- dùng DB helper/reset logic

**Kết quả mong đợi:**

- repo Postgres chứng minh được parity với memory

---

### 26) `apps/backend/test/app/startup/postgres-startup.test.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- test tối thiểu chứng minh backend boot được với:
  - `PERSISTENCE_MODE=postgres`
  - `DATABASE_URL` hợp lệ

**Kết quả mong đợi:**

- có bằng chứng tự động cho startup path mới

---

### 27) `README.md`

**Loại thay đổi:** update  
**Sửa gì:**

- thêm:
  - `PERSISTENCE_MODE`
  - cách chạy migration
  - cách reset DB local
  - cách chạy backend với postgres mode

**Kết quả mong đợi:**

- người khác clone repo có thể bật được persistence path mới

---

### 28) `AGENTS.md`

**Loại thay đổi:** update  
**Sửa gì:**

- cập nhật verify checklist backend cho Phase 1:
  - migrate
  - test
  - typecheck
  - build
- thêm note về `PERSISTENCE_MODE=postgres`

**Kết quả mong đợi:**

- agent khác hiểu đúng command surface mới

---

## Thứ tự patch nên làm

### Batch 1 — config + driver + migration skeleton

1. `apps/backend/package.json`
2. `apps/backend/src/core/config/schema.ts`
3. `apps/backend/src/core/config/loader.ts`
4. `apps/backend/src/core/config/index.ts`
5. `apps/backend/scripts/migrate.mjs`
6. `apps/backend/scripts/reset-db.mjs`
7. `apps/backend/migrations/0001_init_providers_accounts_oauth_sessions.sql`
8. `apps/backend/migrations/README.md`

### Batch 2 — postgres adapter nền

9. `apps/backend/src/modules/persistence/postgres/client.ts`
10. `apps/backend/src/modules/persistence/postgres/types.ts`
11. `apps/backend/src/modules/persistence/postgres/mappers.ts`
12. `apps/backend/src/modules/persistence/postgres/provider-repository.ts`
13. `apps/backend/src/modules/persistence/postgres/account-repository.ts`
14. `apps/backend/src/modules/persistence/postgres/oauth-session-repository.ts`
15. `apps/backend/src/modules/persistence/postgres/index.ts`
16. `apps/backend/src/modules/persistence/bootstrap.ts`
17. `apps/backend/src/modules/persistence/memory/`
18. `apps/backend/src/modules/persistence/index.ts`

### Batch 3 — app wiring

19. `apps/backend/src/app/server.ts`

### Batch 4 — parity tests

20. `apps/backend/test/helpers/postgres.ts`
21. `apps/backend/test/persistence/contracts/provider-repository.contract.test.ts`
22. `apps/backend/test/persistence/contracts/account-repository.contract.test.ts`
23. `apps/backend/test/persistence/contracts/oauth-session-repository.contract.test.ts`
24. `apps/backend/test/persistence/memory/*.test.ts`
25. `apps/backend/test/persistence/postgres/*.test.ts`
26. `apps/backend/test/app/startup/postgres-startup.test.ts`

### Batch 5 — docs

27. `README.md`
28. `AGENTS.md`

---

## Completion gates cho Slice 1

- `docker compose up -d` pass
- migrations apply được
- `PERSISTENCE_MODE=postgres pnpm --filter @cliproxy/backend test` pass
- `pnpm --filter @cliproxy/backend typecheck` pass
- `pnpm --filter @cliproxy/backend build` pass
- backend startup path với postgres mode pass

---

## Những gì chưa làm trong Slice 1

- `routing_rules`
- `quota_states`
- `usage_events`
- auth feature expansion
- routing engine
- gateway/admin feature work
- Redis business usage
- analytics/performance optimization nặng

Các phần trên nên để cho Slice 2 hoặc các phase sau.
