# Coding style và quy ước làm việc

Tài liệu này tóm tắt các quy ước code quan trọng của monorepo hiện tại. Mục tiêu không phải là tạo ra một “luật chung tuyệt đối” cho mọi package, mà là giúp người sửa code hiểu **style nào đang đúng ở đâu** và tránh áp sai convention từ vùng này sang vùng khác.

---

## Nguyên tắc lớn nhất

### Theo local conventions của package đang sửa

Repo này đang ở trạng thái chuyển tiếp, nên style không hoàn toàn đồng nhất giữa mọi package.

- `apps/backend` có style nghiêng về domain-driven TypeScript, dùng semicolon
- `apps/web` đang gần scaffold Vite, không dùng semicolon
- `legacy/web-reference` có style riêng và không phải chuẩn mặc định cho frontend active

Điều đó có nghĩa là:

- hãy match style của file/package bạn đang sửa
- đừng reformat lan rộng chỉ để “đồng nhất”
- đừng kéo convention từ `legacy/*` sang vùng active nếu không có lý do rõ ràng

---

## Import style

### Dùng `import type` cho type-only imports

Khi import chỉ để dùng cho type, hãy dùng `import type`.

Ví dụ backend:

```ts
import type { FastifyInstance } from 'fastify';
import { loadConfig, type AppConfig } from '../core/config/index.js';
```

### Tôn trọng quy ước import của từng package

- Backend dùng local imports với đuôi `.js` vì chạy theo `NodeNext`
- Web cho phép import `.tsx` và đang dùng pattern đó
- CSS side-effect import trong frontend thường nằm gần đầu file

Không “sửa cho đẹp” các import path này nếu config package hiện tại vẫn đang yêu cầu như vậy.

---

## Formatting

### Backend

- dùng semicolon
- ưu tiên xuống dòng rõ ràng khi object/function signature dài
- comment ngắn, có mục đích, không tường thuật thừa

### Web

- không dùng semicolon trong các file scaffold hiện tại
- giữ JSX/TSX formatting nhất quán với file đang sửa
- không đưa convention của `legacy/web-reference` sang `apps/web` một cách máy móc

### Legacy web reference

- có ESLint và Prettier riêng
- chỉ theo style ở đây nếu bạn thực sự đang sửa trong `legacy/web-reference`

---

## TypeScript và typing

### Strict mode là mặc định thực tế

Backend và web đều đang dùng TypeScript strict.

Điều này kéo theo một số nguyên tắc:

- ưu tiên type/interface rõ ràng hơn object lỏng
- không để lọt `any` nếu không thật sự bất khả kháng
- ưu tiên `unknown` hơn `any` khi chưa biết shape
- giữ type surface hẹp và đúng domain

### Backend ưu tiên domain types

Trong backend, hãy ưu tiên các type domain như:

- `AccountId`
- `ProviderId`
- `ModelId`

thay vì dùng `string` thuần ở mọi nơi.

Khi repo đã có helper kiểu `AccountId.create(...)`, hãy dùng theo pattern đó.

### Shared packages chưa chặt bằng backend

`packages/shared` và một phần `packages/api-contract` hiện còn tương đối mỏng và lỏng hơn backend. Không nên lấy sự lỏng đó làm chuẩn để kéo ngược vào `apps/backend/src/core/domain` hoặc `apps/backend/src/modules/*`.

---

## Runtime validation

Validation runtime nên đặt ở boundary nhận dữ liệu không đáng tin.

Hiện tại backend đã có ví dụ rõ ở `core/config`:

- `schema.ts` định nghĩa schema bằng Zod
- `loader.ts` parse dữ liệu config bằng schema đó

Khi thêm boundary mới như config, request payload, hoặc dữ liệu ngoài hệ thống, hãy cân nhắc validate ở điểm vào thay vì để dữ liệu raw chảy sâu vào business logic.

---

## Naming conventions

### Quy ước chung

