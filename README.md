# DotNet Deep Learn — thư viện lý thuyết

Ứng dụng đọc lý thuyết C#/.NET bằng tiếng Việt, xây lại theo **41 phần trong `tech_thầy_đã_dạy.docx`**. Có **47 bài**, chia 6 chủ đề. C#, IDE, unit test, factory, decorator và SQL được tách riêng để phân biệt đúng bản chất.

Đã bỏ trắc nghiệm, dự đoán đáp án, bài tập, chấm điểm, nộp bài, tiến độ và màn hình sao lưu. Ví dụ có code, kết quả và giải thích sẵn; website không thực thi C# của người đọc.

## Mỗi bài có 11 mục

1. Đây là công nghệ gì: ngôn ngữ, nền tảng, framework, database, thư viện, công cụ hay kỹ thuật.
2. Vấn đề giải quyết và cách làm trước đó.
3. Lợi ích, bối cảnh sử dụng và đánh đổi.
4. Khi nào không nên dùng, giới hạn và nhầm lẫn.
5. Cơ chế hoạt động bên dưới.
6. Khái niệm cốt lõi kèm định nghĩa và ví dụ.
7. Tương tác với thành phần khác và bảo mật.
8. Hello World: khởi tạo, file, code, kết quả và giải thích.
9. Bố cục thư mục, file cấu hình; phân biệt quy ước và yêu cầu bắt buộc.
10. Debug và log lỗi theo từng kiến thức.
11. Tài liệu chính thức và cộng đồng.

Có tìm kiếm toàn bộ nội dung không dấu, lọc chủ đề, trang đối chiếu bài giảng, mục lục từng bài, deep link đến mục, tăng cỡ chữ, theme sáng/tối và bố cục điện thoại. `Ctrl+K` đưa focus vào tìm kiếm chung; nhập từ khóa rồi Enter. Có CSS cho việc in bài bằng trình duyệt.

## Chạy local

Cần Node.js **24.x** và npm. Website không cần .NET, backend, database hay tài khoản.

```sh
cd client
npm ci
npm run dev -- --port 5080
```

Mở `http://localhost:5080/`. Môi trường Bash có thể dùng `./scripts/setup.sh` rồi `./scripts/dev.sh`.

Xem bản build tĩnh:

```sh
cd client
npm run build
npm run preview -- --port 5080
```

Vite dùng native config loader với Node 24. UI dùng React/TypeScript, Lucide và Prism; font tiếng Việt được bundle local.

## Kiểm tra

```sh
cd client
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Có thể đặt `PLAYWRIGHT_CHROMIUM_EXECUTABLE` thành đường dẫn Chrome/Chromium sẵn có thay bước tải browser. PowerShell:

```powershell
$env:PLAYWRIGHT_CHROMIUM_EXECUTABLE = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm run test:e2e
```

Kiểm tra phạm vi 41 phần/47 bài/11 mục, không có payload chấm bài, tìm kiếm, mọi deep link, đường dẫn cũ, mục lục, cỡ chữ/theme, lỗi storage, bố cục mobile và accessibility sáng/tối.

Có checker cho các ví dụ C# (cần .NET 10 SDK và NuGet, chỉ dành cho người phát triển):

```sh
node scripts/verify-theory-examples.mjs
```

Checker tạo project dưới `.tools/`, build ví dụ C#, chạy các ví dụ console độc lập và ghi kết quả thực vào `docs/example-verification.json`. Ví dụ web chỉ được build; SQL/terminal có trạng thái riêng. Luồng migration cần áp dụng vào database local theo hướng dẫn để kiểm chứng đầy đủ. Không coi kiểm tra compiler là kiểm chứng mọi hành vi production.

## Source và biên soạn

```text
client/src/App.tsx           # thư viện, reader, nguồn, điều hướng
client/src/theory.ts         # schema/types và tìm kiếm
client/src/data/theory.json  # mục lục và mapping 41 phần
client/src/data/articles/    # mỗi bài lý thuyết là một JSON riêng
client/src/styles.css       # responsive, dark mode, print
client/src/theory.test.ts    # phạm vi và tìm kiếm
client/e2e/theory.spec.ts    # kiểm tra trình duyệt
docs/theory-coverage.md      # đối chiếu tài liệu thầy
```

Khi thêm/sửa bài, giữ đủ 11 section IDs và ghi rõ `sourceParts`, `category`, loại công nghệ, nguồn. Không chuyển yêu cầu thực hành trong bản ghi thành chức năng giao bài trên website.

Phạm vi dựa trên bản ghi người dùng cung cấp; không tuyên bố đã xem trực tiếp video. Phần giải thích được mở rộng, có liên kết Microsoft, SQLite, xUnit và IETF. Trang **Theo bài giảng** đối chiếu từng phần. Không lưu file DOCX hay bản ghi đầy đủ trong repo.

Bản ghi có bối cảnh .NET 8; ví dụ mới dùng .NET 10. Những khác biệt như `System.Threading.Lock`, .NET Framework/Core/Standard, Task/Thread và JIT/AOT được giải thích rõ. Mốc package phục vụ tái hiện; khi làm dự án thật cần cập nhật bản vá được hỗ trợ và giữ provider/tool cùng major tương thích. Kết quả kiểm tra nằm trong `docs/validation.md`.

## Dữ liệu cũ và đường dẫn

Đọc bài không phụ thuộc localStorage. Chỉ theme dùng khóa `ddl-reading-theme`. Không dùng lại hay tự xóa khóa `dotnet-deep-learn:state:v1` của app cũ, kể cả khi nó hỏng. Các URL `/lessons/:id/:section` chuyển tới bài lý thuyết khi ID còn tồn tại; review/progress/data/bookmarks chuyển về thư viện.

## Static hosting / Vercel

Đưa **toàn bộ `client/dist/`** lên static hosting sau build. HashRouter và `base: './'` hỗ trợ thư mục con, không cần SPA rewrite. Phục vụ qua HTTP(S), không mở `index.html` bằng `file://`.

Vercel: Root Directory **`client`**, Node **24.x**. `client/vercel.json` đặt install `npm ci --include=dev`, build `npm run build`, output `dist`. Không cần biến môi trường/backend/database. Build/preview local và PR không đồng nghĩa production đã triển khai.
