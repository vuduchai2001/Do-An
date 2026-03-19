# Phase 2 Patch Plan

Tài liệu này chuyển **Phase 2 / Auth orchestration MVP** thành patch plan cực cụ thể theo file để tiện theo dõi implementation.

Phase 2 được chốt theo hướng **provider-first ở backend**:

- provider/platform là trục chính của implementation
- `modules/auth` là orchestration layer dùng chung
- các flow như API key, OAuth, endpoint/custom là flow con nằm trong provider đầu tiên

Trọng tâm của file này là một **vertical slice hoàn chỉnh cho 1 provider đầu tiên**:

- `auth/start`
- `auth/callback`
- persist `oauth_session`
- persist/link `account`
- endpoint status/account cơ bản phục vụ web UI

Mục tiêu là biến Phase 1 “persistence ready” thành hành vi sản phẩm thật, không mở rộng sớm sang multi-provider orchestration hay full admin surface.

---

## Mục tiêu của Phase 2

- có một auth flow end-to-end cho **1 provider đầu tiên**
- provider đầu tiên có module riêng của nó trong `modules/providers/<provider>/`
- dùng PostgreSQL-backed persistence thật cho:
  - `oauthSessions`
  - `accounts`
  - `providers`
- expose một endpoint trạng thái tối thiểu cho web UI/admin
- có integration tests chạy với `PERSISTENCE_MODE=postgres`

---

## Scope MVP

### Bao gồm

- start login flow cho 1 provider đầu tiên
- callback completion hoặc mode tương đương của provider đầu tiên
- persist credentials/account state của provider đầu tiên
- basic account/session status endpoint
- first provider auth adapter + provider-specific config/mapping

### Không bao gồm

- multi-provider abstraction hoàn chỉnh
- refresh manager nâng cao
- device flow nếu provider đầu tiên chưa cần
- admin CRUD surface đầy đủ
- web feature implementation

---

## Patch plan cực cụ thể theo file

### 1) `apps/backend/src/modules/auth/types.ts`

**Loại thay đổi:** update  
**Sửa gì:**

- đồng bộ auth contracts với Phase 2 thực tế
- tách rõ request/response shape cho:
  - `initiateLogin`
  - `handleCallback`
  - `getAccountStatus`
- nếu cần, thêm type riêng cho callback result thay vì chỉ trả `AccountId`

**Kết quả mong đợi:**

- contracts auth đủ rõ để service layer và route layer cùng bám theo

---

### 2) `apps/backend/src/modules/auth/index.ts`

**Loại thay đổi:** update  
**Sửa gì:**

- export thêm implementation surface của auth module sau khi bắt đầu có code thật

**Kết quả mong đợi:**

- auth module có public API rõ ràng thay vì chỉ export types

---

### 3) `apps/backend/src/modules/providers/types.ts`

**Loại thay đổi:** update  
**Sửa gì:**

- mở rộng `ProviderAdapter` để hỗ trợ auth flow tối thiểu cho provider đầu tiên
- thêm các method cần thiết, ví dụ:
  - build auth URL
  - exchange callback code lấy token
  - map provider response sang auth/account domain

**Kết quả mong đợi:**

- provider adapter có đủ surface cho Phase 2 mà chưa cần over-generalize

---

### 4) `apps/backend/src/modules/providers/index.ts`

**Loại thay đổi:** update  
**Sửa gì:**

- export provider module đầu tiên và registry/bootstrap nếu cần

**Kết quả mong đợi:**

- auth module có thể lấy provider adapter từ một chỗ rõ ràng

---

### 5) `apps/backend/src/modules/providers/<provider>/adapter.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- thêm adapter auth tối thiểu cho provider đầu tiên
- nhiệm vụ:
  - dựng auth URL
  - xử lý callback code
  - trả token/profile tối thiểu cần thiết để persist account

**Kết quả mong đợi:**

- có một provider thật để vertical slice chạy được end-to-end

---

### 6) `apps/backend/src/modules/providers/<provider>/index.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- export adapter/provider-specific helpers
- đây là boundary chính của provider đầu tiên trong Phase 2

**Kết quả mong đợi:**