- type / interface / class: `PascalCase`
- function / variable: `camelCase`
- hằng số route/plugin có thể đặt theo danh từ hoặc capability, ví dụ `healthRoutes`

### Ưu tiên tên theo domain

Tên nên phản ánh ý nghĩa nghiệp vụ, không chỉ phản ánh framework.

Ví dụ tốt:

- `routingRules`
- `quotaStates`
- `providerId`
- `usageEvents`

Ví dụ kém rõ nghĩa hơn:

- `data1`
- `serviceThing`
- `handlerUtil`

---

## Exports và boundaries

### Backend hay dùng barrel `index.ts`

Trong backend, barrel file là một phần của boundary design.

Ví dụ:

- `apps/backend/src/app/index.ts`
- `apps/backend/src/core/index.ts`
- `apps/backend/src/modules/*/index.ts`

Khi thêm surface public mới cho một module đã dùng pattern này, nên expose nó qua barrel cục bộ.

### Nhưng đừng re-export quá tay

Barrel nên giúp import path gọn và thể hiện public API của module, không nên biến thành nơi re-export mọi thứ khiến boundary bị mờ.

---

## Error handling

### Không swallow errors

Nếu catch lỗi:

- hoặc xử lý nó có ý nghĩa
- hoặc log/thêm context rồi throw lại

Không dùng catch rỗng và không nuốt lỗi im lặng.

### Ưu tiên lỗi mang ý nghĩa domain

Backend đã có base error classes trong `core/errors`. Khi thêm failure path mới, hãy ưu tiên lỗi có meaning rõ hơn là ném `Error` chung chung ở các boundary quan trọng.

---

## Async code

### Khai báo return type rõ ở boundary

Trong backend, các hàm async ở boundary module thường khai báo explicit return type như:

- `Promise<void>`
- `Promise<FastifyInstance>`

Điều này giúp contract của module rõ hơn và tránh rò type mơ hồ.

### Repository interfaces nên cụ thể

Các interface repository hiện trả về promise có shape cụ thể. Hãy giữ tinh thần này khi thêm methods mới.

---

## Comment style

### Chỉ comment khi comment giúp ích

Comment nên dùng để giải thích:

- ý đồ domain
- behavior không hiển nhiên
- tradeoff đáng lưu ý

Không thêm comment chỉ để nhắc lại chính xác điều code đã nói quá rõ.

---

## Quy tắc thực tế khi sửa code

### Nếu sửa backend

- giữ semicolon
- giữ import `.js` ở local imports
- ưu tiên domain types
- ưu tiên validation ở boundary
- tránh kéo raw string/shared loose types vào domain core nếu không cần

### Nếu sửa web

- match formatting không semicolon của file hiện tại
- giữ CSS import và TSX import theo pattern đang dùng
- chạy lint riêng cho `apps/web`
- xem đây là frontend active, không phải bản sao của `legacy/web-reference`

### Nếu sửa shared packages

- giữ API nhỏ, rõ, và ổn định
- chỉ đưa vào shared những thứ thực sự dùng chung
- không đẩy business logic backend nặng sang shared chỉ vì “tiện”

---

## Những điều không nên làm

- không cleanup toàn repo khi task chỉ yêu cầu sửa cục bộ
- không áp một formatter/style duy nhất lên mọi package
- không bịa lệnh test khi repo chưa có test runner active
- không lấy `legacy/web-reference` làm chuẩn mặc định cho `apps/web`
- không bỏ qua tài liệu kiến trúc khi thay đổi cấu trúc backend

---

## Cách dùng tài liệu này cùng với các tài liệu khác

- Đọc `project-structure.md` khi cần hiểu repo được chia lớp như thế nào
- Đọc `architecture-overview.md` khi cần hiểu tại sao backend được chia module như hiện tại
- Đọc `module-plan.md` khi cần biết module nào đi trước module nào
- Dùng tài liệu này khi phân vân nên theo style nào trong package mình đang sửa
