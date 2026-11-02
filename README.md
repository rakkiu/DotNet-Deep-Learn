# DotNet Deep Learn — thư viện lý thuyết

Ứng dụng đọc C#/.NET bằng tiếng Việt: **47 bài từ 41 phần bài giảng + 12 bài mở rộng phỏng vấn + 4 bài OOP chuyên sâu**, chia 6 chủ đề. Bài mới có nhãn **Mở rộng để ôn phỏng vấn**, không gán số phần thầy đã dạy. Website cung cấp lý thuyết, ví dụ và đáp án để đọc đối chiếu; không có trắc nghiệm, chấm điểm, nộp bài hay tiến độ.

Mỗi bài gốc giữ 11 mục và anchor cũ, thêm phần junior, middle, ví dụ mở rộng và hỏi đáp. Nhóm phỏng vấn có 7 mục; bốn bài OOP có 15 mục đào sâu. Tổng cộng **140 ví dụ và 315 câu hỏi**: mỗi bài 3 câu junior, 2 câu middle với đáp án, giải thích, hiểu nhầm và hỏi tiếp. Không quảng cáo bảo đảm đỗ phỏng vấn.

Hai lộ trình **Học nền tảng** và **Ôn phỏng vấn** dùng cùng kho 63 bài; có tiền đề, đầu ra quan sát được và nhãn thứ tự bài trước/sau. Tìm kiếm toàn văn không dấu gồm cả code/đáp án; có lọc chủ đề/nguồn, theme sáng/tối, tăng chữ, mục lục, copy code, dark mode, mobile và bản in. Thời gian đọc tính từ lượng văn bản và code, không cố định.

## OOP chuyên sâu — bốn tính chất, hai mức đọc

Mở `/#/oop` để chọn junior/middle và đọc theo bốn câu hỏi: ai được thay đổi state (đóng gói), caller được tin điều gì (trừu tượng), subtype có giữ contract không (kế thừa), implementation nào được gọi (đa hình). Mỗi bài có định nghĩa, cơ chế, bảng phân biệt, case trước/sau, 3 mẫu chạy + 1 mẫu cố ý lỗi và 5 hỏi đáp có giải thích. Có 16 project OOP độc lập trong ZIP tải từ website, được tạo từ JSON nguồn để tránh code trên bài khác code tải về. Xem [kiểm chứng OOP](docs/oop-validation.md).

## Chạy website

Node **24.x**; từ thư mục `client`:

```shell
npm ci --include=dev
npm run dev
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 5080
```

Build tạo ZIP project mẫu từ `examples/` trước khi đóng gói `client/dist/`. Không thêm package để tạo ZIP. Website không thực thi C# trong browser.

```shell
# Tại client; cần Playwright Chromium hoặc Chrome đã cài
npm run test:e2e
# PowerShell nếu dùng Chrome hệ thống và preview đang mở:
$env:PLAYWRIGHT_CHROMIUM_EXECUTABLE="C:/Program Files/Google/Chrome/Application/chrome.exe"
$env:PLAYWRIGHT_BASE_URL="http://localhost:5080"
npm run test:e2e
```

## Kiểm chứng .NET và tài liệu

SDK **10.0.403** (`global.json`), `net10.0`, C# 14; runtime/ASP.NET Core/EF Core/dotnet-ef **10.0.14**. xUnit v2 **2.9.3**, runner **3.1.5**, Test SDK **17.14.1**. Mỗi bài ghi ngày rà soát và bối cảnh phiên bản. Xem [README các lab](examples/README.md) trước khi chạy.

```shell
# Từ gốc repository; cần SDK và nguồn NuGet hoạt động
node scripts/verify-upgrade.mjs
node scripts/verify-upgrade-labs.mjs
node scripts/audit-upgrade-sources.mjs
node scripts/sync-upgrade-verification.mjs
```

`DDL_DOTNET` chọn executable SDK riêng; `THEORY_NUGET_SOURCE` chọn feed local nếu cần; `NUGET_PACKAGES`/`DOTNET_CLI_HOME` có thể trỏ thư mục do bạn sở hữu. Mặc định fixtures và cache nằm trong `.tools/` được ignore. Các ví dụ lỗi biên dịch có project riêng và diagnostic dự kiến; bộ test có ProjectReference và mutation bỏ guard. Lab dùng dữ liệu giả, loopback và database temp/copy riêng; không dùng database cá nhân.

- [Ma trận A01–A47/N01–N12 và đối chiếu từng yêu cầu](docs/upgrade-coverage.md).
- [Kiểm chứng giao diện, phiên bản, triển khai và giới hạn](docs/upgrade-validation.md).
- [Kết quả 140 ví dụ](docs/upgrade-example-results.json), [lab/HTTP/SQL/migration/publish](docs/upgrade-lab-results.json), [145 URL nguồn](docs/upgrade-sources.json).

Kết quả SQLite không chứng minh semantics SQL Server. Chưa chạy Docker, self-contained mọi RID hay live vulnerability advisory audit. Hai mẫu mở đầu chỉ được build, không được gọi là đã chạy. Identity dùng ephemeral keys cho lab local, chưa là cấu hình production.

## Biên soạn và URL

`client/src/data/theory.json` giữ mục lục/mapping 41 phần; `client/src/data/articles/*.json` là nguồn từng bài. `theory.ts` định nghĩa schema/tìm kiếm/thời gian đọc/lộ trình; `Content.tsx` hiển thị code/HTTP/bảng/sơ đồ/disclosure; `Paths.tsx` chứa lộ trình và hướng dẫn project/debug chung. Giữ ID bài gốc, các anchor cũ và ghi rõ origin, sourceParts, tiền đề, phiên bản, nguồn và trạng thái kiểm chứng khi sửa nội dung.

Phạm vi bài giảng dựa trên DOCX người dùng cung cấp, không tuyên bố đã xem trực tiếp video. Không commit bản ghi hoặc file DOCX. Chỉ theme dùng localStorage; đọc bài vẫn hoạt động khi storage bị chặn hoặc dữ liệu app cũ hỏng. Không tự xóa dữ liệu cũ. URL `/lessons/:id/:section` chuyển tới reader khi ID hợp lệ.

## Static hosting / Vercel

Đưa toàn bộ `client/dist/` lên static hosting sau build. HashRouter và `base: './'` hỗ trợ thư mục con, không cần SPA rewrite. Phục vụ qua HTTP(S). Vercel dùng Root Directory **client**, Node **24.x**; `client/vercel.json` giữ install/build/output. Không cần backend/database cho website đọc. Trạng thái GitHub/preview/production được ghi đúng phạm vi trong báo cáo; local publish của lab không phải production deployment của website.
