# Kiểm tra bản thư viện lý thuyết

Ngày đối chiếu: 2026-11-01 (Asia/Saigon). Node 24.19.0, npm 11.17.0, .NET SDK 10.0.302, Chrome trên Windows.

| Kiểm tra | Kết quả |
| --- | --- |
| TypeScript và production build (`npm run build`) | Thành công |
| Vitest: phạm vi, nội dung, tìm kiếm, giới hạn async/migration | 5/5 pass |
| Playwright desktop 1440×1000 | 7/7 pass |
| Playwright mobile Pixel 7 | 7/7 pass |
| Mở toàn bộ 47 bài, mỗi bài đủ 11 mục | Pass trên cả hai viewport |
| Tìm toàn văn không dấu, lọc và trạng thái rỗng | Pass |
| Mục lục/deep link/focus, điều hướng back/next, link cũ | Pass |
| Đọc khi localStorage bị chặn và dữ liệu cũ hỏng | Pass |
| Menu mobile, Ctrl+K, không tràn ngang | Pass |
| Axe WCAG 2 A/AA, 2.1 AA: thư viện và reader, sáng/tối | Không có violation trong các trang kiểm tra |
| 94 URL tài liệu riêng biệt | HTTP 200 sau sửa một URL trimming đã chuyển |
| Ví dụ C#/.NET | 45/45 build; 38 console đã chạy |

Playwright được chạy trên production preview có sẵn qua `PLAYWRIGHT_BASE_URL=http://localhost:5080`, tránh vấn đề teardown chuỗi npm/cmd trên Windows. Mặc định config vẫn tự mở preview ở 5089 nếu không đặt biến này.

## Phạm vi xác minh ví dụ

Chi tiết nằm trong [example-verification.json](example-verification.json). Checker là [verify-theory-examples.mjs](../scripts/verify-theory-examples.mjs).

- 38 ví dụ console: build và chạy thành công, bao gồm TCP loopback, async/thread primitives và hai ví dụ EF SQLite in-memory.
- 5 ví dụ web: build thành công; không xác nhận runtime HTTP bằng checker C# này.
- Ví dụ unit test: compile với xUnit; checker không chạy test runner của ví dụ đó.
- Ví dụ migration: compile với provider SQLite; chưa chạy đầy đủ vòng add migration/update database. Phần hướng dẫn phân biệt rõ migrations với EnsureCreated.
- Hai bài SQL/terminal: không tính vào 45 ví dụ C#, chưa xác minh SQL/chuỗi lệnh shell bằng checker.

NuGet của .NET trong sandbox Windows ban đầu gặp lỗi Schannel. Các package công khai cần thiết đã được tải bằng TLS của Node vào local feed dưới `.tools/` rồi build lại bốn ví dụ phụ thuộc NuGet. Không thay đổi certificate, không tắt kiểm tra TLS và không lưu credential. Checker hỗ trợ `THEORY_NUGET_SOURCE` để dùng feed được chỉ định; bình thường dùng NuGet đã cấu hình của máy.

## Giới hạn môi trường

Production build/preview và app trong trình duyệt đã được xác minh. Dev server có bước esbuild prebundle gặp hạn chế đọc thư mục cha trong sandbox Windows của phiên này; không lấy kết quả khởi động dev server làm bằng chứng UI chạy. Có thể dùng `npm run build` rồi `npm run preview` để xem bản đã kiểm tra.

Accessibility tự động không thay thế toàn bộ đánh giá thủ công. Kiểm tra nguồn URL chỉ xác nhận đường dẫn hiện truy cập được, không phải chứng nhận mọi dòng diễn giải hay mọi khác biệt theo version. Không tuyên bố benchmark hay mức phổ biến thị trường.

Chưa triển khai production. Build, bản đóng gói và PR là kết quả kiểm tra local/repository.
