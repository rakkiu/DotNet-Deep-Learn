# DotNet Deep Learn — client-side

Website học và ôn tập C#/.NET bằng tiếng Việt, **xử lý hoàn toàn trong trình duyệt**. Không cần backend, .NET runtime, API hoặc database để chạy ứng dụng.

## Chạy local

Yêu cầu Node.js **24 LTS**, npm (đã kiểm chứng bằng Node 24.19.0 / npm 11.9.0):

```bash
./scripts/setup.sh
./scripts/dev.sh
```

Mở `http://127.0.0.1:5080/#/`. Ctrl+C để dừng. Đổi cổng bằng `PORT=5173 ./scripts/dev.sh`.

Hoặc dùng npm trực tiếp:

```bash
cd client
npm ci
npm run dev -- --port 5080
```

Vite chỉ phục vụ các file website trong lúc phát triển. Tất cả việc tìm bài, chấm quiz, cập nhật ôn tập, lưu tiến độ và sao lưu đều chạy ở client; không có endpoint xử lý nghiệp vụ.

## Build và static hosting

```bash
cd client
npm run build
npm run preview -- --port 5080
```

Đưa **toàn bộ nội dung `client/dist/`** lên static hosting như GitHub Pages, Cloudflare Pages, Netlify hoặc một HTTP file server. Không deploy `legacy/` hay tệp sao lưu cá nhân. Không cần .NET, cấu hình API, secret hoặc database trên hosting.

Ứng dụng dùng **HashRouter** (`/#/lessons/...`) và Vite `base: './'`, nên hỗ trợ refresh đường dẫn và triển khai trong thư mục con mà không cần rewrite SPA. Ví dụ: `https://example.com/DotNet-Deep-Learn/#/lessons/linq-deferred/quiz`. Cần phục vụ qua HTTP(S), không mở `index.html` trực tiếp bằng `file://`.

## Vercel

Import repository `rakkiu/DotNet-Deep-Learn`, chọn nhánh `main` và **Root Directory = `client`**. Chọn Node.js **24.x**. `client/vercel.json` đã lưu framework Vite, install command `npm ci --include=dev`, build command `npm run build` và output `dist`; không cần biến môi trường, backend hay rewrite cho HashRouter.

Nếu dùng Vercel CLI đã đăng nhập, chạy từ thư mục `client`:

```bash
vercel link
vercel deploy --prod
```

Khi được yêu cầu link, chọn đúng tài khoản/team và project mong muốn. `.vercel/` được gitignore; không đưa tệp xác thực hoặc bản sao lưu cá nhân vào deployment. Trạng thái build local thành công không đồng nghĩa đã có deployment Vercel; cần xác nhận deployment Ready và kiểm tra URL thực tế sau khi deploy. Chuyển từ localhost sang domain Vercel tạo origin khác, nên cần export/import JSON nếu muốn mang tiến độ cũ sang.

## Nội dung và các luồng học

Giữ đủ 7 chủ đề, trong đó 3 bài hoàn chỉnh:

1. OOP: override / new, kiểu tham chiếu / kiểu runtime, virtual dispatch.
2. LINQ to Objects: deferred execution / ToList / duyệt nhiều lần, phân biệt IQueryable và EF Core.
3. SQL: LEFT JOIN, ON / WHERE và NULL, có schema, dữ liệu mẫu và bảng kết quả xác định bằng ORDER BY.

Mỗi bài có kiến thức cốt lõi và đào sâu, **2 ví dụ dự đoán, 5 câu hỏi và 3 bài tập**. Giữ tìm kiếm không dấu, bộ lọc, phần học gần nhất, yêu thích, ghi chú, lịch sử quiz, ôn câu sai, tự đánh giá bài tập, tiến độ, light/dark mode, desktop/mobile, bàn phím và các trạng thái lỗi.

