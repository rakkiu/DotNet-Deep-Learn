# OOP02 — Trừu tượng chuyên sâu: mô hình, hợp đồng và ranh giới phụ thuộc

- URL cuối cùng: [Trừu tượng chuyên sâu: mô hình, hợp đồng và ranh giới phụ thuộc](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep). URL production là địa chỉ đích, không tự là xác nhận deployment của nhánh này.
- File nguồn: [client/src/data/articles/oop-abstraction-deep.json](../../client/src/data/articles/oop-abstraction-deep.json).
- Thao tác: Bài mới: Mở rộng để ôn phỏng vấn. Không gán phần bài giảng.
- Nguồn: mở rộng phỏng vấn; sourceParts = [].
- Tiền đề có liên kết: [oop-encapsulation-deep](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep), [oop-interfaces](https://client-ifz4.vercel.app/#/read/oop-interfaces).
- Đọc liên quan: [oop-inheritance-deep](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep), [oop-polymorphism-deep](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep), [dependency-injection](https://client-ifz4.vercel.app/#/read/dependency-injection), [factory-pattern](https://client-ifz4.vercel.app/#/read/factory-pattern), [design-testing-patterns](https://client-ifz4.vercel.app/#/read/design-testing-patterns).

## Vị trí yêu cầu chung và nội dung giữ lại

- [Bản chất: hiểu đúng tính chất này](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#identity): Trừu tượng (abstraction) là xây một mô hình chỉ bộc lộ những gì cần thiết cho một mục đích sử dụng. Người đặt hàng quan tâm “yêu cầu thanh toán này được chấp nhận hay từ chối”, không cần biết tên bảng, HTTP header hoặc SDK của cổng thanh toán. Chi tiết vẫn tồn tại, nhưng không phải caller nào cũng phải biết để làm công việc của mình. Đây là nguyên lý mô hình hóa và thiết kế API, không phải một thư viện..
- [Vấn đề nào khiến ta cần nó?](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#problem): Nếu CheckoutService trực tiếp đọc format riêng của một SDK, tự tạo request HTTP và diễn giải mã lỗi vendor, thay vendor buộc sửa cả logic checkout. Test quy tắc đơn hàng cũng bị phụ thuộc vào mạng hoặc tài khoản thật. Vấn đề nằm ở hướng phụ thuộc và mức chi tiết bị kéo vào caller..
- [Lợi ích khi thiết kế đúng](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#benefits): Caller có từ vựng gần nhiệm vụ: Charge, Send hoặc Read, thay vì tên hàm nội bộ của vendor. Cách thực hiện có thể thay ở nơi lắp ghép dependency mà không đổi rule của caller, nếu hợp đồng hành vi vẫn được giữ. Đây là giảm coupling, tức giảm những điều một thành phần phải biết về thành phần khác..
- [Khi nào không nên dùng hoặc dễ lạm dụng?](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#limits): Interface không làm một thiết kế tự linh hoạt. Nếu IPaymentGateway trả VendorResponse và nhận VendorRequest, caller vẫn phụ thuộc sâu vào vendor qua các type. Nếu mọi thay đổi nhỏ đều kéo theo sửa interface và toàn bộ implementation thì có thể ranh giới đang được đặt sai..
- [Cơ chế hoạt động trong C# và .NET](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#mechanism): Ở C#, interface khai báo một tập member mà implementation phải đáp ứng theo quy tắc ngôn ngữ. Biến kiểu interface có thể tham chiếu một object concrete tương thích; lời gọi được thực hiện bằng implementation thích hợp. Bạn không khởi tạo được chính interface bằng new. Trong các ví dụ, nơi tạo new chọn implementation rồi truyền vào constructor của consumer..
- [Từ vựng cần hiểu trước khi đọc code](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#concepts): Abstraction và contract, Interface, Abstract class, Coupling và adapter, Capability.
- [Nó kết hợp với ba tính chất còn lại thế nào?](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#integration): Trừu tượng quyết định cái gì được nhìn thấy và được hứa; đóng gói giữ state/implementation phía sau ranh giới đó. Một Wallet có Withdraw là một abstraction ngay cả khi không có interface; private state và guard giúp hiện thực hợp đồng đó..
- [Đối chiếu thiết kế trước và sau](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#case-study): Trước: Checkout gọi VendorSdk.Charge và tự hiểu VendorErrorCode ở nhiều chỗ. Sau: Checkout dùng IPaymentGateway và ChargeResult phù hợp nhu cầu; adapter là nơi dịch giữa hai hợp đồng. Nếu đổi vendor mà phải sửa mọi rule checkout, cần kiểm tra abstraction có đang làm lộ type hoặc semantics của vendor không..
- [Đặt file ở đâu và bắt đầu thế nào?](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#structure): Mỗi khối ví dụ hiển thị Demo.csproj, Program.cs và ConsoleEncoding.cs khi cần cố định output. Đặt chúng vào cùng một thư mục trống, cài SDK nêu ở đầu bài, rồi chạy đúng lệnh terminal. Nút tải bộ project ở trang OOP bao gồm các thư mục ví dụ độc lập; project cố ý lỗi có nhãn riêng và không được đưa vào solution cần build thành công..
- [Debug: quan sát điều gì để hiểu vì sao?](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#debug): Tìm điểm tạo instance trước: consumer đang được truyền ConsoleMail, ConsoleSms hay adapter nào? Dùng Watch xem type runtime của interface reference rồi Step Into lời gọi. Không kết luận code không chạy chỉ vì breakpoint đang đặt ở một implementation khác..
- [Tài liệu C# chính thức và cộng đồng](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#resources): Nội dung dùng các cơ chế có trong C# 14/.NET 10. Tài liệu Microsoft Learn có thể cập nhật thêm cú pháp phiên bản mới; các file project của bài cố định LangVersion để tránh vô tình dùng tính năng preview..

## [Junior: hiểu cơ chế và viết đúng](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#junior)

Hãy giải thích abstraction từ góc nhìn caller: để gửi thông báo, caller cần người nhận và nội dung, chứ không cần biết địa chỉ server giả hoặc câu lệnh in bên trong. Sau đó đọc interface để xác định member bắt buộc, đọc class concrete để thấy cách thực hiện, rồi tìm nơi consumer được cung cấp implementation.

Interface thường nói “có thể làm việc gì”; abstract class có thể nói thêm “cùng nền tảng triển khai và state nào”. Một class có thể implement nhiều interface nhưng chỉ có một base class trực tiếp. Không lấy số lượng method làm tiêu chí duy nhất: quan hệ hợp đồng và state quan trọng hơn.

Đừng lẫn abstract method với virtual method. Abstract member đòi một implementation phù hợp trước khi type trở thành concrete; virtual member đã có implementation có thể được override. Method thường trong abstract class vẫn gọi được thông qua một instance concrete.

Khi đọc lỗi CS0144 ở ví dụ riêng, hiểu compiler cấm new lớp abstract chứ không cấm khai báo biến mang kiểu abstract. Biến Report report = new TextReport() hợp lệ nếu TextReport là concrete và có quan hệ kế thừa phù hợp.

Một số mẫu dùng class WelcomeService(INotifier notifier): đây là cú pháp primary constructor có từ C# 12. Tham số nằm trong phạm vi khai báo class để code bên trong dùng, không tự trở thành public property như positional record. Với các dependency trong mẫu, bạn cũng có thể viết constructor thường và lưu dependency vào field riêng; ý tưởng truyền implementation từ bên ngoài không thay đổi. Đây là cú pháp cụ thể của C#, không phải một tính chất OOP mới.

Bảng **Ba lựa chọn không nên dùng lẫn theo thói quen**: Lựa chọn / Phù hợp khi / Điều cần cân nhắc. Hàm / delegate — Một thao tác có hợp đồng nhỏ, không cần một nhóm state/hành vi — Đặt tên và diễn đạt lỗi rõ; không bắt có class; Interface — Caller cần capability/hợp đồng, nhiều loại có thể thực hiện — Không đưa chi tiết vendor qua type đầu vào/đầu ra; Abstract class — Một họ type thực sự chung state/luồng và extension point — Ràng buộc kế thừa; phải thiết kế protected/virtual cẩn thận.

Bảng **Trừu tượng và đóng gói trả lời hai câu hỏi**: Góc nhìn / Trừu tượng / Đóng gói. Câu hỏi chính — Caller cần biết điều gì? — Ai có quyền thay đổi và quy tắc được giữ ra sao?; Ví dụ — Withdraw(amount) thay cách tự trừ field — Balance private và guard trước khi cập nhật; Thất bại điển hình — Hợp đồng mơ hồ/lộ vendor type — State bị sửa từ đường ngoài hoặc qua collection bị lộ.

## [Middle: thiết kế hợp đồng và xử lý đánh đổi](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#middle)

Thiết kế hợp đồng từ use case của consumer giúp tránh interface phản chiếu nguyên SDK hoặc bảng dữ liệu. Ví dụ checkout cần kết quả charge; không nhất thiết cần mọi phương thức admin của cổng thanh toán. Đây là hướng suy nghĩ của dependency inversion: rule cấp cao phụ thuộc một mô hình ổn định phù hợp, còn chi tiết được tích hợp qua ranh giới đó.

Một interface cùng chữ ký vẫn có thể có implementation không thay thế được: bên này trả Declined mà không thay state, bên kia đã trừ rồi mới trả Declined. Vì vậy cần mô tả cả semantics, như đơn vị, điều kiện hợp lệ, lỗi có thể xảy ra và caller phải làm gì sau lỗi. Nếu là thao tác có tác dụng phụ/retry, còn cần định nghĩa idempotency chứ không tự thêm retry trong consumer.

Chia capability giúp tránh “method tồn tại nhưng luôn throw NotSupportedException”. Reader chỉ cần IReadDocument thì không phải biết storage ghi được hay không. Tuy nhiên tách quá nhỏ cũng có thể làm một nghiệp vụ liên quan bị rải thành nhiều dependency khó phối hợp. Đánh giá bằng nhu cầu caller và tính kết dính của thao tác.

Abstract base có ích cho một luồng xử lý thực sự ổn định: validate rồi render. Nhưng càng nhiều virtual hook và protected state thì càng nhiều tổ hợp lớp con có thể tạo ra. Nếu thuật toán thay đổi theo nhiều trục độc lập, composition của các policy thường dễ thay từng phần hơn một cây lớp con tăng theo mọi tổ hợp.

Test fake xác nhận consumer phản ứng đúng với contract; contract test chung xác nhận các implementation giữ những cam kết chung; integration test xác nhận adapter với thư viện/provider thật. Ba bằng chứng khác nhau. Không để test fake thành lý do tin rằng mọi kết nối ngoài đã được kiểm chứng.

## Ví dụ và kiểm chứng

- [Junior · Cùng nhu cầu gửi, hai cách thực hiện](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#examples): **chạy + so stdout**. Kỳ vọng: mail:An:Welcome; sms:Binh:Welcome. Giải thích: WelcomeService chỉ dùng Send, không kiểm tra kiểu concrete hay tự cấu hình mail/SMS. Cả hai implementation chỉ in console để tránh gọi dịch vụ ngoài. Đây chưa là adapter mail production, chưa có retry, bảo mật hoặc delivery guarantee.
  Bằng chứng: [upgrade-example-results.json](../upgrade-example-results.json), khóa `oop-abstraction-deep/notifier-contract`.
- [Middle · Kết quả nghiệp vụ không bị lẫn với chi tiết gateway](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#examples): **chạy + so stdout**. Kỳ vọng: Accepted:paid=True; Declined:paid=False. Giải thích: Hợp đồng demo sử dụng điểm nguyên, input dương và hai kết quả xác định; không có tiền thật hay HTTP. Fake cho phép kiểm tra nhánh bị từ chối. Hệ thống thật phải bổ sung semantics lỗi, timeout, idempotency và đơn vị trước khi coi interface này là đủ.
  Bằng chứng: [upgrade-example-results.json](../upgrade-example-results.json), khóa `oop-abstraction-deep/checkout-contract`.
- [Middle · Abstract class chia sẻ luồng, interface chia sẻ capability](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#examples): **chạy + so stdout**. Kỳ vọng: people:An;Binh; people:AN;BINH. Giải thích: IReport mô tả capability Render. Report giữ title và luồng kiểm tra/ghép chuỗi; Format là phần thay đổi. Render không virtual nên subclass không thay toàn bộ luồng bằng override. Đây là một extension point có mục đích, không phải quy tắc mọi interface đều cần abstract base.
  Bằng chứng: [upgrade-example-results.json](../upgrade-example-results.json), khóa `oop-abstraction-deep/abstract-template`.
- [Lỗi riêng · Không khởi tạo trực tiếp lớp abstract](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#examples): **lỗi compiler dự kiến**. Kỳ vọng: CS0144. Giải thích: Muốn tạo instance phải có class concrete triển khai Render hoặc chọn một kiểu concrete đã có. Có thể khai báo biến Report trỏ tới instance lớp con; không cần xóa abstract chỉ để làm lỗi compiler biến mất.
  Bằng chứng: [upgrade-example-results.json](../upgrade-example-results.json), khóa `oop-abstraction-deep/instantiate-abstract`.

## [Hỏi đáp đối chiếu](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep#questions)

- junior: Có dùng abstract class thì mới có trừu tượng không? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.
- junior: Interface và abstract class khác nhau ở state dùng chung ra sao? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.
- junior: Biến mang kiểu abstract class có được trỏ tới object lớp con không? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.
- middle: IPaymentGateway vẫn trả VendorResponse thì đã cô lập vendor tốt chưa? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.
- middle: Fake gateway test pass có chứng minh tích hợp gateway thật hoạt động không? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.

## Nguồn đã kiểm tra

- [Interface: hợp đồng, default implementation và giới hạn](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/interface).
- [Abstract class và abstract member trong C#](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/abstract).
- [Các nguyên lý thiết kế ứng dụng: phụ thuộc và ranh giới](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles).
- [.NET dependency injection](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection).
- [Primary constructor: tham số của class và khác với property](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/tutorials/primary-constructors).
