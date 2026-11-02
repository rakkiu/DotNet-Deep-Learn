# OOP chuyên sâu — phạm vi và kiểm chứng

Ngày rà soát: 2026-11-02 (Asia/Saigon). Thêm bốn bài OOP01–OOP04 và trang `/#/oop`. Tổng thư viện: 63 bài, 140 ví dụ, 315 hỏi đáp; giữ nguyên mapping 41 phần và 47 bài gốc. Không có chấm điểm/nộp bài.

Mỗi bài OOP có 15 mục: bản chất, vấn đề, lợi ích, giới hạn, cơ chế, từ vựng, kết hợp các tính chất, junior, middle, ví dụ, đối chiếu thiết kế, tổ chức file, debug, hỏi đáp và nguồn. Bốn bài có tổng 16 ví dụ, 20 câu hỏi (3 junior + 2 middle mỗi bài), kèm đáp án/giải thích/hiểu nhầm/hỏi tiếp.

| Mã | Bài / URL đích | Junior | Middle |
|---|---|---|---|
| OOP01 | [Đóng gói chuyên sâu: bảo vệ trạng thái và quyền thay đổi](https://client-ifz4.vercel.app/#/read/oop-encapsulation-deep) | Invariant, private/property/constructor, state sau lỗi | Ownership, view/snapshot, exception consistency, concurrency boundary |
| OOP02 | [Trừu tượng chuyên sâu: mô hình, hợp đồng và ranh giới phụ thuộc](https://client-ifz4.vercel.app/#/read/oop-abstraction-deep) | Mô hình và hợp đồng; interface/abstract class; constructor syntax | Coupling, adapter, capability, contract lỗi và test boundary |
| OOP03 | [Kế thừa chuyên sâu: is-a, LSP và lựa chọn composition](https://client-ifz4.vercel.app/#/read/oop-inheritance-deep) | Constructor, base/derived, protected, virtual, sealed | LSP, mutable Rectangle/Square, fragile base, composition |
| OOP04 | [Đa hình chuyên sâu: dispatch, hợp đồng và mở rộng hành vi](https://client-ifz4.vercel.app/#/read/oop-polymorphism-deep) | Kiểu tĩnh/runtime, overload/override/new | Contract strategy, boxing struct/interface, generic ref, JIT và trade-off |

## Kiểm tra đã thực hiện

- SDK 10.0.403, runtime 10.0.14, net10.0/C#14; không thêm package ngoài cho ví dụ OOP.
- 12/12 project console build rồi chạy và so stdout; 4/4 project cố ý lỗi xác nhận diagnostic CS0272, CS0144, CS0509, CS0506. Không tính project lỗi là chương trình chạy thành công. [Kết quả nguyên bản](oop-example-results.json).
- `npm test`: 9/9 (6 kiểm tra nền + 3 kiểm tra OOP). Tiền đề không tạo chu kỳ và xuất hiện trước bài OOP trên lộ trình nền tảng; cả hai lộ trình đủ 63 bài.
- `npm run build`: TypeScript/Vite thành công. Prebuild tạo ZIP 82 file gồm 16 project OOP sinh trực tiếp từ JSON bài; không commit một bản code thứ hai. Có cảnh báo chunk curriculum khoảng 910 kB trước gzip (~208 kB gzip), vì tìm kiếm nạp toàn bộ văn bản/code.
- Playwright local: 26/26, desktop 1440×1000 và mobile; riêng OOP kiểm tra 390×844. Bao gồm hub junior/middle, URL/reload, anchor/focus, bài trước/sau theo OOP, fallback order không hợp lệ, hỏi đáp, sidebar và search.
- ZIP được tải qua HTTP, giải nén entries trong test và so từng file code với đúng JSON nguồn. Bốn sample compiler error có README riêng, không thêm vào Labs.slnx.
- Axe WCAG A/AA + 2.1 AA không phát hiện vi phạm trên hub, hai mức đọc và reader, sáng/tối, cả hai viewport; không tràn ngang document. Bảng/code có vùng cuộn riêng.
- Audit nguồn: 145 URL duy nhất có HTTP 200 ở báo cáo nguồn; kết quả cũ hợp lệ được cache, nguồn mới được request thật. URL truy cập được không tự chứng minh toàn bộ diễn giải.

Các kết quả .NET/HTTP/SQL của 124 mẫu cũ giữ theo hash, không chạy lại toàn bộ lab EF/Identity vì scope chỉ thêm OOP và liên kết. [Ma trận toàn bộ](upgrade-coverage.md), [đối chiếu OOP01](upgrade-coverage/OOP01.md), [OOP02](upgrade-coverage/OOP02.md), [OOP03](upgrade-coverage/OOP03.md), [OOP04](upgrade-coverage/OOP04.md).

## Kết quả OOP quan sát được

### oop-abstraction-deep/abstract-template

Trạng thái: ran. SHA-256 source/expected: `cc94566e9d6bb92f347cd5f8fc1b97037d0dbbe3a88c9ed914e471bff0086722`.

```text
people:An;Binh
people:AN;BINH
```

### oop-abstraction-deep/checkout-contract

Trạng thái: ran. SHA-256 source/expected: `b933c5a016345bf7748a3e04d42163251fefc688b19dc5cc99b83d9a5c3f1805`.

```text
Accepted:paid=True
Declined:paid=False
```

### oop-abstraction-deep/instantiate-abstract

Trạng thái: expected-diagnostic. SHA-256 source/expected: `c37f080a4a2257b7cb2091e0b44cf3e5810958872aaba7a3f872c29da9e955c3`.

```text
$REPO\.tools\upgrade-examples\oop-abstraction-deep\instantiate-abstract\Program.cs(1,14): error CS0144: Cannot create an instance of the abstract type or interface 'Report' [$REPO\.tools\upgrade-examples\oop-abstraction-deep\instantiate-abstract\Demo.csproj]

Build FAILED.

$REPO\.tools\upgrade-examples\oop-abstraction-deep\instantiate-abstract\Program.cs(1,14): error CS0144: Cannot create an instance of the abstract type or interface 'Report' [$REPO\.tools\upgrade-examples\oop-abstraction-deep\instantiate-abstract\Demo.csproj]
    0 Warning(s)
    1 Error(s)

Time Elapsed 00:00:01.98
```

### oop-abstraction-deep/notifier-contract

Trạng thái: ran. SHA-256 source/expected: `e61a9c9b6b2b2019aac7539555d99a951a3658e0974abee1afca83456e1e7302`.

```text
mail:An:Welcome
sms:Binh:Welcome
```

### oop-encapsulation-deep/order-state

Trạng thái: ran. SHA-256 source/expected: `641f4a3d02c0eb6f76f109a5eecae1663d301ae52d92a101c1779f5f965f771c`.

```text
empty:False/Draft
confirm:True/Confirmed/60
locked
final:Confirmed/60
```

### oop-encapsulation-deep/private-setter

Trạng thái: expected-diagnostic. SHA-256 source/expected: `bbf5fb31b2c43657d47bfa2ae9a4e946de9742ec016216033f2457bc3f62ae1b`.

```text
$REPO\.tools\upgrade-examples\oop-encapsulation-deep\private-setter\Program.cs(2,1): error CS0272: The property or indexer 'Wallet.Balance' cannot be used in this context because the set accessor is inaccessible [$REPO\.tools\upgrade-examples\oop-encapsulation-deep\private-setter\Demo.csproj]

Build FAILED.

$REPO\.tools\upgrade-examples\oop-encapsulation-deep\private-setter\Program.cs(2,1): error CS0272: The property or indexer 'Wallet.Balance' cannot be used in this context because the set accessor is inaccessible [$REPO\.tools\upgrade-examples\oop-encapsulation-deep\private-setter\Demo.csproj]
    0 Warning(s)
    1 Error(s)

Time Elapsed 00:00:01.99
```

### oop-encapsulation-deep/readonly-ownership

Trạng thái: ran. SHA-256 source/expected: `9f19c9187717229ffec0a79b5ea9cc48a07e7e8909f2060c46a0f6ccd5cf4c63`.

```text
leaked:0
snapshot:1/caller change
owner:2/A
```

### oop-encapsulation-deep/wallet-invariants

Trạng thái: ran. SHA-256 source/expected: `a79baf5b4e1f1fe27c3a784ef08a92ca46a9e944d40c7f6fd205f4f74fff3ec3`.

```text
balance:70
insufficient
invalid amount
invalid initial
overflow
unchanged:70/2147483647
```

### oop-inheritance-deep/constructor-chain

Trạng thái: ran. SHA-256 source/expected: `ccc69788f33e902e00d8e49d3a31ba07c528b9cb4a6e5c82c92f329d710b8145`.

```text
base:An
derived:ready
label:An/320
```

### oop-inheritance-deep/lsp-rectangle

Trạng thái: ran. SHA-256 source/expected: `26311fb6a2409a7234720adc09566b8098c5f3dbdb3fd88b1ee98117f01fc832`.

```text
rectangle:20
square:16
read-only area:20
read-only area:16
```

### oop-inheritance-deep/sealed-parent

Trạng thái: expected-diagnostic. SHA-256 source/expected: `4556b8a15efb5aa35907d82b80a6190c62a4b0c36e8f39491506d57025d6d604`.

```text
$REPO\.tools\upgrade-examples\oop-inheritance-deep\sealed-parent\Program.cs(3,22): error CS0509: 'ChildService': cannot derive from sealed type 'ClosedService' [$REPO\.tools\upgrade-examples\oop-inheritance-deep\sealed-parent\Demo.csproj]

Build FAILED.

$REPO\.tools\upgrade-examples\oop-inheritance-deep\sealed-parent\Program.cs(3,22): error CS0509: 'ChildService': cannot derive from sealed type 'ClosedService' [$REPO\.tools\upgrade-examples\oop-inheritance-deep\sealed-parent\Demo.csproj]
    0 Warning(s)
    1 Error(s)

Time Elapsed 00:00:01.99
```

### oop-inheritance-deep/virtual-constructor

Trạng thái: ran. SHA-256 source/expected: `bb62fe0b863e21a07616e99ffe8c38e9febbfadc0a448a8e377f13c03e1cb7fc`.

```text
count:0
count:42
```

### oop-polymorphism-deep/dispatch-matrix

Trạng thái: ran. SHA-256 source/expected: `fc773644c9f4283c75b61fc9247ce23cf7460ed5b27eb7b348b438efa65630da`.

```text
derived.draw
base.name
derived.name
derived.object
derived.string
overload.object
overload.string
```

### oop-polymorphism-deep/interface-boxing

Trạng thái: ran. SHA-256 source/expected: `0593d311d1cb0caf3f7675dbb25dfb378df83d882a143c5fe4c2ddb8b55e7282`.

```text
original:0;boxed:1;copy:2
after ref:1;boxed:1
```

### oop-polymorphism-deep/override-nonvirtual

Trạng thái: expected-diagnostic. SHA-256 source/expected: `707038879f32372db5c854e4050436d66b98c8233e748160b7b3160e4448daaf`.

```text
$REPO\.tools\upgrade-examples\oop-polymorphism-deep\override-nonvirtual\Program.cs(3,45): error CS0506: 'Derived.Draw()': cannot override inherited member 'Base.Draw()' because it is not marked virtual, abstract, or override [$REPO\.tools\upgrade-examples\oop-polymorphism-deep\override-nonvirtual\Demo.csproj]

Build FAILED.

$REPO\.tools\upgrade-examples\oop-polymorphism-deep\override-nonvirtual\Program.cs(3,45): error CS0506: 'Derived.Draw()': cannot override inherited member 'Base.Draw()' because it is not marked virtual, abstract, or override [$REPO\.tools\upgrade-examples\oop-polymorphism-deep\override-nonvirtual\Demo.csproj]
    0 Warning(s)
    1 Error(s)

Time Elapsed 00:00:02.24
```

### oop-polymorphism-deep/strategy-contract

Trạng thái: ran. SHA-256 source/expected: `7f05171771bff39dcfa3d5f48b42971ca4d4619e0df0ede5a8f374b30992fa50`.

```text
RegularPrice:100
VipPrice:90
CampaignPrice:80
contract checks:15
```

## Giới hạn diễn giải

Các ví dụ chạy local, tuần tự trừ khi code nói rõ khác. Private không thay phân quyền, không tự tạo thread safety/transaction; snapshot collection không tự deep clone; fake gateway chỉ kiểm tra consumer, không kiểm chứng dịch vụ thanh toán thật. Ví dụ LSP và virtual constructor cố ý có thiết kế xấu để đối chiếu, được giải thích trong từng mẫu. Không đưa benchmark suy đoán hay cam kết đỗ phỏng vấn.

Địa chỉ production là URL đích. Trạng thái GitHub/Vercel và kiểm tra sau triển khai được ghi trong báo cáo bàn giao của chat khi có kết quả thật; local preview không được coi là production deployment.
