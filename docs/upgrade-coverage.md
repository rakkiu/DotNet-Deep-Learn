# Ma trận nâng cấp DotNet Deep Learn

Rà soát 2026-11-01. **47 bài gốc + 12 bài mở rộng = 59 bài; 295 câu hỏi có đáp án; 124 ví dụ.** Giữ mapping 41 phần, ID/URL bài cũ và 11 anchor gốc. Các mục được giữ đúng không bị gọi là lỗi; phần mở rộng là đề xuất học junior/middle, không chứng nhận tuyển dụng.

SDK 10.0.403, net10.0, C# 14; runtime/ASP.NET Core/EF Core/dotnet-ef 10.0.14; xUnit v2 2.9.3, Test SDK 17.14.1, runner 3.1.5. Windows, Node 24.19.0, npm 11.17.0, Chrome.

Mỗi mã bên dưới liên kết một bản đối chiếu chi tiết gồm URL, file nguồn, phần giữ/sửa/thêm, toàn bộ đoạn junior/middle, vị trí bảng/sơ đồ, ví dụ + kết quả kỳ vọng + bằng chứng kiểm tra, 3 câu junior/2 câu middle, nguồn và tiền đề. Bài mới không được tính vào phần thầy đã dạy.

| Mã / đối chiếu | Bài | Mục | Ví dụ | Câu hỏi | Nguồn chính |
|---|---|---:|---:|---:|---:|
| [A01](upgrade-coverage/A01.md) | [.NET — nền tảng, SDK và runtime](https://client-ifz4.vercel.app/#/read/dotnet-first-program) | 15 | 2 | 5 | 3 |
| [A02](upgrade-coverage/A02.md) | [C# — ngôn ngữ và chương trình đầu tiên](https://client-ifz4.vercel.app/#/read/csharp-language) | 15 | 3 | 5 | 2 |
| [A03](upgrade-coverage/A03.md) | [Visual Studio, .NET CLI và NuGet](https://client-ifz4.vercel.app/#/read/visual-studio) | 15 | 2 | 5 | 3 |
| [A04](upgrade-coverage/A04.md) | [Biến, kiểu dữ liệu, var và null](https://client-ifz4.vercel.app/#/read/csharp-types) | 15 | 3 | 5 | 2 |
| [A05](upgrade-coverage/A05.md) | [Mảng: chỉ số, kích thước và mảng nhiều chiều](https://client-ifz4.vercel.app/#/read/csharp-arrays) | 15 | 2 | 5 | 2 |
| [A06](upgrade-coverage/A06.md) | [Rẽ nhánh, vòng lặp và theo dấu chương trình](https://client-ifz4.vercel.app/#/read/csharp-control-flow) | 15 | 2 | 5 | 2 |
| [A07](upgrade-coverage/A07.md) | [Phương thức: tham số, return, ref và out](https://client-ifz4.vercel.app/#/read/csharp-methods) | 15 | 3 | 5 | 2 |
| [A08](upgrade-coverage/A08.md) | [Exception: bắt đúng lỗi, dọn đúng tài nguyên](https://client-ifz4.vercel.app/#/read/csharp-exceptions) | 15 | 2 | 5 | 2 |
| [A09](upgrade-coverage/A09.md) | [Stream, file và mã hóa văn bản](https://client-ifz4.vercel.app/#/read/dotnet-streams) | 15 | 2 | 5 | 2 |
| [A10](upgrade-coverage/A10.md) | [Collection: List, Dictionary, Queue và Stack](https://client-ifz4.vercel.app/#/read/csharp-collections) | 15 | 2 | 5 | 2 |
| [A11](upgrade-coverage/A11.md) | [Lambda: truyền một quy tắc như dữ liệu](https://client-ifz4.vercel.app/#/read/csharp-lambda) | 15 | 3 | 5 | 2 |
| [A12](upgrade-coverage/A12.md) | [LINQ: lọc, sắp xếp và chọn dữ liệu](https://client-ifz4.vercel.app/#/read/linq-basics) | 15 | 2 | 5 | 3 |
| [A13](upgrade-coverage/A13.md) | [Class, object và đóng gói một trạng thái hợp lệ](https://client-ifz4.vercel.app/#/read/oop-classes) | 15 | 2 | 5 | 2 |
| [A14](upgrade-coverage/A14.md) | [Đa hình: override khác gì với new?](https://client-ifz4.vercel.app/#/read/oop-polymorphism) | 15 | 2 | 5 | 2 |
| [A15](upgrade-coverage/A15.md) | [static, vòng đời state và phương thức mở rộng](https://client-ifz4.vercel.app/#/read/csharp-static) | 15 | 2 | 5 | 2 |
| [A16](upgrade-coverage/A16.md) | [Interface: gọi theo hợp đồng, thay được phần triển khai](https://client-ifz4.vercel.app/#/read/oop-interfaces) | 15 | 3 | 5 | 2 |
| [A17](upgrade-coverage/A17.md) | [SOLID và phân chia trách nhiệm](https://client-ifz4.vercel.app/#/read/design-testing-patterns) | 15 | 2 | 5 | 2 |
| [A18](upgrade-coverage/A18.md) | [Unit test — kiểm tra một hành vi độc lập](https://client-ifz4.vercel.app/#/read/unit-testing) | 15 | 2 | 5 | 2 |
| [A19](upgrade-coverage/A19.md) | [Factory và Abstract Factory](https://client-ifz4.vercel.app/#/read/factory-pattern) | 15 | 2 | 5 | 3 |
| [A20](upgrade-coverage/A20.md) | [Decorator — mở rộng bằng cách bọc](https://client-ifz4.vercel.app/#/read/decorator-pattern) | 15 | 2 | 5 | 2 |
| [A21](upgrade-coverage/A21.md) | [Generic, ràng buộc kiểu và boxing](https://client-ifz4.vercel.app/#/read/csharp-generics) | 15 | 3 | 5 | 2 |
| [A22](upgrade-coverage/A22.md) | [Delegate và event: ai được phát thông báo?](https://client-ifz4.vercel.app/#/read/csharp-events) | 15 | 2 | 5 | 2 |
| [A23](upgrade-coverage/A23.md) | [Thread, Task, concurrency và await](https://client-ifz4.vercel.app/#/read/tasks-concurrency) | 15 | 2 | 5 | 2 |
| [A24](upgrade-coverage/A24.md) | [ASP.NET Core: từ request đến action](https://client-ifz4.vercel.app/#/read/aspnet-first-app) | 15 | 2 | 5 | 2 |
| [A25](upgrade-coverage/A25.md) | [Controller, View và Razor mạnh kiểu](https://client-ifz4.vercel.app/#/read/mvc-views) | 15 | 2 | 5 | 2 |
| [A26](upgrade-coverage/A26.md) | [Routing: URL, HTTP method và tham số](https://client-ifz4.vercel.app/#/read/mvc-routing) | 15 | 2 | 5 | 2 |
| [A27](upgrade-coverage/A27.md) | [Model binding và validation: hai bước khác nhau](https://client-ifz4.vercel.app/#/read/mvc-binding) | 15 | 2 | 5 | 2 |
| [A28](upgrade-coverage/A28.md) | [Entity Framework Core và DbContext](https://client-ifz4.vercel.app/#/read/efcore-context) | 15 | 2 | 5 | 3 |
| [A29](upgrade-coverage/A29.md) | [SQL, SQL Server và SQLite](https://client-ifz4.vercel.app/#/read/relational-databases) | 15 | 2 | 5 | 3 |
| [A30](upgrade-coverage/A30.md) | [EF Core Migrations và tiến hóa schema](https://client-ifz4.vercel.app/#/read/efcore-migrations) | 15 | 2 | 5 | 3 |
| [A31](upgrade-coverage/A31.md) | [EF Core — quan hệ và tải dữ liệu](https://client-ifz4.vercel.app/#/read/efcore-relationships) | 15 | 2 | 5 | 3 |
| [A32](upgrade-coverage/A32.md) | [Authentication, Authorization và Identity](https://client-ifz4.vercel.app/#/read/aspnet-authorization) | 15 | 2 | 5 | 3 |
| [A33](upgrade-coverage/A33.md) | [Dependency Injection và ba vòng đời service](https://client-ifz4.vercel.app/#/read/dependency-injection) | 15 | 2 | 5 | 2 |
| [A34](upgrade-coverage/A34.md) | [Cache: hit, miss, hết hạn và dữ liệu cũ](https://client-ifz4.vercel.app/#/read/memory-caching) | 15 | 2 | 5 | 3 |
| [A35](upgrade-coverage/A35.md) | [Reflection và metadata: tra cứu một property](https://client-ifz4.vercel.app/#/read/dotnet-reflection) | 15 | 2 | 5 | 2 |
| [A36](upgrade-coverage/A36.md) | [Thread và vòng đời luồng](https://client-ifz4.vercel.app/#/read/dotnet-threads) | 15 | 2 | 5 | 2 |
| [A37](upgrade-coverage/A37.md) | [AutoResetEvent và ManualResetEvent](https://client-ifz4.vercel.app/#/read/thread-signals) | 15 | 2 | 5 | 3 |
| [A38](upgrade-coverage/A38.md) | [Semaphore và SemaphoreSlim](https://client-ifz4.vercel.app/#/read/semaphore-limits) | 15 | 2 | 5 | 2 |
| [A39](upgrade-coverage/A39.md) | [lock, Monitor và collection đồng thời](https://client-ifz4.vercel.app/#/read/thread-lock) | 15 | 2 | 5 | 2 |
| [A40](upgrade-coverage/A40.md) | [async/await — cơ chế bất đồng bộ](https://client-ifz4.vercel.app/#/read/async-await) | 15 | 2 | 5 | 2 |
| [A41](upgrade-coverage/A41.md) | [Task.WhenAll, WhenAny và quan sát lỗi](https://client-ifz4.vercel.app/#/read/task-composition) | 15 | 2 | 5 | 3 |
| [A42](upgrade-coverage/A42.md) | [TCP, Socket và Endpoint](https://client-ifz4.vercel.app/#/read/tcp-sockets) | 15 | 2 | 5 | 2 |
| [A43](upgrade-coverage/A43.md) | [HTTP request và kiến trúc Web Server](https://client-ifz4.vercel.app/#/read/http-request-line) | 15 | 2 | 5 | 2 |
| [A44](upgrade-coverage/A44.md) | [HTTP headers và ranh giới thông điệp](https://client-ifz4.vercel.app/#/read/http-headers) | 15 | 2 | 5 | 2 |
| [A45](upgrade-coverage/A45.md) | [HTTP response và streaming body](https://client-ifz4.vercel.app/#/read/http-response) | 15 | 2 | 5 | 3 |
| [A46](upgrade-coverage/A46.md) | [Middleware, pipeline và static files](https://client-ifz4.vercel.app/#/read/aspnet-middleware) | 15 | 2 | 5 | 2 |
| [A47](upgrade-coverage/A47.md) | [HttpClient và System.Text.Json](https://client-ifz4.vercel.app/#/read/httpclient-json) | 15 | 2 | 5 | 3 |
| [N01](upgrade-coverage/N01.md) | [Struct, record, immutability và equality](https://client-ifz4.vercel.app/#/read/csharp-value-modeling) | 7 | 2 | 5 | 3 |
| [N02](upgrade-coverage/N02.md) | [CLR, GC và quyền sở hữu tài nguyên](https://client-ifz4.vercel.app/#/read/dotnet-memory-gc) | 7 | 2 | 5 | 3 |
| [N03](upgrade-coverage/N03.md) | [String, Unicode và so sánh văn bản](https://client-ifz4.vercel.app/#/read/csharp-strings-unicode) | 7 | 2 | 5 | 2 |
| [N04](upgrade-coverage/N04.md) | [Ngày giờ, số tiền và hợp đồng dữ liệu](https://client-ifz4.vercel.app/#/read/dotnet-dates-numbers-culture) | 7 | 2 | 5 | 3 |
| [N05](upgrade-coverage/N05.md) | [Web API, REST và hợp đồng HTTP](https://client-ifz4.vercel.app/#/read/aspnet-web-api-design) | 7 | 2 | 5 | 3 |
| [N06](upgrade-coverage/N06.md) | [Configuration, Options, logging và xử lý lỗi](https://client-ifz4.vercel.app/#/read/aspnet-configuration-observability) | 7 | 2 | 5 | 4 |
| [N07](upgrade-coverage/N07.md) | [Transaction, isolation và optimistic concurrency](https://client-ifz4.vercel.app/#/read/efcore-transactions-concurrency) | 7 | 2 | 5 | 2 |
| [N08](upgrade-coverage/N08.md) | [Tối ưu truy vấn EF Core và SQL](https://client-ifz4.vercel.app/#/read/efcore-query-performance) | 7 | 2 | 5 | 4 |
| [N09](upgrade-coverage/N09.md) | [Identity, token và bảo vệ endpoint](https://client-ifz4.vercel.app/#/read/aspnet-identity-api-security) | 7 | 2 | 5 | 4 |
| [N10](upgrade-coverage/N10.md) | [Kiểm thử tích hợp ASP.NET Core và EF Core](https://client-ifz4.vercel.app/#/read/aspnet-integration-testing) | 7 | 2 | 5 | 3 |
| [N11](upgrade-coverage/N11.md) | [BackgroundService, Channel và shutdown](https://client-ifz4.vercel.app/#/read/dotnet-background-workers) | 7 | 2 | 5 | 4 |
| [N12](upgrade-coverage/N12.md) | [Build, publish và triển khai .NET](https://client-ifz4.vercel.app/#/read/dotnet-delivery-basics) | 7 | 2 | 5 | 4 |

## Bằng chứng và giới hạn

Kết quả ví dụ: 22 lab dùng chung; 83 chạy + so stdout; 5 HTTP thật; 6 lỗi compiler dự kiến; 1 minh họa, chưa chạy; 3 CLI build/run/publish (chưa audit advisory); 2 chỉ biên dịch; 1 SQL SQLite; 1 test + mutation. [Kết quả máy đọc được](upgrade-example-results.json). Lab Web/API có 9 ca xUnit, thêm hai lượt filter auth/form chạy độc lập; DataLab có assertion SQL/state/conflict/rollback; MigrationLab chạy hai migration và giữ An; Release publish được khởi động và GET /, /health/ready thành công. [Log lab thật](upgrade-lab-results.json).

130 URL tài liệu duy nhất đều trả 200 tại lần audit; [kết quả nguồn](upgrade-sources.json). Điều này chỉ xác nhận truy cập, không thay đánh giá nội dung.

- Hai mẫu mở đầu chỉ biên dịch, không được tính là đã chạy. Một mẫu tùy chọn container/deploy là minh họa, chưa chạy Docker.
- CLI kiểm tra info/SDK/runtime, package list, build/run/publish; chưa gọi live vulnerability advisory audit. Các phím debugger là hướng dẫn thao tác thủ công.
- SQLite local không chứng minh semantics SQL Server, rowversion/isolation hay execution plan production. Không đưa benchmark suy đoán.
- Các sample concurrency kiểm tra invariant được viết trong code; không coi một lần chạy là chứng minh không có mọi race hoặc scheduler có thứ tự cố định.
- Identity dùng ephemeral keys và dữ liệu giả local. Chưa cấu hình key persistence, TLS, secret store hay production identity provider cho lab.
- Trạng thái deployment, kết quả UI và ảnh đại diện được ghi riêng trong [upgrade-validation.md](upgrade-validation.md); không gọi một PR hoặc local publish là production deployment.
