# OOP03 — Kế thừa chuyên sâu: is-a, LSP và lựa chọn composition

- URL cuối cùng: [Kế thừa chuyên sâu: is-a, LSP và lựa chọn composition](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep). URL production là địa chỉ đích, không tự là xác nhận deployment của nhánh này.
- File nguồn: [client/src/data/articles/oop-inheritance-deep.json](../../client/src/data/articles/oop-inheritance-deep.json).
- Thao tác: Bài mới: Mở rộng để ôn phỏng vấn. Không gán phần bài giảng.
- Nguồn: mở rộng phỏng vấn; sourceParts = [].
- Tiền đề có liên kết: [oop-abstraction-deep](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep), [oop-classes](https://client-ifz4.vercel.app/#/read/oop-classes).
- Đọc liên quan: [oop-encapsulation-deep](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep), [oop-polymorphism-deep](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep), [oop-polymorphism](https://client-ifz4.vercel.app/#/read/oop-polymorphism), [decorator-pattern](https://client-ifz4.vercel.app/#/read/decorator-pattern), [design-testing-patterns](https://client-ifz4.vercel.app/#/read/design-testing-patterns).

## Vị trí yêu cầu chung và nội dung giữ lại

- [Bản chất: hiểu đúng tính chất này](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#identity): Kế thừa (inheritance) cho phép một class được định nghĩa dựa trên một base class. Lớp con là một kiểu mới trong quan hệ subtype; instance của lớp con có thể được dùng ở nhiều vị trí nhận kiểu lớp cha. Trong C#, một class có một base class trực tiếp và có thể thực hiện nhiều interface. Đây là cơ chế ngôn ngữ phục vụ mô hình OOP, không phải một công nghệ cài thêm..
- [Vấn đề nào khiến ta cần nó?](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#problem): Khi có một họ đối tượng chung hợp đồng và một phần triển khai ổn định, copy toàn bộ logic cho từng loại làm quy tắc chung dễ lệch nhau. Một base class được thiết kế cẩn thận có thể giữ phần chung và mở đúng phần cần khác biệt..
- [Lợi ích khi thiết kế đúng](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#benefits): Một contract chung cho phép caller làm việc với nhiều kiểu liên quan mà không tách từng nhánh concrete. Base class có thể giữ một quy trình kiểm tra chung và chỉ cho override các bước đã được dự kiến. Tác dụng này rõ nhất khi quan hệ subtype thật sự ổn định..
- [Khi nào không nên dùng hoặc dễ lạm dụng?](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#limits): Không kế thừa chỉ để dùng một hàm tiện ích hoặc lấy một dependency. Ví dụ EmailService “có một” logger không có nghĩa EmailService “là một” logger. Truyền logger vào constructor diễn đạt đúng quan hệ và giữ được quyền thay riêng dependency..
- [Cơ chế hoạt động trong C# và .NET](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#mechanism): Object lớp con chứa phần state cần cho cả base và derived theo mô hình runtime. Member private của base không được truy cập trực tiếp từ source của derived, nhưng các method base vẫn có thể sử dụng state private đó. “Không truy cập được” không đồng nghĩa phần dữ liệu lớp cha không tồn tại trong instance..
- [Từ vựng cần hiểu trước khi đọc code](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#concepts): Base / derived và is-a, Precondition và postcondition, LSP — nguyên lý thay thế Liskov, Composition — có một, Fragile base class.
- [Nó kết hợp với ba tính chất còn lại thế nào?](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#integration): Đóng gói bảo vệ state; kế thừa cho lớp con tham gia cùng object nên ranh giới protected cần được kiểm soát. Trừu tượng xác định hợp đồng base hoặc interface. Đa hình thực hiện lời gọi qua hợp đồng chung để chọn hành vi phù hợp. Kế thừa class và đa hình không phải cùng một khái niệm: interface cũng cho phép nhiều implementation độc lập được gọi thống nhất..
- [Đối chiếu thiết kế trước và sau](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#case-study): Tình huống thông báo: bắt đầu có EmailNotification và SmsNotification. Sau đó mỗi loại cần Plain/Html và Retry/NoRetry. Nếu dùng subclass cho tất cả tổ hợp, số lớp tăng theo các trục biến đổi. Tách sender, formatter và retry policy thành các thành phần có hợp đồng phù hợp cho phép thay từng trục mà consumer không trở thành một cây lớp con..
- [Đặt file ở đâu và bắt đầu thế nào?](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#structure): Mỗi khối ví dụ hiển thị Demo.csproj, Program.cs và ConsoleEncoding.cs khi cần cố định output. Đặt chúng vào cùng một thư mục trống, cài SDK nêu ở đầu bài, rồi chạy đúng lệnh terminal. Nút tải bộ project ở trang OOP bao gồm các thư mục ví dụ độc lập; project cố ý lỗi có nhãn riêng và không được đưa vào solution cần build thành công..
- [Debug: quan sát điều gì để hiểu vì sao?](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#debug): Với lỗi khởi tạo, đặt breakpoint ở từng constructor và theo Call Stack, không chỉ nhìn thứ tự file. Trong mẫu BadReport, xem count ngay lần Show đầu tiên để tách “method override đã chạy” khỏi “constructor derived đã hoàn tất”..
- [Tài liệu C# chính thức và cộng đồng](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#resources): Nội dung dùng các cơ chế có trong C# 14/.NET 10. Tài liệu Microsoft Learn có thể cập nhật thêm cú pháp phiên bản mới; các file project của bài cố định LangVersion để tránh vô tình dùng tính năng preview..

## [Junior: hiểu cơ chế và viết đúng](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#junior)

Khi đọc class Derived : Base, tìm constructor của Derived và lời gọi base trước. Xem base yêu cầu input nào; việc derived không khai báo lại toàn bộ field không có nghĩa object thiếu phần state base. Constructor base vẫn chịu trách nhiệm khởi tạo phần nó sở hữu.

Phân biệt public, protected, internal và private theo miền truy cập. protected không có nghĩa “mọi code trong project”; internal nói về assembly. protected internal dùng điều kiện hoặc; private protected dùng quan hệ dẫn xuất trong cùng assembly. Với người mới, hiểu đúng public/private/protected trước rồi tra các mức phối hợp khi cần.

Muốn thay hành vi qua reference base, phải có extension point virtual/abstract và khai báo override đúng. new giấu member tạo lựa chọn khác theo kiểu tham chiếu tĩnh trong các lời gọi thông thường; nó không phải cách sửa một override không hợp lệ.

Constructor là nơi tạo trạng thái hợp lệ, không nên là nơi chạy callback tùy lớp con khi lớp con chưa sẵn sàng. Nếu cần một bước khởi động sau khi tạo, hãy thiết kế vòng đời rõ và tránh để object bị dùng trước bước đó, thay vì chuyển rủi ro sang một lời gọi Initialize ngầm định.

Bảng **Đọc các từ khóa theo tác dụng**: Cú pháp / Tác dụng / Không nên hiểu thành. : Base — Tạo quan hệ kế thừa class — Chỉ mượn vài method rồi không cần giữ contract; base(args) — Gọi constructor base thích hợp — Constructor base được kế thừa để caller new trực tiếp; protected — Mở truy cập cho type và lớp dẫn xuất theo quy tắc C# — Mở state cho cả ứng dụng sửa; sealed — Ngăn kế thừa tiếp class hoặc override tiếp member tùy vị trí — Tự làm class bất biến hoặc thread-safe.

## [Middle: thiết kế hợp đồng và xử lý đánh đổi](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#middle)

Dùng LSP như một công cụ review contract, không như khẩu hiệu về ví dụ hình học. Hãy viết điều mà consumer đang tin: đầu vào nào được nhận, kết quả nào được trả, state nào còn nguyên, loại lỗi nào được phép. Derived không được yêu cầu điều kiện chặt hơn hoặc làm yếu cam kết của base trong cùng phạm vi contract.

Trong ví dụ Rectangle mutable, hợp đồng ta đặt là sửa Height không đổi Width. Square buộc hai chiều bằng nhau nên không giữ được cam kết đó. Vấn đề không phủ nhận quan hệ hình học; nó cho thấy API mutable đã chọn không phù hợp với quan hệ subtype này. Một hợp đồng chỉ đọc Area cho cả hai kiểu có thể tránh đúng xung đột đó.

Một invariant của lớp con có thể chặt hơn nhưng không được xung đột với các hành vi hợp lệ mà base cho phép caller yêu cầu. Đừng chỉ thêm guard trong override để “giữ invariant” nếu guard đó từ chối những input base vốn hứa chấp nhận. Khi hai contract không dung hòa, tách type/capability thường rõ hơn.

Protected mutable state và lời gọi self qua virtual hook làm lớp con phụ thuộc mạnh vào thứ tự/chi tiết lớp cha. Base thay nội bộ có thể vẫn giữ contract public nhưng phá lớp con đang dựa vào một contract protected chưa được xác định. Thiết kế base class để người khác kế thừa là công việc duy trì API lâu dài.

Composition đặc biệt hữu ích khi có nhiều trục thay đổi độc lập: định dạng nội dung, kênh gửi và retry policy. Tạo subclass cho mọi tổ hợp khiến cây phình to; giữ các dependency theo interface cho phép lắp ghép từng phần. Composition cũng có chi phí phối hợp/lifetime; không tự tốt hơn nếu chỉ làm vòng gọi khó theo dấu.

Bảng **Kiểm tra khả năng thay thế bằng hợp đồng**: Khía cạnh / Lớp con phải giữ gì? / Dấu hiệu cần xem lại. Điều kiện đầu vào — Không buộc caller đáp ứng điều kiện mạnh hơn contract base — Base nhận mọi số dương, derived chỉ nhận số > 100; Cam kết đầu ra — Không làm yếu những bảo đảm base đã hứa — Base hứa dữ liệu đầy đủ, derived trả thiếu mà không báo; State / invariant — Không phá cam kết trạng thái sau thao tác — SetHeight âm thầm sửa Width trái contract mẫu; Lỗi / capability — Giữ những hành vi và lỗi contract cho phép — Read-only subtype luôn từ chối Write vốn được base hứa hỗ trợ.

## Ví dụ và kiểm chứng

- [Junior · Constructor và state của base trong object derived](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#examples): **chạy + so stdout**. Kỳ vọng: base:An; derived:ready; label:An/320. Giải thích: Mẫu theo dấu thân hai constructor: base trước derived. Label dùng phần state Name do base sở hữu; Points là override của concrete class. Không có gọi virtual từ constructor, không có field initializer để suy diễn thứ tự rộng hơn mẫu.
  Bằng chứng: [upgrade-example-results.json](../upgrade-example-results.json), khóa `oop-inheritance-deep/constructor-chain`.
- [Middle · Code compile nhưng phá contract thay thế, rồi đổi mô hình](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#examples): **chạy + so stdout**. Kỳ vọng: rectangle:20; square:16; read-only area:20; read-only area:16. Giải thích: Counterexample cố ý: SetHeight của Square làm Width thành 4 nên consumer nhận 16 thay 20 mà contract Rectangle của mẫu hứa. Sau đó IShape chỉ hứa đọc Area, không hứa sửa hai chiều độc lập. Input mẫu là kích thước dương nhỏ; không tuyên bố các record là mô hình hình học production có validation đầy đủ.
  Bằng chứng: [upgrade-example-results.json](../upgrade-example-results.json), khóa `oop-inheritance-deep/lsp-rectangle`.
- [Middle · Bẫy gọi virtual khi constructor derived chưa chạy](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#examples): **chạy + so stdout**. Kỳ vọng: count:0; count:42. Giải thích: Lời gọi từ constructor base đã dispatch tới BadReport.Show nhưng thân constructor BadReport chưa gán count = 42. Sau khi new hoàn tất, gọi lại mới thấy 42. Đây là counterexample có thể chạy, không là cách khởi tạo được khuyến nghị; sửa bằng thiết kế không gọi member overridable trong constructor.
  Bằng chứng: [upgrade-example-results.json](../upgrade-example-results.json), khóa `oop-inheritance-deep/virtual-constructor`.
- [Lỗi riêng · Lớp sealed không cho kế thừa tiếp](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#examples): **lỗi compiler dự kiến**. Kỳ vọng: CS0509. Giải thích: Compiler từ chối quan hệ kế thừa từ class sealed. Nếu chỉ cần dùng dịch vụ, giữ một ClosedService làm dependency thay vì gỡ sealed theo phản xạ. Thay đổi một hợp đồng kế thừa cần quyết định thiết kế rõ.
  Bằng chứng: [upgrade-example-results.json](../upgrade-example-results.json), khóa `oop-inheritance-deep/sealed-parent`.

## [Hỏi đáp đối chiếu](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep#questions)

- junior: Private member của base không truy cập được từ derived có nghĩa state đó không có trong object không? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.
- junior: Constructor lớp con có tự kế thừa mọi constructor lớp cha không? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.
- junior: sealed có làm object bất biến hoặc thread-safe không? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.
- middle: Vì sao Square trong ví dụ không thay thế được Rectangle mutable dù quan hệ hình học đúng? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.
- middle: Gọi virtual trong constructor base nguy hiểm ở đâu? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.

## Nguồn đã kiểm tra

- [C# inheritance: constructor, member và base class](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance).
- [Constructor và lời gọi base trong C#](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/constructors).
- [sealed class và sealed override](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/sealed).
- [CA2214: tránh gọi method overridable trong constructor](https://learn.microsoft.com/en-us/dotnet/fundamentals/code-analysis/quality-rules/ca2214).
- [Nguyên lý kiến trúc: contract, SOLID và dependency](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles).
