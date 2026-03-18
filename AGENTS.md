# AGENTS.md

Tệp này dành cho các coding agent hoạt động trong `/home/ha1/workspace/doan`.
Nó dựa trên trạng thái hiện tại của repo vào ngày 2026-03-18, không dựa trên các mặc định TypeScript chung chung.

## Hình dạng repository

- Đây là một TypeScript monorepo dùng `pnpm` + Turborepo.
- Các workspace package được định nghĩa trong `pnpm-workspace.yaml` là `apps/*` và `packages/*`.
- Các script điều phối ở cấp root nằm trong `package.json`.
- Các mục tiêu ứng dụng đang active gồm:
  - `apps/backend` — Fastify + TypeScript backend
  - `apps/web` — React 19 + Vite frontend
  - `packages/api-contract` — shared API shapes
  - `packages/shared` — shared types
- Tài liệu/thành phần chỉ để tham chiếu:
  - `legacy/go` — behavior parity reference during migration
  - `legacy/web-reference` — older web UI reference, not the active frontend
  - `docs/` — architecture and migration guidance

## Các nguồn chỉ dẫn đã kiểm tra

- Không có `AGENTS.md` ở cấp repo từ trước.
- Không có file `.cursorrules`.
- Không có thư mục `.cursor/rules/`.
- Không có file `.github/copilot-instructions.md`.
- Vì vậy, file này là file chỉ dẫn chính cho agent ở root repo.

## Độ trưởng thành của repo và ý nghĩa của nó

- Hãy xem repo này là **đang chuyển tiếp (transitional)**, chưa hoàn toàn đồng nhất.
- Code backend đã có định hướng và mang tính domain-driven rõ hơn.
- Web app vẫn còn khá gần với baseline scaffold của Vite.
- Legacy web reference có convention formatting/tooling riêng, **không** hoàn toàn khớp với monorepo active.
- Hãy giữ đúng style cục bộ của package mà bạn sửa.
- Không làm cleanup toàn cục hay reformat xuyên package trừ khi được yêu cầu rõ ràng.

## Các lệnh: cài đặt, dev, build, lint, typecheck

Chạy các lệnh này từ repo root, trừ khi có ghi chú khác.

### Cài đặt

```bash
pnpm install
```

### Các lệnh ở cấp workspace root

```bash
pnpm dev
pnpm build
pnpm typecheck
pnpm dev:backend
pnpm build:backend
pnpm typecheck:backend
pnpm dev:web
pnpm build:web
pnpm typecheck:web
```

### Các lệnh cho backend

```bash
pnpm --filter @cliproxy/backend dev
pnpm --filter @cliproxy/backend build
pnpm --filter @cliproxy/backend typecheck
```

Ghi chú:

- `dev` dùng `tsx watch src/index.ts`.
- `build` dùng `tsc -p tsconfig.json`.
- `start` chỉ tồn tại bên trong `apps/backend`: `pnpm --filter @cliproxy/backend start`.

### Các lệnh cho web

```bash
pnpm --filter @cliproxy/web dev
pnpm --filter @cliproxy/web build
pnpm --filter @cliproxy/web typecheck
pnpm --filter @cliproxy/web lint
pnpm --filter @cliproxy/web preview
```

Ghi chú:

- Root **không** định nghĩa script `lint` cho toàn monorepo.
- Nếu bạn thay đổi code frontend, hãy chạy trực tiếp `pnpm --filter @cliproxy/web lint`.

### Các lệnh cho legacy web reference

Chỉ dùng các lệnh này nếu bạn **cố ý** làm việc trong `legacy/web-reference`.
Thư mục đó không phải workspace package active trong `pnpm-workspace.yaml`.

```bash
npm --prefix legacy/web-reference run dev
npm --prefix legacy/web-reference run build
npm --prefix legacy/web-reference run lint
npm --prefix legacy/web-reference run format
npm --prefix legacy/web-reference run type-check
```

## Test và hướng dẫn chạy một test đơn lẻ

Quan trọng: active monorepo hiện tại **đã có test runner cho `apps/backend`**, nhưng **chưa có test runner cho `apps/web`**.

Bằng chứng từ quá trình quét repo:

- `apps/backend/vitest.config.ts` đã tồn tại.
- Backend đã có test files như `test/core/config/loader.test.ts` và `test/app/routes/health.test.ts`.
- `apps/backend/package.json` đã có script `test` và `test:watch`.
- Hiện vẫn chưa có test runner hoặc test script active cho `apps/web`.

