import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-powershell";
import "prismjs/components/prism-http";
import "prismjs/components/prism-cshtml";
import type { Example, Section } from "./theory";
export function CodeBlock({
  code,
  language,
  label,
}: {
  code: string;
  language: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false),
    [error, setError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const grammar = Prism.languages[language === "shell" ? "bash" : language];
  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>
          <Code2 size={14} />
          {label}
          <small>
            {language === "csharp"
              ? "C#"
              : language === "shell"
                ? "CLI"
                : language === "cshtml"
                  ? "Razor"
                  : language}
          </small>
        </span>
        <button
          aria-label={`Sao chép ${label}`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setError(false);
              if (timer.current) clearTimeout(timer.current);
              timer.current = setTimeout(() => setCopied(false), 1800);
            } catch {
              setError(true);
            }
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span aria-live="polite">{copied ? "Đã chép" : "Sao chép"}</span>
        </button>
      </div>
      <pre tabIndex={0} aria-label={`Mã ${label}`}>
        {grammar ? (
          <code
            dangerouslySetInnerHTML={{
              __html: Prism.highlight(code, grammar, language),
            }}
          />
        ) : (
          <code>{code}</code>
        )}
      </pre>
      {error && (
        <p className="copy-error" role="status">
          Không truy cập được clipboard. Bạn có thể chọn đoạn mã để sao chép.
        </p>
      )}
    </div>
  );
}
function language(name: string) {
  return name.endsWith(".cs")
    ? "csharp"
    : name.endsWith(".cshtml")
      ? "cshtml"
      : name.endsWith(".json")
        ? "json"
        : name.endsWith(".sql")
          ? "sql"
          : name.endsWith(".csproj") || name.endsWith(".slnx")
            ? "markup"
            : "plain";
}
const statusName: Record<string, string> = {
  ran: "Đã chạy và đối chiếu",
  compiled: "Đã kiểm tra biên dịch",
  "http-verified": "Đã kiểm tra HTTP",
  "expected-diagnostic": "Đã xác nhận lỗi dự kiến",
  "sql-verified": "Đã kiểm tra SQL",
  "test-verified": "Đã chạy test",
  "lab-verified": "Đã kiểm chứng trong bộ lab",
  illustration: "Minh họa, không tính là đã chạy",
  "not-run": "Chưa chạy trong môi trường này",
  pending: "Chưa có kết quả kiểm chứng",
};
export function ExampleView({ example: e }: { example: Example }) {
  const codeFiles = Object.entries(e.files ?? {}),
    configFiles = codeFiles.filter(
      ([name]) =>
        name.endsWith(".csproj") || name.endsWith("ConsoleEncoding.cs"),
    );
  const mainFiles = codeFiles.filter(
    ([name]) => !configFiles.some(([config]) => name === config),
  );
  return (
    <div className="worked-example" id={`example-${e.id}`}>
      <div className="example-top">
        <span className="article-kind">{e.label}</span>
        <span
          className={`verification ${e.verification === "pending" ? "pending" : ""}`}
        >
          {statusName[e.verification] ?? e.verification}
        </span>
      </div>
      <h3>{e.title}</h3>
      <p className="example-input">
        <strong>Đầu vào / điều kiện:</strong> {e.input}
      </p>
      <p className="example-context">
        Shell: {e.shell}.{" "}
        <Link to="/guide">Cách tạo thư mục mẫu, copy file và debug</Link>
      </p>
      {e.project && (
        <div className="project-download">
          <code>{e.project}</code>
          <a
            href={`${import.meta.env.BASE_URL}examples/dotnet-labs.zip`}
            download
          >
            <Download size={15} />
            Tải bộ project đầy đủ
          </a>
        </div>
      )}
      {e.setup && (
        <CodeBlock
          code={e.setup}
          language={e.shell === "sqlite3" ? "plain" : "shell"}
          label={`Terminal · ${e.shell}`}
        />
      )}
      {mainFiles.map(([name, code]) => (
        <CodeBlock
          key={name}
          code={code}
          language={language(name)}
          label={name}
        />
      ))}
      {configFiles.length > 0 && (
        <details className="project-config">
          <summary>
            Cấu hình project và console dùng chung <ChevronDown size={15} />
          </summary>
          {configFiles.map(([name, code]) => (
            <CodeBlock
              key={name}
              code={code}
              language={language(name)}
              label={name}
            />
          ))}
          <p>
            ConsoleEncoding.cs cố định UTF-8 và culture invariant cho output có
            thể đối chiếu. Các ví dụ culture đặc thù vẫn chỉ định CultureInfo
            riêng.
          </p>
        </details>
      )}
      {e.requests?.map((r, i) => (
        <div className="request-case" key={i}>
          <h4>
            Request {i + 1} <span>→ HTTP {r.status}</span>
          </h4>
          <CodeBlock
            label={`${r.method} ${r.path}`}
            language="http"
            code={`${r.method} http://127.0.0.1:5090${r.path}\n${Object.entries(
              r.headers ?? {},
            )
              .map(([k, v]) => `${k}: ${v}`)
              .join(
                "\n",
              )}${r.body !== undefined ? "\n\n" + (typeof r.body === "string" ? r.body : JSON.stringify(r.body, null, 2)) : ""}`}
          />
          {r.notes && <p>{r.notes}</p>}
        </div>
      ))}
      <div className="output">
        <span>KẾT QUẢ MONG ĐỢI</span>
        <pre>{e.expected}</pre>
      </div>
      <p className="example-reason">
        <strong>Vì sao:</strong> {e.explanation}
      </p>
    </div>
  );
}
export function SectionBody({ section: s }: { section: Section }) {
  return (
    <>
      {s.paragraphs?.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {s.definitions && (
        <dl className="definitions">
          {s.definitions.map((d) => (
            <div key={d.term}>
              <dt>{d.term}</dt>
              <dd>
                <p>{d.meaning}</p>
                <div className="definition-example">
                  <span>Ví dụ</span>
                  {d.example}
                </div>
              </dd>
            </div>
          ))}
        </dl>
      )}
      {s.tables?.map((t) => (
        <div
          key={t.caption}
          className="table-scroll"
          role="region"
          aria-label={t.caption}
          tabIndex={0}
        >
          <table>
            <caption>{t.caption}</caption>
            <thead>
              <tr>
                {t.headers.map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((v, j) => (
                    <td key={j}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      {s.diagrams?.map((d) => (
        <figure key={d.caption} className="concept-diagram">
          <figcaption>{d.caption}</figcaption>
          <ol>
            {d.steps.map((step, i) => (
              <li key={i}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {step}
              </li>
            ))}
          </ol>
        </figure>
      ))}
      {s.examples?.map((e) => (
        <ExampleView key={e.id} example={e} />
      ))}
      {s.questions && (
        <div className="self-check">
          <p>
            Thử giải thích trước khi mở đáp án. Đây là phần đọc đối chiếu, không
            chấm điểm hay xác nhận đã thành thạo.
          </p>
          {s.questions.map((q, i) => (
            <details className="qa" key={q.id}>
              <summary>
                <span className={`level ${q.level}`}>
                  {q.level === "junior" ? "Junior" : "Middle"}
                </span>
                <span>
                  {i + 1}. {q.prompt}
                </span>
                <ChevronDown size={16} />
              </summary>
              <div className="qa-answer">
                <h3>Đáp án</h3>
                <p>{q.answer}</p>
                <h4>Giải thích</h4>
                <p>{q.explanation}</p>
                <h4>Hiểu nhầm thường gặp</h4>
                <p>{q.misconception}</p>
                <h4>Hỏi tiếp</h4>
                <p>{q.followUp}</p>
              </div>
            </details>
          ))}
        </div>
      )}
      {s.relatedGuide && (
        <Link className="guide-link" to="/guide">
          Hướng dẫn chung: tạo project, bin/obj và debugger{" "}
          <ExternalLink size={14} />
        </Link>
      )}
      {s.links && (
        <>
          <p>
            Tài liệu sát chủ đề và phiên bản. Stack Overflow là nguồn hỏi đáp bổ
            trợ, không thay tài liệu API chính thức.
          </p>
          <div className="resource-links">
            {s.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                <span>
                  <small>{new URL(link.url).hostname}</small>
                  {link.title}
                </span>
                <ExternalLink size={16} />
              </a>
            ))}
            {s.community && (
              <a href={s.community} target="_blank" rel="noreferrer">
                <span>
                  <small>HỎI ĐÁP BỔ TRỢ</small>Stack Overflow · chủ đề liên quan
                </span>
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </>
      )}
    </>
  );
}
