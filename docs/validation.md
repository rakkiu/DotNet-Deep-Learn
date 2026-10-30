# Kiểm chứng phiên bản client-side

Môi trường: Linux x64, Node 24.19.0 / npm 11.9.0, Chromium hệ thống. Không khởi động ASP.NET hoặc database server trong các lượt kiểm thử mới.

| Kiểm tra | Kết quả thực tế |
| --- | --- |
| `./scripts/setup.sh` | Thành công: npm ci và production build; không cài/khởi động .NET |
| `npm run build` trong client | TypeScript và Vite thành công |
| `npm test` (Vitest 5.0.5) | 32/32 unit tests đạt: mọi lựa chọn của 15 câu hỏi, 6 dự đoán, lịch sử/ôn tập, tiến độ, localStorage, validation, backup và lỗi lưu |
| `npm run test:e2e` với system Chromium | 26/26 đạt: 13 desktop + 13 mobile, dùng static Vite preview |
| Axe WCAG A/AA trong E2E | Không phát hiện vi phạm tự động ở dashboard, phần kiến thức, ví dụ SQL, trang sao lưu và dashboard dark mode |
| Chặn `/api/**` trong browser workflow/storage tests | Không phát sinh request API; chấm/lưu thực hiện tại client |
| Tắt mạng sau khi app tải | Trả lời quiz và lưu ghi chú được, kết quả còn sau reload khi bật mạng lại |
| Static hosting thuần HTTP tại thư mục con `/nested/` | Mở thẳng route hash, quiz, lưu ghi chú và reload đạt; không có rewrite hay backend |
| `npm audit --audit-level=high` sau khi cập nhật Vitest | 0 vulnerabilities được báo |
| Backup SQLite cũ | Đã xuất read-only sang `legacy-data/sqlite-profile-backup.json`, hồ sơ cũ hiện có 0 bản ghi học; database vẫn còn trong `legacy/server/Data` |

Browser tests kiểm tra: theme/reload, mobile menu/Escape, radio bàn phím, không tràn ngang, console dashboard, dự đoán trước khi mở giải thích, SQL result table, sai → ôn đúng giữ lịch sử, ghi chú/yêu thích/bài làm/checklist qua reload, tìm không dấu và bộ lọc, phần học gần nhất và link mục bài, xuất/nhập có xác nhận, từ chối backup sai, khôi phục dữ liệu hỏng không tự xóa, lỗi quota giữ bản nháp/bản lưu cũ và retry, nhiều tab và profile trình duyệt độc lập.

Nội dung 3 bài không thay đổi; 10 đoạn C# và 5 truy vấn SQL đã được thực thi kiểm chứng ở bản trước. Việc này không đồng nghĩa code học viên được thực thi hay chấm. `verification/verify_examples.py` hiện đọc nội dung từ `client/src/data/catalog.json` và là công cụ biên soạn tùy chọn.

Giới hạn: chưa publish static site; chưa kiểm tra Safari/Firefox hoặc thiết bị thật, chưa có PWA/offline reload bảo đảm. Axe tự động không thay thế đánh giá accessibility thủ công toàn bộ trạng thái. Dữ liệu không tự đồng bộ giữa thiết bị. Answer keys có trong bundle client, không có bảo mật bài thi.
