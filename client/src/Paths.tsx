import { Link, useParams } from "react-router-dom";
import { ArrowRight, BookOpen, Download } from "lucide-react";
import { byId, curriculum, pathModules } from "./theory";
import { CodeBlock } from "./Content";
export function Paths() {
  const { mode } = useParams();
  const interview = mode === "interview";
  const modules = interview
    ? [
        pathModules[1],
        pathModules[4],
        pathModules[5],
        pathModules[2],
        pathModules[3],
        pathModules[0],
      ]
    : pathModules;
  return (
    <div className="paths page-pad">
      <div className="eyebrow">CÙNG KHO BÀI, HAI CÁCH ĐỌC</div>
      <h1>{interview ? "Ôn phỏng vấn junior và middle" : "Học nền tảng"}</h1>
      <p className="page-intro">
        {interview
          ? "Bắt đầu từ tình huống và câu hỏi, đối chiếu lời giải rồi quay lại cơ chế còn thiếu."
          : "Đọc khái niệm và ví dụ trước; dùng liên kết tiền đề để lấp kiến thức trước khi chuyển nhóm."}{" "}
        Các mức là mục tiêu học tập đề xuất, không là chuẩn tuyển dụng mọi công
        ty hoặc bảo đảm đỗ.
      </p>
      <div className="path-switch">
        <Link className={!interview ? "chosen" : ""} to="/paths/foundation">
          Học nền tảng
        </Link>
        <Link className={interview ? "chosen" : ""} to="/paths/interview">
          Ôn phỏng vấn
        </Link>
      </div>
      <section className="prereq-map">
        <h2>Tiền đề cho nhánh web</h2>
        <div>
          {["http-request-line", "dependency-injection", "async-await"].map(
            (id) => (
              <Link
                key={id}
                to={`/read/${id}?order=${interview ? "interview" : "foundation"}`}
              >
                {byId.get(id)!.title}
                <ArrowRight size={14} />
              </Link>
            ),
          )}
        </div>
        <p>
          HTTP giúp đọc request/response; DI giải thích service và lifetime;
          async giải thích thời gian chờ I/O trong request.
        </p>
      </section>
      {modules.map((m, i) => (
        <section className="path-module" key={m.id}>
          <div className="topic-heading">
            <span className="topic-symbol">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2>{m.title}</h2>
              <p>Đầu ra quan sát được: {m.outcome}</p>
            </div>
          </div>
          <ol>
            {m.ids.map((id) => {
              const l = byId.get(id)!;
              return (
                <li key={id}>
                  <Link
                    to={`/read/${id}?order=${interview ? "interview" : "foundation"}${interview ? "#questions" : ""}`}
                  >
                    <span>
                      {l.title}
                      <small>
                        {l.origin === "extension"
                          ? "Mở rộng để ôn phỏng vấn"
                          : `Phần ${l.sourceParts.join(", ")} bài giảng`}
                      </small>
                    </span>
                    <ArrowRight size={16} />
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
export function Guide() {
  return (
    <div className="guide page-pad">
      <div className="eyebrow">MỞ MỘT VÍ DỤ TỪ ĐẦU</div>
      <h1>Tạo project, chạy code và debug</h1>
      <p className="page-intro">
        Bối cảnh kiểm chứng: SDK {curriculum.review.sdk},{" "}
        {curriculum.review.framework}, {curriculum.review.language},
        runtime/ASP.NET Core/EF {curriculum.review.runtime}. Không dùng preview.
        SDK phát triển và runtime triển khai có vai trò khác nhau.
      </p>
      <section>
        <h2>1. Mỗi mẫu một thư mục trống</h2>
        <p>
          Không ghép nhiều Program.cs có top-level statements vào cùng project.
          Copy đúng các file của mẫu, gồm .csproj và using cần thiết. Top-level
          statements đứng trước khai báo type trong cùng file. Nếu chưa có SDK,
          cài .NET SDK phù hợp trước; runtime riêng không đủ build.
        </p>
        <CodeBlock
          label="Terminal · PowerShell hoặc Bash"
          language="shell"
          code={
            "dotnet --info\ndotnet --list-sdks\ndotnet --list-runtimes\nmkdir Demo\ncd Demo\n# Tạo các file hiển thị trong ví dụ vào đây\ndotnet restore Demo.csproj\ndotnet run --project Demo.csproj"
          }
        />
        <p>
          Lệnh portable trên chạy trong PowerShell hoặc Bash. SQL nhập trong
          sqlite3 shell nếu mẫu ghi sqlite3; request HTTP gửi bằng client HTTP.
          Nút copy chỉ lấy mã trong khối, không lấy nhãn/tên file.
        </p>
      </section>
      <section>
        <h2>2. File cấu hình và output sinh ra</h2>
        <CodeBlock
          label="Demo.csproj · console tối thiểu"
          language="markup"
          code={
            '<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup>\n    <OutputType>Exe</OutputType>\n    <TargetFramework>net10.0</TargetFramework>\n    <LangVersion>14.0</LangVersion>\n    <ImplicitUsings>enable</ImplicitUsings>\n    <Nullable>enable</Nullable>\n  </PropertyGroup>\n</Project>'
          }
        />
        <p>
          bin chứa output build; obj chứa dữ liệu build/restore trung gian.
          Không sửa tay hoặc commit chúng. ProjectReference trỏ source project,
          PackageReference trỏ gói/version. Mẫu nhiều project có lệnh --project
          riêng. File ConsoleEncoding.cs đặt UTF-8 và culture invariant để đối
          chiếu output; mẫu culture/timezone chỉ định điều kiện riêng.
        </p>
      </section>
      <section>
        <h2>3. Debug và đọc lỗi</h2>
        <p>
          F9 đặt breakpoint, F5 chạy debug, F10 Step Over, F11 Step Into.
          Locals/Watch xem state; Call Stack xem đường gọi; Exception Settings
          có thể dừng tại lúc exception được ném. Breakpoint rỗng cần kiểm tra
          đúng process, binary/symbol PDB, source và Debug/Release. Lỗi CSxxxx
          xuất hiện khi build; exception xảy ra khi run; lỗi logic cần đối chiếu
          contract/test.
        </p>
      </section>
      <section>
        <h2>4. Các lab dùng chung</h2>
        <p>
          WebLab/WebLab.Tests kiểm tra MVC/API/security; DataLab dùng SQLite
          temp; MigrationLab tiến hóa schema qua hai migration. Lab chỉ bind
          loopback và dùng dữ liệu giả. Identity có keys/store tạm cho local,
          không phải cấu hình key production. Mỗi ví dụ trên bài nói rõ phần nào
          được triển khai và trạng thái kiểm chứng.
        </p>
        <a
          className="button-primary"
          href={`${import.meta.env.BASE_URL}examples/dotnet-labs.zip`}
          download
        >
          <Download size={16} />
          Tải bộ project và README
        </a>
        <CodeBlock
          label="Terminal · từ thư mục repository hoặc zip đã giải nén"
          language="shell"
          code={
            "dotnet test examples/WebLab.Tests/WebLab.Tests.csproj\ndotnet run --project examples/DataLab/DataLab.csproj\ndotnet run --project examples/WebLab/WebLab.csproj -- --urls http://127.0.0.1:5090"
          }
        />
      </section>
      <section>
        <h2>5. Cách ước lượng thời gian đọc</h2>
        <p>
          Mã nguồn cộng số đơn vị văn bản tách bằng khoảng trắng chia 230 với số
          dòng code/lệnh không rỗng chia 18, rồi làm tròn lên. Tính cả giải
          thích và đáp án một lần. Đây là ước lượng để chọn thời gian đọc, không
          đo năng lực hoặc bảo đảm số phút giống mọi người.
        </p>
        <Link className="guide-link" to="/paths/foundation">
          <BookOpen size={16} />
          Mở lộ trình học nền tảng
        </Link>
      </section>
    </div>
  );
}
