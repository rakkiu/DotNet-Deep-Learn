> Biên bản của đợt 01/11/2026, trước khi thêm bốn bài OOP. Xem [đợt OOP ngày 02/11](oop-validation.md) cho số liệu và kiểm chứng mới.

# Kiểm chứng đợt nâng cấp junior/middle

Ngày thực hiện: 2026-11-01, Windows, múi giờ Asia/Saigon. Mã nguồn và số liệu bên dưới thuộc nhánh nâng cấp, không phải bằng chứng production đã nhận nhánh này.

## Môi trường

- Node 24.19.0, npm 11.17.0; React/Vite/TypeScript theo lockfile hiện có.
- .NET SDK **10.0.403**, C# **14**, target **net10.0**; runtime/ASP.NET Core/EF Core/dotnet-ef **10.0.14**. SDK portable được tải từ Microsoft và đối chiếu SHA-512 của release metadata.
- xUnit v2 **2.9.3**, runner.visualstudio **3.1.5**, Microsoft.NET.Test.Sdk **17.14.1**, Microsoft.AspNetCore.Mvc.Testing **10.0.14**.
- NuGet được cache vào feed cô lập vì TLS của .NET/Windows trong sandbox không restore trực tiếp ổn định. Không tắt kiểm tra chứng chỉ. Verifier truyền source local khi có `THEORY_NUGET_SOURCE`.
- Chrome hệ thống qua Playwright: desktop 1440×1000 và Pixel 7 (393 px); ảnh mobile kiểm tra riêng tại **390×844**.

## Website

| Kiểm tra | Kết quả thực |
|---|---|
| `npm run build` | Pass: TypeScript + Vite; prebuild đóng ZIP 21 file nguồn lab |
| `npm test` | 6/6 pass: 41 mapping, 47+12 bài, anchor cũ, QA/examples/resources, search, DAG tiền đề/lộ trình, nhãn code/lỗi có chủ ý |
| `npm run test:e2e` | **18/18 pass**, 9 ca trên mỗi viewport |
| Mở trực tiếp/reload các bài | Toàn bộ **59 URL** trên cả hai viewport; số mục gốc 15/mới 7; không có pageerror |
| Tìm kiếm/lọc | Nội dung, không dấu, giao chủ đề/nguồn, trạng thái rỗng và clear, reload bộ lọc |
| Đọc | Anchor + focus, tăng chữ, lịch sử, chuyển link cũ, nhận biết bài không tồn tại |
| Lộ trình/hỏi đáp | Hai lộ trình đủ 59 bài, 6 module, nhãn nguồn mới, mở đáp án bằng Enter, bài trước/sau giữ order |
| Clipboard/tải file | Clipboard chỉ có source (chuẩn hóa CRLF của Windows khi so sánh); ZIP HTTP 200 và signature PK |
| Storage | Đọc được khi dữ liệu cũ hỏng và khi getItem/setItem bị chặn |
| Bố cục | Không tràn ngang document trên trang chủ, reader/bảng, nguồn, lộ trình, guide; code/bảng có vùng cuộn riêng |
| Accessibility | Axe WCAG 2 A/AA + 2.1 AA: 0 vi phạm được phát hiện trên home, reader, lộ trình và API/Q&A, sáng/tối, cả hai viewport |

Preview được kiểm tra tại `http://localhost:5080/`. Vite production preview được dùng trong sandbox Windows; dev dependency prebundling ở môi trường này từng gặp lỗi quyền đọc thư mục gốc. Đây là giới hạn môi trường, không đổi cấu hình sang bỏ kiểm tra bảo mật hoặc ghi nhận dev server đã pass. Build có cảnh báo chunk curriculum khoảng 786 kB trước gzip (~178 kB gzip), vì tìm kiếm nạp toàn bộ văn bản/code; không có lỗi build.

Ảnh chụp thật đã lưu ở outputs của chat: `upgrade-home.png`, `upgrade-path.png`, `upgrade-junior-middle.png`, `upgrade-answer.png`, `upgrade-mobile.png`. Đã xem ảnh desktop và mobile để đối chiếu bố cục. Ảnh không phải thiết kế giả lập.