- Phải gửi dự đoán/câu trả lời trước khi UI mở kết quả và giải thích.
- Mỗi lựa chọn quiz có lời giải riêng; câu sai vào danh sách ôn. Làm đúng gỡ câu cần ôn nhưng không xóa lần sai trước đó.
- Code là **kết quả kỳ vọng**, không có thực thi code người học hoặc AI chấm bài.
- Bài tập được **tự đánh giá**: nhập lời giải, lưu, mở gợi ý từng cấp và đối chiếu đáp án/checklist. Mở đáp án không xác nhận code đúng.
- Hoàn thành lộ trình = đã đánh dấu đọc + đúng gần nhất toàn bộ quiz + tự đánh giá toàn bộ bài tập; không gắn nhãn thành thạo.

.NET Framework là dòng runtime cũ dành cho Windows; .NET Core là tên dòng đa nền tảng 1.x–3.1; từ .NET 5, dòng hiện đại gọi là .NET. Các bài C# ở đây đã được kiểm chứng với **.NET 10**. Tên ASP.NET Core và EF Core vẫn giữ chữ Core; ứng dụng client hiện tại không sử dụng chúng để chạy.

## Dữ liệu cá nhân và sao lưu

Dữ liệu nằm trong **localStorage** tại khóa `dotnet-deep-learn:state:v1`: tiến độ, phần học, ghi chú, yêu thích, mọi lần làm quiz và bài tập/checklist. Lớp `client/src/storage.ts` chịu trách nhiệm đọc/ghi, kiểm tra định dạng và báo lỗi; chỉ cập nhật UI thành công sau khi ghi được. Theme dùng khóa riêng `ddl-theme`.

Dữ liệu chỉ thuộc **profile trình duyệt + origin (giao thức, tên miền, cổng)** hiện tại. Đổi đường dẫn/hash không đổi dữ liệu, nhưng đổi trình duyệt, tên miền/cổng, xóa dữ liệu website hoặc dùng chế độ riêng tư có thể tạo hồ sơ khác hoặc mất bản lưu. Không có đăng nhập hay đồng bộ máy chủ.

Vào **Dữ liệu & sao lưu** để:

- Xuất toàn bộ dữ liệu học ra JSON.
- Nhập tệp (tối đa 5 MB), xem số bản ghi trước, rồi **xác nhận thay thế** dữ liệu hiện tại. Nên xuất bản hiện tại trước khi nhập.
- Tệp sai định dạng, ID không hợp lệ, đáp án/kết quả mâu thuẫn hoặc checklist không hợp lệ bị từ chối trước khi ghi. Nội dung giải thích quiz được tái dựng từ bài học.

Hệ thống không tự xóa dữ liệu hỏng hoặc phiên bản không hỗ trợ. Màn hình khôi phục cho phép tải nguyên bản dữ liệu còn lưu và nhập một bản sao hợp lệ. Khi localStorage bị chặn/đầy, UI báo lỗi và giữ nội dung đang nhập; các bản đã lưu trước đó không bị xóa. Hai tab đọc bản lưu mới nhất trước khi cập nhật và nhận sự kiện thay đổi; khi chỉnh cùng một trường, lần lưu sau cùng thắng, không có xử lý giao dịch nhiều người dùng.

Để reset thủ công: xuất bản sao trước, rồi xóa dữ liệu website trong cài đặt trình duyệt. Seed nội dung không còn cần thiết: nội dung tĩnh luôn được bundle, không ghi đè tiến độ.

**Lưu ý:** đáp án phải có trong bundle để chấm client-side. UI vẫn không mở lời giải trước khi gửi, nhưng người dùng có thể kiểm tra mã nguồn. Đây là sản phẩm học tập, không phải nền tảng thi có bảo mật đáp án. Không lưu thông tin nhạy cảm trong ghi chú trên máy dùng chung.

## Chuyển dữ liệu từ phiên bản SQLite trước đây

Backend, source và SQLite trước đây được **bảo toàn trong `legacy/`**, không thuộc build/chạy hiện tại. Database không bị xóa. Một bản export của hồ sơ cũ trên môi trường này đã được tạo ở `legacy-data/sqlite-profile-backup.json` (gitignore). Chưa tự động nhập vào trình duyệt nào.

