# OOP01 — Đóng gói chuyên sâu: bảo vệ trạng thái và quyền thay đổi

- URL cuối cùng: [Đóng gói chuyên sâu: bảo vệ trạng thái và quyền thay đổi](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep). URL production là địa chỉ đích, không tự là xác nhận deployment của nhánh này.
- File nguồn: [client/src/data/articles/oop-encapsulation-deep.json](../../client/src/data/articles/oop-encapsulation-deep.json).
- Thao tác: Bài mới: Mở rộng để ôn phỏng vấn. Không gán phần bài giảng.
- Nguồn: mở rộng phỏng vấn; sourceParts = [].
- Tiền đề có liên kết: [oop-classes](https://client-ifz4.vercel.app/#/read/oop-classes), [csharp-types](https://client-ifz4.vercel.app/#/read/csharp-types).
- Đọc liên quan: [oop-abstraction-deep](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep), [oop-inheritance-deep](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep), [oop-polymorphism-deep](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep), [csharp-value-modeling](https://client-ifz4.vercel.app/#/read/csharp-value-modeling), [thread-lock](https://client-ifz4.vercel.app/#/read/thread-lock).

## Vị trí yêu cầu chung và nội dung giữ lại

- [Bản chất: hiểu đúng tính chất này](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#identity): Đóng gói (encapsulation) gom trạng thái và những thao tác có quyền thay đổi trạng thái vào một ranh giới có chủ sở hữu. Trạng thái là dữ liệu object đang giữ; hành vi là các thao tác mà object cho phép. Điểm quan trọng là caller được làm gì để object vẫn có ý nghĩa, chứ không chỉ dữ liệu nằm trong một class. Đây là nguyên lý thiết kế OOP, không phải framework hoặc gói NuGet..
- [Vấn đề nào khiến ta cần nó?](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#problem): Khi nhiều màn hình, service và job cùng sửa field, quy tắc dễ bị sao chép ở nhiều nơi. Màn hình đã kiểm tra số dư nhưng job import quên; chỗ kiểm tra trước phép trừ lại khác chỗ thực hiện phép trừ. Lỗi không chỉ là code dài, mà là không biết ai có trách nhiệm giữ dữ liệu hợp lệ..
- [Lợi ích khi thiết kế đúng](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#benefits): Caller diễn đạt ý định bằng Withdraw(30), không phải tự đọc rồi gán Balance -= 30. Bên trong có thể đổi cách lưu, thêm một kiểm tra hoặc tính toán khác mà vẫn giữ hợp đồng công khai. Đây là giảm phụ thuộc vào representation: cách dữ liệu được biểu diễn trong bộ nhớ..
- [Khi nào không nên dùng hoặc dễ lạm dụng?](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#limits): DTO truyền dữ liệu đơn giản không nhất thiết cần hàng chục method nghiệp vụ. Một phép tính thuần có thể chỉ cần một hàm. Đóng gói tốt không đồng nghĩa phải tạo getter/setter cho mọi field hoặc tạo class cho mọi giá trị..
- [Cơ chế hoạt động trong C# và .NET](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#mechanism): Compiler kiểm tra quyền truy cập khi biên dịch lời gọi. Một property thực chất có accessor đọc/ghi; nó có thể tính toán, kiểm tra điều kiện hoặc chỉ bọc field. Private set chặn caller gán property từ ngoài type, nhưng setter nội bộ vẫn có thể gán dữ liệu sai nếu code cho phép..
- [Từ vựng cần hiểu trước khi đọc code](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#concepts): State và invariant, Ownership, Representation exposure, Read-only view và snapshot.
- [Nó kết hợp với ba tính chất còn lại thế nào?](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#integration): Trừu tượng giúp caller nghĩ theo “rút điểm” thay vì phép gán field; đóng gói bảo vệ cách thao tác đó được thực hiện. Kế thừa mở thêm người có thể tham gia thay đổi state, nên protected mutable field có thể làm invariant khó giữ. Đa hình cho nhiều implementation cùng hợp đồng, nhưng mỗi implementation vẫn phải giữ quy tắc riêng và quy tắc chung..
- [Đối chiếu thiết kế trước và sau](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#case-study): Thiết kế trước: controller nhận amount, tự đọc Balance rồi gán Balance mới. Mỗi caller phải nhớ cùng một bộ điều kiện; đổi quy tắc kéo theo tìm kiếm nhiều nơi. Thiết kế sau: controller chỉ chuyển input đã parse sang Wallet.Withdraw; Wallet quyết định theo state của nó. Controller vẫn chịu trách nhiệm ánh xạ kết quả ra HTTP phù hợp..
- [Đặt file ở đâu và bắt đầu thế nào?](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#structure): Mỗi khối ví dụ hiển thị Demo.csproj, Program.cs và ConsoleEncoding.cs khi cần cố định output. Đặt chúng vào cùng một thư mục trống, cài SDK nêu ở đầu bài, rồi chạy đúng lệnh terminal. Nút tải bộ project ở trang OOP bao gồm các thư mục ví dụ độc lập; project cố ý lỗi có nhãn riêng và không được đưa vào solution cần build thành công..
- [Debug: quan sát điều gì để hiểu vì sao?](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#debug): Đặt breakpoint ở constructor, Deposit, Withdraw và trước dòng commit state; dùng Watch so Balance trước và sau exception. Với collection, xem cả kiểu khai báo lẫn GetType của object được trả về để nhận ra wrapper và List gốc..
- [Tài liệu C# chính thức và cộng đồng](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#resources): Nội dung dùng các cơ chế có trong C# 14/.NET 10. Tài liệu Microsoft Learn có thể cập nhật thêm cú pháp phiên bản mới; các file project của bài cố định LangVersion để tránh vô tình dùng tính năng preview..

## [Junior: hiểu cơ chế và viết đúng](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#junior)

Bắt đầu bằng câu hỏi “những trạng thái nào tuyệt đối không được phép xuất hiện?”. Sau đó liệt kê cách tạo và cách sửa object. Với Wallet, số âm ở constructor, amount <= 0 và rút quá số dư đều phải có kết quả rõ. Việc UI đã có kiểm tra không đủ vì Wallet có thể được gọi bởi code khác.

Không coi getter/setter là mục tiêu. Balance { get; set; } cho bên ngoài quyền gán trực tiếp. Balance { get; private set; } thu hẹp quyền gán nhưng chưa mô tả việc rút, chuyển hoặc nạp. Method có tên nghiệp vụ giúp gom các kiểm tra liên quan vào cùng thao tác.

readonly field chỉ hạn chế việc gán lại field ở các vị trí C# cho phép. Nếu field chứa List thì Add vẫn sửa object List. Tương tự, get-only property không tự biến giá trị trả về thành bất biến. Khi thấy chữ “read-only”, luôn hỏi: chỉ đọc qua biến nào, và phần tử bên trong có mutable không?

Khi thao tác không thành công, bài này chọn giữ nguyên state và báo lỗi bằng exception hoặc kết quả false theo từng hợp đồng. Đừng trừ số dư trước rồi mới kiểm tra quá hạn mức. Tính kết quả mới trước khi gán giúp tránh để lỗi overflow làm state mất hợp lệ trong mẫu tuần tự.

Bảng **Quyền truy cập khác với quy tắc nghiệp vụ**: Khai báo / thao tác / Caller được làm gì? / Điều chưa được bảo đảm. public int Balance; — Đọc và gán trực tiếp — Không có nơi bắt buộc giữ Balance >= 0; Balance { get; private set; } — Đọc công khai, gán hạn chế — Code nội bộ vẫn phải validate; readonly List<T> field — Không tùy ý gán field sang list khác — List và phần tử có thể vẫn mutable; Withdraw(amount) — Gửi yêu cầu qua hành vi — Phải viết đúng guard và hợp đồng khi thất bại.

## [Middle: thiết kế hợp đồng và xử lý đánh đổi](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#middle)

Mức middle cần nhìn rộng hơn một setter: invariant nằm trong một object hay cần nhiều object cùng nhất quán? Order có thể bảo vệ các dòng hàng khi sửa tuần tự, nhưng giữ “tồn kho không âm” giữa hai request thường cần database/transaction/concurrency policy. Không giấu vấn đề phân tán vào một method rồi gọi đó là đóng gói xong.

Ownership quyết định có cần defensive copy. Nếu caller chỉ cần dữ liệu để hiển thị, snapshot gồm value/immutable fields có thể rõ hơn trả entity graph. Nếu cần một live view có chủ đích, phải nói rõ dữ liệu sẽ phản ánh thay đổi và ai được ghi. Snapshot cũng có chi phí cấp phát; lựa chọn theo hợp đồng và tải thật, không mặc định copy sâu mọi thứ.

Tính nhất quán khi có exception là một phần thiết kế. Nếu Add vừa thay list vừa tăng tổng, hãy chuẩn bị/kiểm tra các giá trị có thể thất bại trước khi commit state cần nhất quán. Nếu bước tiếp theo là gửi email hoặc gọi HTTP ngoài, bộ nhớ rollback không tự hoàn tác tác dụng phụ đó. Cần phân biệt phạm vi giao dịch với phạm vi class.

Kế thừa làm ranh giới thay đổi phức tạp hơn: lớp con có thể gọi protected member trong những thứ tự lớp cha không dự kiến. Dùng protected field để “cho lớp con sửa cho tiện” thường tạo thêm đường phá invariant. Ưu tiên method được kiểm soát hoặc composition khi không thực sự cần extension point.

Test theo hành vi và biên: số 0, số âm, giới hạn int, thao tác bị từ chối và chuỗi chuyển trạng thái. Với concurrent access phải thêm test chiến lược phối hợp tương ứng; kết quả chạy tuần tự của ba mẫu bên dưới không chứng minh chúng thread-safe.

## Ví dụ và kiểm chứng

- [Junior · Ví điểm giữ invariant kể cả khi thao tác lỗi](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#examples): **chạy + so stdout**. Kỳ vọng: balance:70; insufficient; invalid amount; invalid initial; overflow; unchanged:70/2147483647. Giải thích: 100 + 20 - 50 = 70. Các lời gọi bị từ chối không làm đổi state. checked tính trước khi gán nên full vẫn int.MaxValue sau overflow. Đơn vị là điểm nguyên, không phải mô hình tiền tệ đa đơn vị; mẫu tuần tự không có bảo đảm concurrency.
  Bằng chứng: [upgrade-example-results.json](../upgrade-example-results.json), khóa `oop-encapsulation-deep/wallet-invariants`.
- [Middle · IReadOnlyList không phải cam kết không có ai sửa](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#examples): **chạy + so stdout**. Kỳ vọng: leaked:0; snapshot:1/caller change; owner:2/A. Giải thích: Kiểu runtime của Items vẫn là List nên cast làm lộ mutation. Snapshot là array mới; thay phần tử của array do caller giữ không thay list gốc. Product ở đây chỉ gồm string bất biến; nếu record có List mutable thì ToArray/record vẫn không thành deep clone.
  Bằng chứng: [upgrade-example-results.json](../upgrade-example-results.json), khóa `oop-encapsulation-deep/readonly-ownership`.
- [Middle · Object kiểm soát cả chuyển trạng thái](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#examples): **chạy + so stdout**. Kỳ vọng: empty:False/Draft; confirm:True/Confirmed/60; locked; final:Confirmed/60. Giải thích: Xác nhận order rỗng trả false và giữ Draft. Sau khi có hai đơn vị giá 30 điểm, Confirmed không còn cho thêm. Hai phép tính checked được chuẩn bị trước khi gán state; đây là bảo vệ state trong bộ nhớ tuần tự, không thay transaction hoặc khóa liên request.
  Bằng chứng: [upgrade-example-results.json](../upgrade-example-results.json), khóa `oop-encapsulation-deep/order-state`.
- [Lỗi riêng · Caller cố gán property có private setter](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#examples): **lỗi compiler dự kiến**. Kỳ vọng: CS0272. Giải thích: Compiler từ chối vì set accessor không truy cập được ở vị trí gọi. Điều này chỉ chứng minh giới hạn truy cập; constructor/method của Wallet vẫn phải giữ quy tắc số dư. Không chép mẫu lỗi vào ba project cần chạy thành công.
  Bằng chứng: [upgrade-example-results.json](../upgrade-example-results.json), khóa `oop-encapsulation-deep/private-setter`.

## [Hỏi đáp đối chiếu](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep#questions)

- junior: Có private field và getter/setter là đã đóng gói tốt chưa? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.
- junior: readonly List có cấm Add hoặc Clear không? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.
- junior: Rút quá số dư thì state của Wallet trong mẫu thay đổi thế nào? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.
- middle: ToArray trên list các entity mutable có tạo snapshot deep immutable không? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.
- middle: Object giữ invariant tuần tự có đủ chống hai request tranh chấp không? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.

## Nguồn đã kiểm tra

- [Các nguyên lý OOP trong C#](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/).
- [Phạm vi truy cập: private, protected, internal và public](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/access-modifiers).
- [Property và accessor trong C#](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/properties).
- [readonly hạn chế gán field, không deep-freeze object](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/readonly).
- [Thiết kế collection và hợp đồng trả dữ liệu](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/guidelines-for-collections).