## Ví dụ .NET/SQL/HTTP

124 ví dụ được phân loại rõ trong [upgrade-example-results.json](upgrade-example-results.json):

| Loại bằng chứng | Số mẫu | Phạm vi |
|---|---:|---|
| Chạy và so kết quả | 83 | Build rồi chạy DLL cô lập, so stdout với expected; có guard/invariant/cancellation/cleanup được viết trong mã |
| HTTP của project nhỏ | 5 | Build, bind loopback, gửi request đúng method/body, assert status |
| CLI | 3 | --info, list SDK/runtime, build/run/package list/publish; riêng flow HelloDotNet chạy new/add package thật |
| Lỗi compiler chủ ý | 6 | Build phải thất bại với diagnostic CS được chỉ định |
| Chỉ build | 2 | Assertion mở đầu và migration intro; không gọi là đã run |
| SQL SQLite | 1 | SQL schema/query chạy thật, assert bản ghi An |
| Unit test + mutation | 1 | Test project tham chiếu production project; bỏ guard làm test thất bại đúng |
| Lab dùng chung | 22 | Liên kết tới check có tên trong [upgrade-lab-results.json](upgrade-lab-results.json), không giả mỗi request snippet là script độc lập |
| Minh họa tùy chọn | 1 | Không thực thi self-contained mọi RID/Docker; nhãn hiển thị rõ |

Lab đã chạy thành công:

- **WebLab.Tests: 9/9** ca. CRUD 201/Location/404/409/204; auto/manual validation 400 có errors; JSON thiếu/null/sai kiểu; 405/Allow, 415; anonymous/role/owner 401/403/200; Razor encoding, antiforgery, form invalid, redirect PRG; middleware unwind/short-circuit, static/private, 500 ProblemDetails/trace ID, config, ETag 304; Identity register/login/refresh/cookie/logout thật theo framework. Test auth handler chỉ có trong test assembly.
- Chạy độc lập filter role/ownership **1/1** và Razor/form **1/1** để kiểm tra cô lập.
- **DataLab** assert state Added/Unchanged/Modified/Deleted/Detached, trước/sau SaveChanges, identity tracking/no-tracking, SQL projection/command count, split query, quan hệ/payload, hai context token conflict, rollback, LEFT JOIN, parameterization, FK restrict, bulk stale/reload. DB temp được dọn.
- **MigrationLab**: copy sạch, dotnet-ef 10.0.14 tạo InitialCreate và AddEmail, xuất SQL, cập nhật hai lần; DB cuối có Id/Email/Name và đúng một bản ghi `An`, Email chuỗi rỗng. Không dùng EnsureCreated cho flow migration.
- **Release publish**: publish framework-dependent rồi chạy từ output directory; GET `/` trả 200 và `Xin chào .NET 10`, GET `/health/ready` trả 200/ready. Process test được dừng.

## Nguồn và giới hạn

[Audit nguồn](upgrade-sources.json): **130/130 URL duy nhất trả 200**. Dùng cache kết quả thành công và giảm nhịp request sau khi Microsoft Learn trả 429. Title cũ dạng slug được thay bằng tiêu đề trang cụ thể. Audit truy cập không tự chứng nhận mọi phát biểu kỹ thuật.

Chưa chạy live vulnerability advisory audit, Docker, self-contained trên mọi RID, debugger GUI tự động, SQL Server production/query plan, hay production identity provider. SQLite không thay chứng cứ semantics của engine khác. Một lần chạy concurrency không chứng minh không có mọi race. Các giới hạn tương ứng cũng được ghi trong nhãn ví dụ và [ma trận bao phủ](upgrade-coverage.md).

Website giữ cấu hình Vercel hiện có (`client`, Node 24.x, build `npm run build`, output `dist`). Local preview, lab publish và GitHub push là các mốc khác nhau; kết quả deployment/URL GitHub cuối cùng được báo ở chat khi dịch vụ trả về, không bịa trạng thái triển khai trong báo cáo.
