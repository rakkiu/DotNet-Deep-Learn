import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BookOpen, Download } from "lucide-react";
import { byId, examplesOf, oopPillars, questionsOf } from "./theory";

export function OopHub() {
  const [params, setParams] = useSearchParams();
  const level = params.get("level") === "middle" ? "middle" : "junior";
  const totalExamples = oopPillars.reduce(
    (n, p) => n + examplesOf(byId.get(p.id)!).length,
    0,
  );
  return (
    <div className="oop-hub page-pad">
      <header className="oop-hero">
        <div className="eyebrow">
          <span />
          CHUYÊN ĐỀ OOP · C# / .NET
        </div>
        <h1>
          Bốn tính chất.
          <br />
          <em>Hiểu sâu từng ranh giới.</em>
        </h1>
        <p className="page-intro">
          Từ cách một object giữ dữ liệu đúng đến cách nhiều implementation giữ
          cùng một lời hứa. Mỗi tính chất có giải thích từ gốc, cơ chế C#, phần
          junior, phần middle và ví dụ để theo dấu vì sao code chạy như vậy.
        </p>
        <div className="oop-hero-facts">
          <span>
            <strong>04</strong> bài chuyên sâu
          </span>
          <span>
            <strong>{totalExamples}</strong> ví dụ có lời giải
          </span>
          <span>
            <strong>
              {oopPillars.reduce(
                (n, p) => n + questionsOf(byId.get(p.id)!).length,
                0,
              )}
            </strong>{" "}
            câu hỏi đối chiếu
          </span>
        </div>
      </header>
      <section className="oop-start" aria-labelledby="oop-level-heading">
        <div>
          <div className="eyebrow">CHỌN ĐỘ SÂU ĐỂ BẮT ĐẦU</div>
          <h2 id="oop-level-heading">Bạn muốn hiểu tới đâu?</h2>
        </div>
        <div className="oop-levels" role="group" aria-label="Mức độ đọc OOP">
          {(["junior", "middle"] as const).map((value) => (
            <button
              key={value}
              aria-pressed={level === value}
              className={level === value ? "chosen" : ""}
              onClick={() => setParams({ level: value }, { replace: true })}
            >
              <strong>{value === "junior" ? "Junior" : "Middle"}</strong>
              <span>
                {value === "junior"
                  ? "Hiểu cơ chế · viết đúng"
                  : "Giữ hợp đồng · chọn thiết kế"}
              </span>
            </button>
          ))}
        </div>
        <p className="oop-level-note" aria-live="polite">
          {level === "junior"
            ? "Bắt đầu bằng câu hỏi cụ thể, đọc thuật ngữ trước code rồi theo dấu state và lời gọi. Bạn cần giải thích được vì sao kết quả đúng hoặc sai."
            : "Bắt đầu từ contract, tình huống thay đổi và trade-off. Bạn cần nêu được giả định, cách kiểm chứng và trường hợp một thiết kế không còn phù hợp."}{" "}
          Các mức là mục tiêu học tập, không phải chứng nhận năng lực hoặc bảo
          đảm tuyển dụng.
        </p>
      </section>
      <div className="oop-pillar-grid">
        {oopPillars.map((pillar, i) => {
          const lesson = byId.get(pillar.id)!;
          return (
            <article key={pillar.id} className="oop-pillar">
              <div className="oop-pillar-meta">
                <span>{String(i + 1).padStart(2, "0")} / 04</span>
                <span>{pillar.english}</span>
              </div>
              <h2>{pillar.title}</h2>
              <p className="oop-core-question">{pillar.question}</p>
              <p>{pillar.summary}</p>
              <div className="oop-outcomes">
                <span>
                  {level === "junior"
                    ? "JUNIOR CẦN GIẢI THÍCH ĐƯỢC"
                    : "MIDDLE CẦN QUYẾT ĐỊNH ĐƯỢC"}
                </span>
                <ul>
                  {pillar[level].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="oop-pillar-footer">
                <span>
                  {lesson.sections.length} mục · ~{lesson.minutes} phút đọc
                </span>
                <Link to={`/read/${pillar.id}?order=oop#${level}`}>
                  Đọc phần {level}
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      <section
        className="oop-distinction"
        aria-labelledby="oop-distinction-heading"
      >
        <div className="eyebrow">PHÂN BIỆT TRƯỚC KHI GỘP LẠI</div>
        <h2 id="oop-distinction-heading">
          Bốn câu hỏi, bốn nhiệm vụ khác nhau
        </h2>
        <p>
          Cùng một hệ thống đặt hàng có thể dùng cả bốn tính chất. Chúng không
          phải bốn tên gọi thay thế nhau, và một class không cần cố dùng đủ cả
          bốn.
        </p>
        <div
          className="table-scroll"
          role="region"
          aria-label="So sánh bốn tính chất OOP"
          tabIndex={0}
        >
          <table>
            <caption>Cùng tình huống Order và cổng thanh toán</caption>
            <thead>
              <tr>
                <th scope="col">Tính chất</th>
                <th scope="col">Câu hỏi cốt lõi</th>
                <th scope="col">Trong tình huống đặt hàng</th>
                <th scope="col">Hiểu nhầm cần tránh</th>
              </tr>
            </thead>
            <tbody>
              {oopPillars.map((p) => (
                <tr key={p.id}>
                  <th scope="row">{p.title}</th>
                  <td>{p.question}</td>
                  <td>{p.orderCase}</td>
                  <td>{p.misconception}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="oop-reading-sequence">
        <div>
          <div className="eyebrow">MỘT LỘ TRÌNH ĐỌC CÓ LÝ DO</div>
          <h2>Từ object đúng tới hệ thống thay đổi được</h2>
          <p>
            Đóng gói giúp giữ state → trừu tượng diễn đạt hợp đồng → kế thừa cần
            giữ khả năng thay thế → đa hình cho phép dùng các implementation qua
            hợp đồng chung.
          </p>
          <Link
            className="button-primary"
            to={`/read/${oopPillars[0].id}?order=oop#${level}`}
          >
            <BookOpen size={16} />
            Đọc từ tính chất đầu tiên
            <ArrowRight size={16} />
          </Link>
        </div>
        <aside>
          <h3>Trước khi đọc</h3>
          <p>
            Nếu còn lẫn class/object, method hoặc copy reference, mở lại bài nền
            tảng rồi quay lại chuyên đề.
          </p>
          <Link to="/read/oop-classes">
            Class, object và trạng thái hợp lệ
            <ArrowRight size={14} />
          </Link>
          <Link to="/read/oop-interfaces">
            Interface và hợp đồng
            <ArrowRight size={14} />
          </Link>
          <Link to="/read/csharp-types">
            Value type và reference type
            <ArrowRight size={14} />
          </Link>
        </aside>
      </section>
      <section className="oop-download">
        <div>
          <h2>Đọc code, chạy thử và đối chiếu</h2>
          <p>
            ZIP có các project OOP độc lập với file cấu hình và expected output.
            Mẫu cố ý lỗi nằm riêng; ứng dụng đọc không thực thi C# trong trình
            duyệt và không chấm điểm.
          </p>
        </div>
        <a
          className="button-primary"
          href={`${import.meta.env.BASE_URL}examples/dotnet-labs.zip`}
          download
        >
          <Download size={16} />
          Tải project minh họa
        </a>
        <Link className="guide-link" to="/guide">
          Cách tạo project và debug
          <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}
