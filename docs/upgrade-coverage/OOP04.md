# OOP04 — Đa hình chuyên sâu: dispatch, hợp đồng và mở rộng hành vi

- URL cuối cùng: [Đa hình chuyên sâu: dispatch, hợp đồng và mở rộng hành vi](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep). URL production là địa chỉ đích, không tự là xác nhận deployment của nhánh này.
- File nguồn: [client/src/data/articles/oop-polymorphism-deep.json](../../client/src/data/articles/oop-polymorphism-deep.json).
- Thao tác: Bài mới: Mở rộng để ôn phỏng vấn. Không gán phần bài giảng.
- Nguồn: mở rộng phỏng vấn; sourceParts = [].
- Tiền đề có liên kết: [oop-inheritance-deep](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep), [oop-interfaces](https://client-ifz4.vercel.app/#/read/oop-interfaces), [csharp-types](https://client-ifz4.vercel.app/#/read/csharp-types).
- Đọc liên quan: [oop-encapsulation-deep](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep), [oop-abstraction-deep](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep), [oop-polymorphism](https://client-ifz4.vercel.app/#/read/oop-polymorphism), [csharp-generics](https://client-ifz4.vercel.app/#/read/csharp-generics), [decorator-pattern](https://client-ifz4.vercel.app/#/read/decorator-pattern), [dependency-injection](https://client-ifz4.vercel.app/#/read/dependency-injection).

## Vị trí yêu cầu chung và nội dung giữ lại

- [Bản chất: hiểu đúng tính chất này](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#identity): Đa hình (polymorphism) cho phép một đoạn code thao tác theo cùng một hợp đồng với nhiều implementation khác nhau. Consumer gọi policy.Price(points), còn policy có thể là giá thường, giá VIP hoặc khuyến mãi. Consumer không cần tự dò tên class để biết công thức nào đang chạy nếu hợp đồng đã đủ rõ. Đây là cơ chế/ý tưởng OOP mà C# hỗ trợ bằng interface và virtual member, không phải chỉ là việc đặt nhiều method trùng tên..
- [Vấn đề nào khiến ta cần nó?](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#problem): Khi consumer tự chứa mọi nhánh xử lý của từng loại, thêm một cách tính/gửi/render có thể buộc sửa lặp nhiều consumer. Các nhánh dễ lệch nhau về validation, lỗi hoặc kết quả. Một hợp đồng chung cho phép đặt phần khác biệt vào implementation thích hợp và giữ consumer tập trung vào quy trình của nó..
- [Lợi ích khi thiết kế đúng](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#benefits): Consumer có thể nhận implementation qua tham số/constructor hoặc một collection hợp đồng chung. Thêm strategy thường chỉ cần thêm implementation và cập nhật nơi đăng ký/lắp ghép; không cần đổi vòng xử lý consumer nếu contract giữ nguyên. Việc chọn implementation vẫn phải nằm ở đâu đó, không tự biến mất..
- [Khi nào không nên dùng hoặc dễ lạm dụng?](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#limits): Không tạo một class/interface riêng cho mỗi nhánh nhỏ ổn định nếu nó làm đường gọi khó hiểu hơn. Với một phép tính ngắn, delegate hoặc switch rõ ràng có thể phù hợp. Nếu cần thêm nhiều operation mới trên một tập loại vốn cố định, trade-off giữa object polymorphism và pattern matching cũng có thể thay đổi..
- [Cơ chế hoạt động trong C# và .NET](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#mechanism): Có hai bước cần tách. Trước hết compiler dùng kiểu tĩnh, tên member, đối số và quy tắc overload resolution để chọn một member/chữ ký phù hợp. Sau đó, nếu lời gọi đó là virtual hoặc interface instance dispatch thích hợp, implementation được chọn theo object runtime và các quy tắc override/interface. Runtime không quay lại chọn một overload khác chỉ vì object đối số có type cụ thể hơn..
- [Từ vựng cần hiểu trước khi đọc code](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#concepts): Kiểu tĩnh và kiểu runtime, Overload, Override, Method hiding bằng new, Boxing và copy struct, Contract test.
- [Nó kết hợp với ba tính chất còn lại thế nào?](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#integration): Trừu tượng đưa ra contract; đa hình cho phép consumer gọi các implementation qua contract đó. Kế thừa class là một cách cung cấp subtype/virtual override; interface cho phép các class không cùng một base nghiệp vụ vẫn đáp ứng nhu cầu chung. Đóng gói giúp mỗi implementation giữ state riêng một cách hợp lệ..
- [Đối chiếu thiết kế trước và sau](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#case-study): Trước: nhiều consumer kiểm tra policy is VipPrice hoặc policy is CampaignPrice rồi tự áp công thức. Sau: mỗi policy thực hiện Price, consumer dùng chung IPricePolicy và kiểm tra contract chung. Thêm policy mới thay danh sách lắp ghép, còn consumer không phải biết tên type..
- [Đặt file ở đâu và bắt đầu thế nào?](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#structure): Mỗi khối ví dụ hiển thị Demo.csproj, Program.cs và ConsoleEncoding.cs khi cần cố định output. Đặt chúng vào cùng một thư mục trống, cài SDK nêu ở đầu bài, rồi chạy đúng lệnh terminal. Nút tải bộ project ở trang OOP bao gồm các thư mục ví dụ độc lập; project cố ý lỗi có nhãn riêng và không được đưa vào solution cần build thành công..
- [Debug: quan sát điều gì để hiểu vì sao?](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#debug): Dừng trước lời gọi, xem kiểu khai báo trong source và GetType của receiver trong Watch. Sau đó xác định overload đã được compiler chọn bằng chữ ký/Quick Info trước khi Step Into. Với new/hiding, thử cùng object qua hai kiểu reference để quan sát khác biệt..
- [Tài liệu C# chính thức và cộng đồng](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#resources): Nội dung dùng các cơ chế có trong C# 14/.NET 10. Tài liệu Microsoft Learn có thể cập nhật thêm cú pháp phiên bản mới; các file project của bài cố định LangVersion để tránh vô tình dùng tính năng preview..

## [Junior: hiểu cơ chế và viết đúng](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#junior)

Khi gặp một lời gọi, ghi ra ba điều: biến được khai báo type gì, object được new từ type gì, và member đang là thường hay virtual/interface. Làm bước này trước khi đoán output giúp tránh giải thích mọi thứ bằng “vì object là Derived”.

Override cần một member base có thể override và chữ ký/điều kiện override phù hợp. Method non-virtual không thể trở thành override chỉ bằng thêm từ khóa ở lớp con. Compiler báo lỗi CS0506 trong mẫu riêng để ngăn việc đó.

Overload không phải override. Trong mẫu Mark, receiver Base chỉ nhìn thấy Mark(object), rồi override tương ứng chạy ở Derived. Receiver Derived có thêm Mark(string), nên compiler có thể chọn chữ ký khác ngay từ đầu. Hai câu chuyện khác nhau xảy ra trong cùng tên method.

Không cần cast qua lại để dùng mọi concrete method. Nếu consumer liên tục cast, hỏi liệu hợp đồng đang thiếu capability cần thiết, consumer đang làm quá nhiều trách nhiệm, hay mô hình này vốn phù hợp với pattern matching hơn.

Bảng **Overload, override và new: đọc bằng câu hỏi cụ thể**: Cơ chế / Dấu hiệu / Điều quyết định trong ví dụ. Overload — Cùng tên, khác danh sách tham số — Kiểu tĩnh và quy tắc chọn overload ở compile time; Override — Base virtual/abstract; derived override — Sau khi đã chọn member: object runtime quyết định override; new / hiding — Member mới giấu member base — Kiểu tĩnh của receiver trong lời gọi thông thường; Interface implementation — Concrete type thực hiện hợp đồng — Lời gọi qua interface tới implementation tương ứng.

## [Middle: thiết kế hợp đồng và xử lý đánh đổi](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#middle)

Mức middle phải gắn dispatch với khả năng thay thế. Nếu IPricePolicy hứa nhận điểm không âm và trả kết quả 0..input, một policy trả số âm hoặc tự đòi input tối thiểu 100 đang phá cam kết đó. Không “sửa test” bằng cách né input cho từng concrete type rồi nói tất cả implementation tương đương.

Open/closed không có nghĩa “thêm feature không được sửa một dòng ở bất kỳ đâu”. Consumer có thể ổn định trong khi composition root/registry thêm implementation mới. Nếu nhiều consumer vẫn phải phân nhánh theo concrete type, hãy tìm trục biến đổi thực tế và contract thiếu, thay vì tiếp tục thêm subclass theo tên nghiệp vụ.

Hợp đồng đa hình bao gồm semantics lỗi, side effect, cancellation và lifetime khi có liên quan. Ví dụ một sender trả thành công trước khi thực sự hoàn tất khác với sender đồng bộ chờ hoàn tất; chữ ký giống nhau chưa đủ. Decorator retry còn cần biết thao tác có thể lặp an toàn hay không.

Boxing là bài toán về value representation, không phải lời gọi interface nào cũng boxing. Với struct mutable, truyền qua interface có thể làm thay đổi xảy ra trong box chứ không trong biến gốc. Generic constraint với tham số ref có thể làm method làm việc trực tiếp trên biến struct trong mẫu; đừng suy từ một mẫu này thành cam kết không allocation cho mọi generic operation.

Có thể có devirtualization/inlining khi JIT biết target, nhưng đó là chi tiết tối ưu theo runtime và call site. API thiết kế theo contract trước; nếu là hot path, đo allocation, throughput và latency trên môi trường đích, giữ cùng semantics và dữ liệu khi so lựa chọn. Không dùng tên “đa hình tĩnh” làm bằng chứng một phương án chắc chắn nhanh hơn.

Bảng **Chọn cách biểu đạt phần thay đổi**: Nhu cầu / Một lựa chọn phù hợp / Câu hỏi review. Một hành vi nhỏ được truyền vào — Hàm / delegate — Có cần cả nhóm state và nhiều thao tác không?; Nhiều implementation cùng một vai trò — Interface / strategy — Contract có đủ rõ để thay thế mà consumer không cast?; Một họ chung state/thuật toán có extension point — Abstract base + override — Protected/virtual đã được thiết kế ổn định chưa?; Tập loại đóng, xử lý theo từng trường hợp — Pattern matching / switch — Thêm loại hay thêm operation là trục thay đổi chủ yếu?.

## Ví dụ và kiểm chứng

- [Junior → middle · Tách overload, override và hiding trong cùng chương trình](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#examples): **chạy + so stdout**. Kỳ vọng: derived.draw; base.name; derived.name; derived.object; derived.string; overload.object; overload.string. Giải thích: Draw là virtual nên qua Base vẫn chạy override Derived. Name bị giấu bằng new nên lời gọi thường phụ thuộc kiểu receiver. value.Mark đã chọn chữ ký object ở compile time; runtime chọn override của chữ ký đó. Printer.Show(text) dùng overload object dù text đang chứa string. Cast concrete không tạo object mới.
  Bằng chứng: [upgrade-example-results.json](../upgrade-example-results.json), khóa `oop-polymorphism-deep/dispatch-matrix`.
- [Middle · Consumer ổn định và contract checks cho ba strategy](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#examples): **chạy + so stdout**. Kỳ vọng: RegularPrice:100; VipPrice:90; CampaignPrice:80; contract checks:15. Giải thích: Ba implementation cùng nhận điểm nguyên không âm, không sửa state bên ngoài và trả giá trong 0..input; phần giảm được chia nguyên theo chính sách mẫu. Bốn input biên và một ca âm tạo 15 checks. Consumer không phân nhánh theo concrete type; nơi tạo array vẫn phải biết những policy cần đăng ký. Đây là contract của mẫu, không là bộ quy tắc định giá tiền tệ production.
  Bằng chứng: [upgrade-example-results.json](../upgrade-example-results.json), khóa `oop-polymorphism-deep/strategy-contract`.
- [Middle · Dispatch đúng nhưng state thay đổi ở bản copy nào?](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#examples): **chạy + so stdout**. Kỳ vọng: original:0;boxed:1;copy:2; after ref:1;boxed:1. Giải thích: Gán original sang biến interface boxes một bản sao. Increment qua interface sửa box; unbox vào copy cho một giá trị struct khác. Hàm generic nhận ref original sửa chính biến gốc ở bước cuối. Đây không là ví dụ interface “không chạy đúng”; cần xác định đúng nơi giữ state và semantics copy.
  Bằng chứng: [upgrade-example-results.json](../upgrade-example-results.json), khóa `oop-polymorphism-deep/interface-boxing`.
- [Lỗi riêng · Không override một method thường](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#examples): **lỗi compiler dự kiến**. Kỳ vọng: CS0506. Giải thích: Member base không virtual/abstract và không có override hợp lệ cho trường hợp này. Cần xem lại contract có chủ đích mở rộng hay không; không tự đổi sang new rồi kỳ vọng lời gọi qua Base chạy như override.
  Bằng chứng: [upgrade-example-results.json](../upgrade-example-results.json), khóa `oop-polymorphism-deep/override-nonvirtual`.

## [Hỏi đáp đối chiếu](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep#questions)

- junior: Base x = new Derived(); x.Draw() luôn chạy Draw của Derived không? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.
- junior: Biến object giữ một string có làm overload Show(string) tự được chọn ở runtime không? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.
- junior: new và override có tạo object mới trong khai báo method không? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.
- middle: Thêm strategy mới mà phải sửa registry có mâu thuẫn với việc consumer được mở rộng ổn định không? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.
- middle: Vì sao Increment qua ICounter không đổi Counter original trong ví dụ? Đáp án, giải thích, hiểu nhầm và hỏi tiếp có trong disclosure của cùng câu.

## Nguồn đã kiểm tra

- [Đa hình trong C#: virtual, override và interface](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/polymorphism).
- [Phiên bản hóa method: override khác new](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/versioning-with-the-override-and-new-keywords).
- [Method và overload trong C#](https://learn.microsoft.com/en-us/dotnet/csharp/methods).
- [Boxing và unboxing value type qua object/interface](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing).
- [Thiết kế CoreCLR: virtual stub dispatch](https://github.com/dotnet/runtime/blob/main/docs/design/coreclr/botr/virtual-stub-dispatch.md).