- provider đầu tiên có boundary module rõ ràng

---

### 7) `apps/backend/src/modules/auth/service.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- implement `AuthService`
- logic chính:
  - `initiateLogin(providerId)`
    - validate provider
    - resolve provider-specific auth adapter
    - tạo oauth session persisted
    - build auth URL qua adapter
  - `handleCallback(state, code)`
    - lookup session by state
    - validate pending/expired session
    - exchange code với provider adapter
    - create/update account qua repo
    - update session status/result
  - `refreshToken(accountId)`
    - có thể stub hoặc để unimplemented nếu chưa cần cho MVP
  - `revokeAccount(accountId)`
    - có thể chỉ mark account state tối thiểu nếu thật sự cần trong MVP

**Kết quả mong đợi:**

- auth orchestration có một service layer thật, không nhét logic vào routes
- orchestration chung và provider-specific flow được tách rõ nhau

---

### 8) `apps/backend/src/modules/auth/errors.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- các lỗi auth có meaning rõ, ví dụ:
  - session not found
  - session expired
  - invalid callback state
  - provider auth failed

**Kết quả mong đợi:**

- callback/start flow không ném `Error` chung chung

---

### 9) `apps/backend/src/modules/auth/bootstrap.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- helper tạo `AuthService` từ:
  - persistence repositories
  - provider registry
  - config

**Kết quả mong đợi:**

- `server.ts` hoặc route layer không phải tự assemble dependency bằng tay

---

### 10) `apps/backend/src/modules/providers/<provider>/config.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- định nghĩa provider-specific config shape nếu provider đầu tiên cần extra fields
- ví dụ:
  - authorize URL
  - token URL
  - client id
  - redirect path
  - optional product-specific flags

**Kết quả mong đợi:**

- provider-specific config không rò vào `auth/service.ts`

---

### 11) `apps/backend/src/modules/admin/types.ts`

**Loại thay đổi:** update  
**Sửa gì:**

- bổ sung response shape tối thiểu cho account/session status endpoint

**Kết quả mong đợi:**

- web UI có contract rõ cho status/account inventory cơ bản

---

### 12) `apps/backend/src/app/routes/auth.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- route tối thiểu cho auth flow, ví dụ:
  - `POST /auth/start`
  - `GET /auth/callback`

**Kết quả mong đợi:**

- vertical slice có HTTP surface thật cho login/callback

---

### 13) `apps/backend/src/app/routes/admin-accounts.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- endpoint status/account cơ bản, ví dụ:
  - `GET /admin/accounts`
  - hoặc `GET /admin/accounts/:id`
  - hoặc `GET /admin/auth/sessions/:state`

Không cần CRUD đầy đủ; chỉ cần đủ cho MVP observability/status.

**Kết quả mong đợi:**

- web UI/control-plane có read surface đầu tiên để kiểm tra kết quả auth

---

### 14) `apps/backend/src/app/routes/index.ts`

**Loại thay đổi:** update  
**Sửa gì:**

- export thêm routes mới:
  - `authRoutes`
  - `adminAccountRoutes` (hoặc tên tương đương)

**Kết quả mong đợi:**

- route module surface được mở rộng đúng chỗ

---

### 15) `apps/backend/src/app/server.ts`

**Loại thay đổi:** update  
**Sửa gì:**

- register routes mới
- nếu cần, decorate app với `authService` hoặc dependencies tối thiểu

**Kết quả mong đợi:**

- app boot xong là auth MVP HTTP surface dùng được

---

### 16) `apps/backend/config.yaml`

**Loại thay đổi:** update  
**Sửa gì:**

- thêm config tối thiểu cho provider đầu tiên, ví dụ:
  - client id
  - authorize/token endpoints nếu không hardcode trong adapter
  - redirect URI base nếu cần

Lưu ý: config này nên nằm dưới provider đầu tiên, không nên tạo một auth config global quá generic khi mới support 1 provider.

**Kết quả mong đợi:**

- auth adapter không cần hardcode mọi thứ trong code

---

### 17) `apps/backend/config.example.yaml`

**Loại thay đổi:** update  
**Sửa gì:**