Để chuyển một database khác, chỉ cần Python 3 với thư viện chuẩn:

```bash
mkdir -p legacy-data
python3 scripts/export_sqlite.py legacy/server/Data/learning.db --output legacy-data/my-profile.json
```

Công cụ đọc SQLite ở chế độ read-only, xuất định dạng backup v1, không sửa database và không ghi đè tệp output đã có. Sau đó nhập JSON trong trang **Dữ liệu & sao lưu**. Nếu chuyển thiết bị/hosting, dùng cùng luồng export/import; không cần chạy lại backend.

## Cấu trúc và thêm bài

- `client/src/data/catalog.json`: nguồn nội dung đang dùng, ID ổn định cho topic/lesson/section/question/example/exercise.
- `content.ts`: catalog hiển thị, chấm quiz và dự đoán kết quả thuần client.
- `storage.ts`: định dạng lưu phiên bản 1, validation, đọc/ghi và backup.
- `store.tsx`: cập nhật tiến độ/lịch sử và phản hồi lưu.
- `Learning.tsx`: kiến thức, ví dụ, quiz, bài tập và ghi chú.
- `DataPage.tsx`: xuất/nhập và khôi phục dữ liệu.

Thêm bài bằng cách sửa JSON, không cần thêm component. Chọn topic ID có sẵn, lesson `order`, version, prerequisites, sections có `core`/`deep`, ví dụ có `output`/`steps`/`comparison`, quiz có `correctOptionId` và giải thích từng option, bài tập và sources. `sectionId` của quiz phải khớp mục bài. Giữ ID khi sửa diễn đạt; nếu đổi nghĩa câu hỏi, dùng ID mới để không làm lịch sử cũ mâu thuẫn. Chưa có migration tự động cho trường hợp xóa/đổi ID trong dữ liệu đã lưu; xuất sao lưu trước khi thay đổi cấu trúc nội dung.

Nguồn Microsoft chính thức nằm trong mỗi bài. Các ví dụ C#/SQL và lời giải tham khảo đã được kiểm chứng thực thi. Giữ thuật ngữ/ngữ cảnh khi mở rộng nội dung; một số nhãn UI của bản đầu vẫn thể hiện 5 câu / 3 bài tập.

## Kiểm thử

```bash
./scripts/check.sh
```

Hoặc từ `client`:

```bash
npm run build       # TypeScript + production bundle
npm test            # Vitest: chấm quiz, ôn tập, tiến độ, storage, validation/backup
npm run test:e2e     # Playwright desktop/mobile với static preview, không backend
```

E2E cần Chromium. Nếu đã có: `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e`. Nếu chưa: `npx playwright install chromium` (cần network tới domain tải browser). Cloud hiện tại dùng Chromium hệ thống; mọi request `/api/` trong các test luồng học bị chặn và test yêu cầu không phát sinh request API.

`verification/verify_examples.py` là công cụ **tùy chọn** cho người biên soạn nội dung, không nằm trong setup/check bắt buộc. Nó cần Python và .NET SDK 10 để chạy 10 đoạn C# và 5 truy vấn SQLite tham khảo. Không chạy code học viên. Nội dung bài học không thay đổi trong lần chuyển kiến trúc này.

Kết quả kiểm chứng hiện tại và giới hạn: [docs/validation.md](docs/validation.md).

## Stack và giới hạn

React 19.2.0, TypeScript 5.9.3, Vite 7.3.7, React Router 7.18.5; font Be Vietnam Pro bundle local. Không có CMS, thanh toán, AI, chạy code tùy ý, đăng nhập hay đồng bộ nhiều thiết bị. Có thể học và lưu sau khi tài nguyên tĩnh đã tải ngay cả khi mất mạng; **chưa có service worker/PWA**, nên mở/reload khi hoàn toàn offline chưa được bảo đảm. Đã kiểm chứng Chromium desktop/mobile; chưa kiểm chứng Safari/Firefox hoặc thiết bị thật. SQL ví dụ chạy bằng SQLite, chưa chạy lại trên SQL Server.
