# Kiểm chứng bản xây lại từ ghi chú 41 bài

Ngày kiểm chứng: 30/10/2026. Môi trường Linux x64, Node 24.19.0 / npm 11.9.0, Chromium hệ thống, .NET SDK 10.0.403. Ứng dụng chỉ cần Node để build và static hosting để phục vụ; .NET được dùng riêng để kiểm chứng nội dung, không phải backend của ứng dụng.

| Kiểm tra | Kết quả thực tế |
| --- | --- |
| `npm run build` | TypeScript và Vite production build thành công |
| `npm test` | 317/317 tests: mọi lựa chọn của 215 câu hỏi, 86 dự đoán, curriculum coverage/IDs/anchors, lịch sử/ôn tập, localStorage, validation và backup |
| Playwright desktop/mobile | 26/26 tests đạt, static preview không có backend: tìm/lọc/lưu bài, lộ trình mới, định nghĩa/ôn nhanh, request và Razor file, theme, keyboard, quiz/review/history, bài làm, ghi chú, backup, quota, cross-tab/profile và offline sau khi tải |
| Axe WCAG A/AA | Không phát hiện vi phạm tự động trên thư viện, bài Console, ví dụ SQL, bài MVC/Razor, quiz binding, bài tập EF, trang dữ liệu và thư viện dark mode ở cả hai viewport |
| `verification/verify_examples.py` | 131 chương trình C# riêng biệt + 5 SQL đạt; kiểm chứng 211 tham chiếu tới code C#/lời giải/test harness sau khi loại code trùng |
| ASP.NET Core | Chạy app web thật và gửi request loopback: MVC text, Razor encoding, routing, validation và middleware/fallback; kiểm tra response body và HTTP status |
| EF Core | SQLite in-memory, chạy context/query/SaveChanges/Include thật; không dùng mock DbContext |
| Tương thích dữ liệu cũ | Đối chiếu ba bài có trước: toàn bộ examples, questions, đáp án, exercises và checklist không đổi; các test backup và lưu/khôi phục vẫn đạt |
| Client-side | Browser workflow/storage tests chặn `/api/**` và xác nhận không có request API; quiz/ghi chú vẫn lưu được khi tắt mạng sau khi tải static assets |

Báo cáo số lượng thực thi: [latest-results.json](../verification/latest-results.json). Bộ kiểm chứng chạy từng chương trình riêng, so sánh output và status HTTP. Các đoạn code trùng chỉ được gộp khi expected output cũng trùng. Chạy toàn bộ bằng `python3 verification/verify_examples.py`; cần .NET 10, NuGet cho EF SQLite và quyền mở socket loopback. Test harness mới trong bài thiết kế được chạy bổ sung sau lượt toàn bộ; số tổng trong báo cáo bao gồm ca này.

Bản kiểm tra UI đầy đủ có 13 test desktop và 13 test mobile. Sau khi bổ sung test harness, build và 317 unit tests tiếp tục đạt; 2 lượt browser regression của luồng học mới (desktop/mobile) cũng đạt. Ảnh chụp: [desktop](desktop.png), [mobile](mobile.png), [bài học desktop](lesson-desktop.png), [bài học mobile](lesson-mobile.png). Không phát hiện tràn ngang ở các trang được kiểm tra.

Nguồn và các hiệu chỉnh nội dung: [curriculum.md](curriculum.md). Video chưa được xem trực tiếp; DOCX đã được đọc và diễn giải lại, kết hợp tài liệu Microsoft. Thực thi ví dụ chứng minh output trong môi trường nêu trên, không chứng minh mọi phát biểu đúng trên mọi provider/phiên bản hoặc đồng nghĩa với chấm code học viên.

Giới hạn: chưa kiểm tra Safari/Firefox hoặc thiết bị thật; chưa có service worker bảo đảm offline reload. SQL/EF dùng SQLite, chưa chạy SQL Server. Migrations không được áp dụng lên database production. Parser HTTP là fixture học tập, HttpClient dùng handler giả lập. Axe không thay thế đánh giá thủ công đầy đủ. Bundle gồm toàn bộ nội dung và answer keys (khoảng 1,3 MB chưa nén, 196 KB gzip cho JS); Vite có cảnh báo chunk lớn. Không có đăng nhập, đồng bộ dữ liệu hay bảo mật đáp án thi. Chưa xác nhận deployment production Vercel trong lần xây lại này.