- thêm phần config mẫu cho provider auth flow đầu tiên

**Kết quả mong đợi:**

- local setup có tài liệu/config mẫu rõ ràng

---

### 18) `apps/backend/test/auth/service.test.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- unit/integration tests cho `AuthService`
- cover ít nhất:
  - start login tạo session persisted
  - callback success link account
  - callback invalid/expired state fail đúng

Test nên prove rằng orchestration chung đang gọi đúng provider adapter đầu tiên.

**Kết quả mong đợi:**

- auth orchestration correctness được verify ở service layer

---

### 19) `apps/backend/test/app/routes/auth.test.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- test HTTP cho `auth/start` và `auth/callback`

**Kết quả mong đợi:**

- route layer được verify chứ không chỉ service layer

---

### 20) `apps/backend/test/app/routes/admin-accounts.test.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- test endpoint status/account surface cơ bản

**Kết quả mong đợi:**

- web-facing read surface có contract test đầu tiên

---

### 21) `apps/backend/test/providers/<provider>/adapter.test.ts`

**Loại thay đổi:** add  
**Sửa gì:**

- test mapping/adapter logic tối thiểu của provider đầu tiên
- test provider-specific edge cases của flow đầu tiên nếu có

**Kết quả mong đợi:**

- provider adapter không trở thành black box không test

---

### 22) `README.md`

**Loại thay đổi:** update  
**Sửa gì:**

- thêm hướng dẫn tối thiểu để chạy auth MVP local
- nếu cần, thêm biến/config auth của provider đầu tiên

**Kết quả mong đợi:**

- local dev có thể chạy vertical slice thật

---

### 23) `AGENTS.md`

**Loại thay đổi:** update  
**Sửa gì:**

- thêm verify checklist phù hợp nếu command surface/auth config thay đổi

**Kết quả mong đợi:**

- agent khác không hiểu sai cách verify Phase 2

---

## Thứ tự patch nên làm

### Batch 1 — contracts và provider-first scope

1. `modules/auth/types.ts`
2. `modules/providers/types.ts`
3. `modules/providers/<provider>/config.ts`
4. `config.yaml`
5. `config.example.yaml`

### Batch 2 — provider adapter và auth service

6. `modules/providers/<provider>/adapter.ts`
7. `modules/providers/<provider>/index.ts`
8. `modules/providers/index.ts`
9. `modules/auth/errors.ts`
10. `modules/auth/service.ts`
11. `modules/auth/bootstrap.ts`
12. `modules/auth/index.ts`

### Batch 3 — routes và startup wiring

13. `modules/admin/types.ts`
14. `app/routes/auth.ts`
15. `app/routes/admin-accounts.ts`
16. `app/routes/index.ts`
17. `app/server.ts`

### Batch 4 — tests

18. `test/auth/service.test.ts`
19. `test/app/routes/auth.test.ts`
20. `test/app/routes/admin-accounts.test.ts`
21. `test/providers/<provider>/adapter.test.ts`

### Batch 5 — docs

22. `README.md`
23. `AGENTS.md`

---

## Completion gates cho Phase 2 MVP

- `auth/start` chạy được cho 1 provider đầu tiên
- `auth/callback` xử lý được happy path thật
- provider đầu tiên có module riêng và adapter riêng rõ ràng
- account được persist/link trong PostgreSQL
- có endpoint status/account cơ bản cho web UI
- có ít nhất một failure path được test:
  - invalid state hoặc expired session
- `pnpm --filter @cliproxy/backend test` pass
- `pnpm --filter @cliproxy/backend lint` pass
- `pnpm --filter @cliproxy/backend typecheck` pass
- `pnpm --filter @cliproxy/backend build` pass
- chạy được với `PERSISTENCE_MODE=postgres`

---

## Những gì chưa làm trong Phase 2 MVP

- multi-provider abstraction đầy đủ
- các provider khác ngoài provider đầu tiên
- refresh manager nâng cao
- device flow nếu provider đầu tiên chưa cần
- admin CRUD đầy đủ
- web UI implementation
- gateway integration
- routing/quota feature expansion

Các phần trên nên để cho các phase sau.
