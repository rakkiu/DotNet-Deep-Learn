# Biên soạn lại nội dung từ tài liệu được cung cấp

Nguồn chính là DOCX “Tài liệu không có tiêu đề” do người dùng tải lên: 41 mục từ Console C# đến MVC, EF Core, đa luồng và HTTP. Các ghi chú được diễn giải lại, bổ sung định nghĩa và ví dụ, không chép nguyên văn thành bài học. 41 liên kết video được gắn theo đúng thứ tự người dùng cung cấp. Môi trường chưa truy cập được nội dung YouTube, nên không khẳng định đã xem video hoặc xác nhận lời nói của giảng viên. DOCX gốc không được đưa vào repo.

Có 43 bài: 41 mục tương ứng ghi chú và 2 bài bổ sung LINQ deferred execution / SQL LEFT JOIN. Bài đa hình cũ được dùng cho mục 12. Cả ba bài có từ phiên bản trước giữ nguyên ID câu hỏi, lựa chọn, đáp án, ID bài tập và checklist để lịch sử và backup cũ tiếp tục đọc được.

Mỗi bài có định nghĩa kèm tình huống cụ thể, hướng dẫn chuẩn bị môi trường, cơ chế, điểm dễ nhầm, 2 ví dụ dự đoán, 5 câu tự kiểm tra và 3 bài tập tự đánh giá. Chế độ “Ôn nhanh” cung cấp ý chính; chế độ “Học từ đầu” trình bày đầy đủ. Tổng cộng 86 ví dụ dự đoán, 215 câu hỏi và 129 bài tập. Bài test harness ở phần thiết kế là ví dụ bổ sung, chạy độc lập.

## Các điểm đã sửa hoặc làm rõ

| Chủ đề | Cách diễn đạt dùng trong ứng dụng |
| --- | --- |
| Cài đặt .NET | SDK khác runtime và IDE; Solution không bắt buộc; VS Code + SDK là lựa chọn hợp lệ; Visual Studio for Mac đã ngừng hỗ trợ. .NET Standard là đặc tả API. .NET Framework 4.8.1 vẫn có chính sách hỗ trợ gắn với Windows. |
| Kiểu và mảng | `var` giữ kiểu tĩnh. Gán reference không clone object. Biến cục bộ chưa gán gây lỗi biên dịch khi đọc; tham chiếu được gán `null` mới có thể gây lỗi null runtime. Nullable annotations không tự kiểm tra mọi lời gọi. |
| String và method | String bất biến không có nghĩa mọi thao tác đều tạo instance mới. Có top-level statements và local functions. By value với reference type vẫn cho phép sửa object dùng chung, nhưng gán lại parameter không gán lại biến caller. |
| Exceptions và I/O | `finally` không bảo đảm trước kill process/FailFast. `throw;` khác `throw e;`. Read có thể trả thiếu byte; `File.OpenWrite` không truncate; Flush không đồng nghĩa bảo đảm độ bền vật lý sau mất điện. |
| Collections và LINQ | Không phải collection nào cũng có Capacity. `FirstOrDefault<int>` mặc định trả 0. Không phải mọi toán tử LINQ đều trì hoãn. LINQ to Objects khác IQueryable/provider. |
| OOP, static, interface, generic | Phân biệt overload/override/hiding và kiểu tĩnh/runtime. Static state có phạm vi type, closed generic và load context. Static method có thể sử dụng instance được truyền vào. C# 8 có default interface members, C# 11 có static abstract. Generic không tự bảo đảm không boxing hoặc luôn nhanh nhất. |
| MVC và validation | MVC là một mô hình trong ASP.NET Core. Không phải mọi method public là action. Binding/JSON formatting khác validation, authentication và authorization. DTO giới hạn field được nhập; Razor encode text mặc định. |
| EF Core | Add khác SaveChanges; DbContext không thread-safe. DbSet không nhất thiết tương ứng một bảng. Migration so model với snapshot, có thể mất dữ liệu; cần review script. Include có thể dùng split query; lazy loading cần cấu hình. |
| Danh tính, DI và cache | Cookie handler không tự kiểm tra mật khẩu. Fixture policy không phải hệ thống login. DI, IoC và DIP khác nhau. Scoped là mỗi scope; singleton không nên giữ scoped dependency. IMemoryCache không tự single-flight; TTL không bảo đảm freshness. |
| Thread và async | Concurrency khác parallelism; Task không đồng nghĩa thread; await task đã xong có thể tiếp tục đồng bộ. Method trả Task có thể không có async. ConfigureAwait(false) không ép chuyển thread. WhenAll giữ thứ tự kết quả theo input; WhenAny không tự hủy các task còn lại. |
| Đồng bộ hóa | Mutex khác semaphore 1 slot về ownership và khả năng liên tiến trình. AutoResetEvent không đếm mọi lần Set. lock trên object dùng Monitor; System.Threading.Lock trong C# 13/.NET 9 có cơ chế chuyên biệt. Concurrent collection không làm chuỗi thao tác thành transaction. |
| TCP và HTTP | TCP là byte stream, cần framing và timeout; một lần Read không bằng một message. Content-Length tính byte. Fixture parser không phải HTTP server production. Tách writer chỉ giúp giới hạn bộ nhớ khi implementation thực sự streaming. |
| HttpClient và reflection | Quản lý lifetime của HttpClient bằng client sống lâu hoặc factory; xử lý status, cancellation và JSON. Fixture handler không gọi Internet. Reflection cần cân nhắc trimming/Native AOT; attribute là metadata, không tự chạy. |

Các file tài liệu Microsoft đã được đọc để đối chiếu gồm C# tour/types/methods/classes/interfaces/generics/lambda/events/exceptions, File I/O, async/lock/threading, MVC/routing/binding/validation/DI/cache/cookie authorization, EF context/migrations/relationships/loading và HttpClient guidelines. Liên kết nguồn cho từng chủ đề nằm trong `catalog.json` và mục nguồn của bài.

## Phạm vi kiểm chứng mã

Các chương trình Console, framework services, EF SQLite và ASP.NET Core chạy bằng .NET SDK 10. Ví dụ web được gửi request HTTP thật trên loopback; ví dụ Razor có file view đi kèm; ví dụ EF dùng SQLite in-memory. SQL dùng SQLite với schema mẫu. Những đoạn giống nhau được chạy một lần sau khi kiểm tra expected output trùng khớp.

Bài migrations hướng dẫn quy trình nhưng không áp dụng migration lên database production. Parser HTTP nhận fixture đã có đủ chuỗi, không kiểm thử toàn bộ giao thức hoặc mở ra Internet. HttpClient dùng handler giả lập. Test SQLite không chứng minh mọi truy vấn chạy giống SQL Server. Không chạy mã học viên trong browser hoặc trên server.

Kết quả chạy thực tế: [validation.md](validation.md), [latest-results.json](../verification/latest-results.json).