### Hiện tại nên chạy gì thay cho test

Nếu bạn thay đổi code backend:

```bash
pnpm --filter @cliproxy/backend test
pnpm --filter @cliproxy/backend typecheck
pnpm --filter @cliproxy/backend build
```

Nếu bạn thay đổi code web:

```bash
pnpm --filter @cliproxy/web typecheck
pnpm --filter @cliproxy/web lint
pnpm --filter @cliproxy/web build
```

Nếu bạn đụng tới nhiều package:

```bash
pnpm typecheck
pnpm build
```

### Chạy một test đơn lẻ

- Backend hiện có thể chạy test đơn lẻ qua Vitest, ví dụ:

```bash
pnpm --filter @cliproxy/backend test -- test/core/config/loader.test.ts
pnpm --filter @cliproxy/backend test -- test/app/routes/health.test.ts
```

- Web hiện vẫn **chưa** có test runner active, nên không được tự bịa lệnh single-test cho `apps/web`.
- Nếu sau này bạn thêm test framework cho web, hãy ghi rõ script và cách chạy một test đơn lẻ trong workspace đó.

## Hướng dẫn style code

### 1) Theo style cục bộ của package, không theo một style toàn cục tưởng tượng

- Backend hiện đang dùng semicolon và import ESM kiểu NodeNext.
- Web hiện đang theo style scaffold của Vite, không dùng semicolon.
- Legacy web reference cũng dùng semicolon cùng với Prettier.
- Hãy match style của các file bạn đang sửa.
- Không reformat các file không liên quan chỉ để làm style “đồng nhất”.

### 2) Quy ước import

- Dùng `import type` cho các import chỉ dùng cho type.
- Ví dụ trong backend:
  - `import type { FastifyInstance } from 'fastify';`
  - `import { loadConfig, type AppConfig } from '../core/config/index.js';`
- Các file web dùng import chuẩn của Vite/React và CSS side-effect import.
- Trong file frontend, giữ các import CSS ở gần đầu file và giữ nguyên thứ tự hiện có.

### 3) Quy ước về phần mở rộng file là quan trọng

- Trong `apps/backend`, import cục bộ giữa các file TypeScript dùng đuôi `.js` ngay trong source vì package này dùng `module: NodeNext`.
- Trong `apps/web`, import `.tsx` được phép và đã được dùng sẵn, ví dụ `import App from './App.tsx'`.
- Đừng “sửa cho đẹp” các điểm này trừ khi bạn thực sự đang thay đổi config của package.

### 4) TypeScript strict là có thật

- `tsconfig.json` của backend có `strict: true`.
- `tsconfig.app.json` và `tsconfig.node.json` của web cũng strict và bật `noUnusedLocals`, `noUnusedParameters`.
- Ưu tiên dùng interface/type tường minh thay vì object literal lỏng lẻo cho các shape dùng chung.
- Ưu tiên `unknown` hơn `any` khi shape thực sự chưa biết.
- Giữ bề mặt type hẹp và mang ý nghĩa domain.

### 5) Ưu tiên domain type hơn raw string trong backend

- Backend định nghĩa branded IDs trong `apps/backend/src/core/domain/ids.ts`.
- Hãy dùng `AccountId`, `ProviderId`, `ModelId`, v.v. thay vì `string` thuần ở phần code thuộc domain.
- Theo các helper pattern hiện có như `AccountId.create(...)` ở những nơi pattern đó đã tồn tại.
- Các package shared hiện đang lỏng hơn; đừng sao chép sự lỏng lẻo đó vào code domain của backend.

### 6) Validation runtime nên nằm ở boundary

- `apps/backend/src/core/config/schema.ts` dùng schema Zod và type `z.infer`.
- `apps/backend/src/core/config/loader.ts` hiện đọc YAML config trước, rồi merge env overrides, sau đó parse qua `AppConfigSchema.parse(...)`.
- Với các boundary mới nhận dữ liệu không đáng tin, hãy ưu tiên runtime validation thay vì tin tưởng raw input.

### 7) Export và ranh giới module

- Backend thường dùng các barrel `index.ts` để làm ranh giới module.
- Ví dụ: `apps/backend/src/app/index.ts`, `apps/backend/src/modules/*/index.ts`, `apps/backend/src/core/index.ts`.
- Nếu bạn thêm một surface mới cho backend, hãy expose nó qua barrel cục bộ nếu package/module đó đã theo pattern này.
- Giữ các chi tiết triển khai nội bộ ra khỏi barrel cấp cao hơn, trừ khi chúng thực sự là API công khai của module.

### 8) Quy ước đặt tên

- Type/interface/class: `PascalCase`.
- Function/variable: `camelCase`.
- Các constant cho route/plugin có thể đặt theo danh từ, ví dụ `healthRoutes`.
- Các module domain dùng tên thư mục mô tả rõ nghĩa như `runtime-sync`, `ws-relay`, và `api-contract`.
- Ưu tiên tên phản ánh ý nghĩa sản phẩm/domain, không chỉ phản ánh cơ chế framework.

### 9) Xử lý lỗi

- Không nuốt lỗi.
- Code khởi động top-level sẽ log lỗi và thoát khi startup thất bại (`apps/backend/src/index.ts`).
- Backend định nghĩa các lớp lỗi tường minh trong `apps/backend/src/core/errors/base.ts`.
- Hãy ưu tiên ném các lỗi tường minh/mang ý nghĩa domain khi thêm các đường lỗi mới.
- Nếu bạn catch một lỗi, hoặc là xử lý nó có ý nghĩa, hoặc rethrow sau khi thêm ngữ cảnh.

### 10) Async và quy ước return type

- Các hàm async của backend thường khai báo explicit return type, ví dụ `Promise<void>` hoặc `Promise<FastifyInstance>`.
- Giữ API async tường minh ở các boundary của module.
- Các interface của repository trả về promise có shape cụ thể, không để rơi vào `any` ngầm định.

### 11) Readonly và các contract ổn định

- Một số interface của backend đánh dấu các thuộc tính ổn định là `readonly`, đặc biệt là ở adapter/contract.
- Hãy giữ `readonly` khi giá trị đó không nên bị gán lại.
- Điều này đặc biệt phù hợp với identifier và metadata của adapter.

### 12) Comment và tài liệu hóa

- Các file backend hiện có dùng comment ngắn, có mục đích, và đôi khi có file header.
- Ưu tiên comment giải thích ý đồ domain hoặc hành vi không hiển nhiên.
- Không thêm comment kiểu tường thuật cho những đoạn code đã quá rõ ràng.

## Các quy tắc thực tế cho agent trong repo này

- Ưu tiên sửa trong monorepo active (`apps/backend`, `apps/web`, `packages/*`) trừ khi task chỉ rõ nhắm vào `legacy/*`.
- Dùng `legacy/go` cho các câu hỏi về parity hành vi.
- Dùng `legacy/web-reference` để tham khảo flow UI/ý tưởng, không dùng nó làm chuẩn mặc định cho frontend active.
- Hãy đọc `docs/architecture-overview.md` trước khi thay đổi cấu trúc backend.
- Hãy đọc `docs/project-structure.md` trước khi thay đổi cấu trúc ở cấp repo hoặc xuyên package, hoặc khi cần định hướng code nên nằm ở đâu.
- Hãy đọc `docs/coding-style.md` trước khi sửa các phần nhạy về style hoặc khi convention cục bộ của package chưa rõ.
- Với backend config, ưu tiên xem `apps/backend/config.yaml` là nguồn cấu hình chính; env dùng để override theo môi trường chạy.
- Giữ diff nhỏ và cục bộ.
- Tránh các chỉnh sửa kiểu “tiện tay cleanup”.
- Verify bằng các lệnh hẹp nhất, phù hợp nhất với package bạn vừa sửa.
- Không document hoặc chạy các lệnh không tồn tại trong `package.json` hay file config.

## Checklist verify nhanh

Sau khi thay đổi backend:

```bash
pnpm --filter @cliproxy/backend test
pnpm --filter @cliproxy/backend typecheck
pnpm --filter @cliproxy/backend build
```

Sau khi thay đổi web:

```bash
pnpm --filter @cliproxy/web typecheck
pnpm --filter @cliproxy/web lint
pnpm --filter @cliproxy/web build
```

Sau khi thay đổi xuyên nhiều workspace:

```bash
pnpm typecheck
pnpm build
```

Nếu bạn làm việc trong legacy reference UI, hãy dùng các script cục bộ của nó một cách có chủ đích và giữ phần việc đó tách biệt.
