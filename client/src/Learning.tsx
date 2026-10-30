import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  Copy,
  Lightbulb,
  Save,
  StickyNote,
  Target,
  XCircle,
} from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-sql";
import { useStore } from "./store";
import { predictExample } from "./content";
import type {
  Attempt,
  CodeFixture,
  Example,
  Exercise,
  Feedback,
  Lesson,
  Question,
  SectionKey,
} from "./types";
import { metrics } from "./types";
import { topicName } from "./topics";
export function CodeBlock({
  code,
  language = "csharp",
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false),
    [error, setError] = useState("");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(
        "Không sao chép được. Bạn có thể chọn và sao chép đoạn code bên dưới.",
      );
    }
  };
  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>
          <Code2 size={14} />
          {{
            sql: "SQL",
            csharp: "C#",
            html: "Razor / HTML",
            shell: "Terminal",
          }[language] ?? language}
        </span>
        <button onClick={copy} aria-label="Sao chép code">
          {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
          {copied ? "Đã sao chép" : "Sao chép"}
        </button>
      </div>
      <pre tabIndex={0} aria-label={`Đoạn mã ${language}`}>
        <code
          dangerouslySetInnerHTML={{
            __html: Prism.highlight(
              code,
              Prism.languages[language] ?? Prism.languages.plain,
              language,
            ),
          }}
        />
      </pre>
      {error && (
        <p className="error-text" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
export function LessonPage() {
  const { lessonId, section = "explain" } = useParams();
  const [params] = useSearchParams();
  const quick = params.get("mode") === "review";
  const {
    catalog: { lessons },
    state,
    saveProgress,
    bookmark,
    notify,
  } = useStore();
  const lesson = lessons.find((l) => l.id === lessonId),
    [busy, setBusy] = useState(false),
    initialized = useRef("");
  const progress = state.progress.find((p) => p.lessonId === lessonId);
  useEffect(() => {
    if (
      lesson &&
      initialized.current !== lesson.id + "/" + section &&
      ["explain", "examples", "quiz", "exercises"].includes(section)
    ) {
      initialized.current = lesson.id + "/" + section;
      saveProgress(
        lesson.id,
        section as SectionKey,
        progress?.read ?? false,
      ).catch((e) => notify(e.message));
    }
  }, [lessonId, section]);
  if (!lesson)
    return (
      <div className="empty">
        <h1>Không tìm thấy bài học</h1>
        <Link className="btn primary" to="/">
          Về bài học
        </Link>
      </div>
    );
  if (!["explain", "examples", "quiz", "exercises"].includes(section))
    return <Navigate to={"/lessons/" + lesson.id + "/explain"} replace />;
  const m = metrics(lesson, state),
    saved = state.bookmarks.some((b) => b.lessonId === lesson.id);
  return (
    <div className="reader-layout">
      <aside className="course-rail">
        <Link className="back-link" to="/">
          <ArrowLeft size={15} />
          Tất cả bài học
        </Link>
        <span className="eyebrow">HỌC THEO CHỦ ĐỀ</span>
        {lessons
          .filter((l) => l.topicId === lesson.topicId)
          .map((l) => (
            <Link
              className={l.id === lesson.id ? "current" : ""}
              key={l.id}
              to={"/lessons/" + l.id + "/explain"}
            >
              <span>{String(l.order).padStart(2, "0")}</span>
              {l.shortTitle}
            </Link>
          ))}
        <div className="rail-note">
          Chưa hiểu thuật ngữ nào? Bắt đầu từ phần “Nền tảng trước khi đọc code”
          trong bài.
        </div>
      </aside>
      <article className="reader">
        <div className="reader-breadcrumb">
          {topicName(lesson.topicId)}
          <ChevronDown size={13} />
          Bài học
        </div>
        <header className="reader-heading">
          <h1>{lesson.title}</h1>
          <p>{lesson.description}</p>
          <div className="reader-meta">
            <span>
              <Clock size={15} />
              {lesson.minutes} phút
            </span>
            <span>{lesson.version}</span>
            <button
              className="icon-btn"
              aria-label={saved ? "Đã yêu thích" : "Yêu thích"}
              aria-pressed={saved}
              onClick={async () => {
                try {
                  await bookmark(lesson.id, !saved);
                } catch (e) {
                  notify((e as Error).message);
                }
              }}
            >
              <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
        </header>
        <nav className="reader-tabs" aria-label="Các phần bài học">
          <Link
            className={
              section === "explain" || section === "examples" ? "active" : ""
            }
            to={"/lessons/" + lesson.id + "/explain"}
          >
            Học bài & ví dụ
          </Link>
          <Link
            className={section === "quiz" ? "active" : ""}
            to={"/lessons/" + lesson.id + "/quiz"}
          >
            Tự kiểm tra
          </Link>
          <Link
            className={section === "exercises" ? "active" : ""}
            to={"/lessons/" + lesson.id + "/exercises"}
          >
            Thực hành
          </Link>
        </nav>
        {section === "explain" || section === "examples" ? (
          <>
            <div className="reading-mode">
              <span>Bạn đang muốn</span>
              <Link
                className={!quick ? "selected" : ""}
                to={"/lessons/" + lesson.id + "/explain"}
              >
                Học từ đầu
              </Link>
              <Link
                className={quick ? "selected" : ""}
                to={"/lessons/" + lesson.id + "/explain?mode=review"}
              >
                Ôn nhanh
              </Link>
            </div>
            {quick ? (
              <section className="recap-box">
                <span className="eyebrow">NHỚ LẠI TRƯỚC KHI LÀM BÀI</span>
                <h2>Những ý cần nắm</h2>
                <ul>
                  {(
                    lesson.recap ?? [
                      lesson.sections.find((s) => s.id === "summary")!.core,
                    ]
                  ).map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                {lesson.comparison && <ResultTable {...lesson.comparison} />}
                <Link
                  className="text-link"
                  to={"/lessons/" + lesson.id + "/quiz"}
                >
                  Kiểm tra lại kiến thức <ArrowRight size={16} />
                </Link>
              </section>
            ) : (
              <>
                <section className="prerequisite-box">
                  <h2>Trước khi bắt đầu</h2>
                  <ul>
                    {lesson.prerequisites.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <p>{lesson.environment}</p>
                </section>
                {lesson.definitions && (
                  <section className="definitions">
                    <span className="eyebrow">ĐỪNG BỎ QUA BƯỚC NÀY</span>
                    <h2>Nền tảng trước khi đọc code</h2>
                    {lesson.definitions.map((d) => (
                      <div key={d.term}>
                        <h3>{d.term}</h3>
                        <p>{d.meaning}</p>
                        <p className="concrete-example">
                          Ví dụ cụ thể: {d.example}
                        </p>
                      </div>
                    ))}
                  </section>
                )}
                <details className="mobile-toc">
                  <summary>Mục lục bài học</summary>
                  {lesson.sections.map((s) => (
                    <Link key={s.id} to={"#" + s.id}>
                      {s.title}
                    </Link>
                  ))}
                  <Link to="#examples">Ví dụ từng bước</Link>
                </details>
                {lesson.sections.map((s, i) => (
                  <section className="knowledge-section" id={s.id} key={s.id}>
                    <span className="section-number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2>{s.title}</h2>
                    <p>{s.core}</p>
                    {s.paragraphs?.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                    {s.bullets && (
                      <ul>
                        {s.bullets.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    )}
                    {s.code && (
                      <>
                        <CodeBlock code={s.code} language={lesson.language} />
                        {s.codeNote && (
                          <p className="small-print">{s.codeNote}</p>
                        )}
                      </>
                    )}
                    {s.deep && (
                      <details className="deep-dive">
                        <summary>
                          <Lightbulb size={16} />
                          Đào sâu cơ chế
                          <ChevronDown size={16} />
                        </summary>
                        <p>{s.deep}</p>
                      </details>
                    )}
                  </section>
                ))}
              </>
            )}
            <section id="examples" className="examples-section">
              <div className="section-intro">
                <span className="eyebrow">CÙNG THEO DẤU MỘT CHƯƠNG TRÌNH</span>
                <h2>Đọc code, dự đoán, rồi đối chiếu</h2>
                <p>
                  So sánh dữ liệu và dòng code thay đổi giữa các ví dụ. Gửi dự
                  đoán để xem kết quả kỳ vọng và giải thích từng bước. Ứng dụng
                  không thực thi code của bạn.
                </p>
              </div>
              {lesson.schema && <Schema code={lesson.schema} />}{" "}
              {lesson.examples.map((e) => (
                <ExampleCard key={e.id} example={e} lessonId={lesson.id} />
              ))}
            </section>
            <section className="read-panel">
              <div>
                <CheckCircle2 size={22} />
                <span>
                  <strong>
                    {m.read
                      ? "Đã đánh dấu đọc"
                      : "Đã đọc và theo dõi được ví dụ?"}
                  </strong>
                  <small>Đánh dấu đọc không có nghĩa là thành thạo.</small>
                </span>
              </div>
              <button
                className="btn"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await saveProgress(lesson.id, "explain", !m.read);
                    notify("Đã lưu trạng thái đọc.");
                  } catch (e) {
                    notify((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {m.read ? "Bỏ đánh dấu" : "Đánh dấu đã đọc"}
              </button>
            </section>
            <Link
              className="btn primary next-section"
              to={"/lessons/" + lesson.id + "/quiz"}
            >
              Tiếp theo: Tự kiểm tra
              <ArrowRight size={16} />
            </Link>
            <details className="sources">
              <summary>Nguồn bài học và tài liệu đối chiếu</summary>
              <p>{lesson.sourceNote}</p>
              {lesson.sources.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                  {s.title} ↗
                </a>
              ))}
            </details>
          </>
        ) : section === "quiz" ? (
          <>
            <div className="section-intro">
              <h2>Tự kiểm tra khả năng giải thích</h2>
              <p>
                Chọn một đáp án rồi xem vì sao đúng hoặc sai. Lần làm lại luôn
                được lưu riêng; câu sai xuất hiện trong mục Ôn lại.
              </p>
            </div>
            {lesson.questions.map((q, i) => (
              <QuizCard key={q.id} lesson={lesson} question={q} index={i} />
            ))}
            <Link
              className="btn primary"
              to={"/lessons/" + lesson.id + "/exercises"}
            >
              Tự tay áp dụng <ArrowRight size={16} />
            </Link>
          </>
        ) : (
          <>
            <div className="section-intro">
              <h2>Viết lời giải của chính bạn</h2>
              <p>
                Từ hoàn thiện một dòng đến giải quyết một yêu cầu. Bài tập được
                tự đánh giá; mở đáp án hoặc nhập code không được tính là đã làm
                đúng.
              </p>
            </div>
            {lesson.schema && <Schema code={lesson.schema} />}{" "}
            {lesson.exercises.map((e) => (
              <ExerciseCard key={e.id} lesson={lesson} exercise={e} />
            ))}
          </>
        )}
        <nav className="lesson-neighbors" aria-label="Chuyển bài">
          {lessons
            .filter((l) => Math.abs(l.order - lesson.order) === 1)
            .map((l) => (
              <Link key={l.id} to={"/lessons/" + l.id + "/explain"}>
                {l.order < lesson.order ? "← Bài trước: " : "Bài tiếp: "}
                {l.shortTitle}
              </Link>
            ))}
        </nav>
        <details className="personal-notes">
          <summary>
            <StickyNote size={17} />
            Ghi chú của tôi
          </summary>
          <Notes key={lesson.id} lesson={lesson} />
        </details>
      </article>
    </div>
  );
}
function FixtureDetails({ fixture }: { fixture: CodeFixture }) {
  return (
    <>
      {fixture.files &&
        Object.entries(fixture.files).map(([name, code]) => (
          <div className="fixture-file" key={name}>
            <h4>File kèm theo: {name}</h4>
            <CodeBlock code={code} language="html" />
          </div>
        ))}
      {fixture.request && (
        <div className="request-fixture">
          <h4>Request dùng cho bài này</h4>
          <code>
            {fixture.request.method} http://localhost:5090{fixture.request.path}
          </code>
          {fixture.request.body && (
            <>
              <p>Content-Type: application/json</p>
              <pre>{JSON.stringify(fixture.request.body, null, 2)}</pre>
            </>
          )}
        </div>
      )}
    </>
  );
}
function Schema({ code }: { code: string }) {
  return (
    <details className="schema-panel" open>
      <summary>Schema & dữ liệu mẫu dùng chung</summary>
      <CodeBlock code={code} language="sql" />
      <p>An có đơn Paid · Bình có đơn Pending · Chi chưa có đơn.</p>
    </details>
  );
}
function Notes({ lesson }: { lesson: Lesson }) {
  const { state, saveNote } = useStore();
  const saved = state.notes.find((n) => n.lessonId === lesson.id)?.text ?? "";
  const [text, setText] = useState(saved),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <section className="notes-card">
      <h3>
        <StickyNote size={17} />
        Ghi chú của bạn
      </h3>
      <label htmlFor="personal-note">Điều bạn muốn ghi nhớ</label>
      <textarea
        id="personal-note"
        value={text}
        maxLength={20000}
        onChange={(e) => setText(e.target.value)}
        placeholder="Một điều vừa hiểu, một câu hỏi còn băn khoăn…"
        rows={6}
      />
      <span className="save-status">
        {saved === text ? "Đã lưu trong trình duyệt" : "Có thay đổi chưa lưu"}
      </span>
      <button
        className="btn"
        disabled={busy || saved === text}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await saveNote(lesson.id, text);
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Save size={15} />
        {busy ? "Đang lưu…" : "Lưu ghi chú"}
      </button>
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
    </section>
  );
}
function ChoiceGroup({
  name,
  options,
  value,
  setValue,
  disabled,
}: {
  name: string;
  options: { id: string; text: string }[];
  value: string;
  setValue: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <fieldset className="choices">
      <legend className="sr-only">Chọn một câu trả lời</legend>
      {options.map((o, i) => (
        <label
          key={o.id}
          className={`choice ${value === o.id ? "selected" : ""}`}
        >
          <input
            type="radio"
            name={name}
            value={o.id}
            checked={value === o.id}
            onChange={() => setValue(o.id)}
            disabled={disabled}
          />
          <span className="choice-letter">{String.fromCharCode(65 + i)}</span>
          <span>{o.text}</span>
        </label>
      ))}
    </fieldset>
  );
}
function ExampleCard({
  example: e,
  lessonId,
}: {
  example: Example;
  lessonId: string;
}) {
  const [choice, setChoice] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [result, setResult] = useState<{
    correct: boolean;
    output: string;
    steps: string[];
    comparison: string;
    table?: { headers: string[]; rows: string[][] };
  }>();
  return (
    <article className="activity-card">
      <span className="eyebrow">VÍ DỤ TƯƠNG TÁC</span>
      <h3>{e.title}</h3>
      <p>{e.prompt}</p>
      <CodeBlock code={e.code} language={e.language} />
      <FixtureDetails fixture={e} />
      <ChoiceGroup
        name={e.id}
        options={e.options}
        value={choice}
        setValue={setChoice}
        disabled={busy || !!result}
      />
      {!result ? (
        <button
          className="btn primary"
          disabled={!choice || busy}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              setResult(predictExample(lessonId, e.id, choice));
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Đang gửi…" : "Gửi dự đoán"}
          <ArrowRight size={16} />
        </button>
      ) : (
        <div className="example-result">
          <div
            className={`result-heading ${result.correct ? "correct" : "incorrect"}`}
          >
            {result.correct ? (
              <CheckCircle2 size={20} />
            ) : (
              <XCircle size={20} />
            )}
            <strong>
              {result.correct
                ? "Dự đoán chính xác"
                : "Dự đoán chưa đúng — cùng xem cơ chế"}
            </strong>
          </div>
          <h4>Kết quả kỳ vọng · Không thực thi trong trình duyệt</h4>
          {result.table ? (
            <ResultTable {...result.table} />
          ) : (
            <pre className="output">{result.output}</pre>
          )}
          <h4>Giải thích từng bước</h4>
          <ol>
            {result.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <div className="comparison">
            <Lightbulb size={18} />
            <p>
              <strong>So sánh biến thể</strong>
              <br />
              {result.comparison}
            </p>
          </div>
          <button
            className="btn"
            onClick={() => {
              setResult(undefined);
              setChoice("");
            }}
          >
            Thử dự đoán lại
          </button>
        </div>
      )}
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}
function ResultTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((v, j) => (
                <td key={j} className={v === "NULL" ? "null-value" : ""}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function QuizCard({
  lesson,
  question: q,
  index,
  review = false,
}: {
  lesson: Lesson;
  question: Question;
  index: number;
  review?: boolean;
}) {
  const { state, answer } = useStore();
  const [choice, setChoice] = useState(""),
    [result, setResult] = useState<Attempt>(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const history = state.attempts.filter((a) => a.questionId === q.id);
  const feedback: Feedback | undefined = result
    ? JSON.parse(result.feedback)
    : undefined;
  return (
    <article className="activity-card quiz-card" data-question={q.id}>
      <div className="quiz-meta">
        <span className="eyebrow">
          CÂU {String(index + 1).padStart(2, "0")} · {q.kind.toUpperCase()}
        </span>
        <span className="pill">{q.tag}</span>
      </div>
      {review && (
        <Link
          className="small-text text-link"
          to={`/lessons/${lesson.id}/explain`}
        >
          {lesson.shortTitle}
        </Link>
      )}
      <h3>{q.prompt}</h3>
      {q.code && <CodeBlock code={q.code} language={lesson.language} />}
      <FixtureDetails fixture={q} />
      <ChoiceGroup
        name={q.id}
        options={q.options}
        value={choice}
        setValue={setChoice}
        disabled={busy || !!result}
      />
      {!result ? (
        <button
          className="btn primary"
          disabled={!choice || busy}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              setResult(await answer(lesson.id, q.id, choice));
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy
            ? "Đang lưu…"
            : review
              ? "Gửi câu trả lời ôn tập"
              : "Gửi câu trả lời"}
          <ArrowRight size={16} />
        </button>
      ) : (
        <section className="quiz-feedback" aria-live="polite">
          <div
            className={`result-heading ${result.correct ? "correct" : "incorrect"}`}
          >
            {result.correct ? (
              <CheckCircle2 size={21} />
            ) : (
              <XCircle size={21} />
            )}
            <strong>
              {result.correct
                ? "Chính xác · Đã lưu lần làm"
                : "Chưa chính xác · Đã thêm vào danh sách cần ôn"}
            </strong>
          </div>
          <p>{feedback!.explanation}</p>
          <ul className="option-explanations">
            {feedback!.options.map((o) => (
              <li key={o.id}>
                <span
                  className={
                    feedback!.correctOptionId === o.id ? "correct" : "muted"
                  }
                >
                  {feedback!.correctOptionId === o.id
                    ? "✓ Đáp án đúng"
                    : "✕ Đáp án sai"}{" "}
                  · {o.id.toUpperCase()}
                </span>
                <strong>{o.text}</strong>
                <p>{o.explanation}</p>
              </li>
            ))}
          </ul>
          <div className="misconception">
            <strong>Ngộ nhận được kiểm tra:</strong> {q.misconception}
          </div>
          <Link
            className="text-link"
            to={`/lessons/${lesson.id}/explain#${q.sectionId}`}
          >
            Đọc lại phần liên quan <ArrowRight size={15} />
          </Link>
          <button
            className="btn retry-btn"
            onClick={() => {
              setResult(undefined);
              setChoice("");
            }}
          >
            Làm lại câu này
          </button>
        </section>
      )}
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
      {history.length > 0 && (
        <details className="attempt-history">
          <summary>Lịch sử câu này · {history.length} lần làm</summary>
          <ul>
            {[...history].reverse().map((a) => (
              <li key={a.id}>
                <time>{new Date(a.createdAt).toLocaleString("vi-VN")}</time>
                <span>Chọn {a.optionId.toUpperCase()}</span>
                <strong className={a.correct ? "correct" : "incorrect"}>
                  {a.correct ? "✓ Đúng" : "✕ Cần ôn"}
                </strong>
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}
function ExerciseCard({
  lesson,
  exercise: e,
}: {
  lesson: Lesson;
  exercise: Exercise;
}) {
  const { state, saveSubmission } = useStore();
  const previous = state.submissions.find((s) => s.exerciseId === e.id);
  const [code, setCode] = useState(previous?.code ?? e.starter),
    [checks, setChecks] = useState<boolean[]>(
      previous ? JSON.parse(previous.checks) : e.checklist.map(() => false),
    ),
    [assessed, setAssessed] = useState(previous?.assessed ?? false),
    [hints, setHints] = useState(0),
    [solution, setSolution] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const dirty =
    code !== (previous?.code ?? e.starter) ||
    JSON.stringify(checks) !==
      (previous?.checks ?? JSON.stringify(e.checklist.map(() => false))) ||
    assessed !== (previous?.assessed ?? false);
  const save = async (mark: boolean) => {
    setBusy(true);
    setError("");
    try {
      await saveSubmission(lesson.id, e.id, code, checks, mark);
      setAssessed(mark);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <article className="activity-card exercise-card">
      <div className="quiz-meta">
        <span className="eyebrow">{e.level.toUpperCase()}</span>
        <span className="pill">Tự đánh giá</span>
      </div>
      <h3>{e.title}</h3>
      <p>{e.prompt}</p>
      <FixtureDetails fixture={e} />
      <dl className="exercise-spec">
        <dt>Dữ liệu đầu vào</dt>
        <dd>{e.input}</dd>
        <dt>Kết quả mong đợi</dt>
        <dd>{e.expected}</dd>
      </dl>
      <details>
        <summary>Starter code</summary>
        <CodeBlock code={e.starter} language={lesson.language} />
      </details>
      <label className="solution-label" htmlFor={e.id}>
        Lời giải & giải thích của bạn
      </label>
      <textarea
        className="code-editor"
        id={e.id}
        rows={9}
        value={code}
        maxLength={30000}
        spellCheck={false}
        onChange={(evt) => {
          setCode(evt.target.value);
          setAssessed(false);
        }}
      />
      <div className="exercise-save">
        <button
          className="btn primary"
          disabled={busy}
          onClick={() => save(assessed)}
        >
          <Save size={16} />
          {busy ? "Đang lưu…" : "Lưu bài làm"}
        </button>
        <span className="save-status">
          {dirty
            ? "Có thay đổi chưa lưu"
            : previous
              ? "Đã lưu trong trình duyệt"
              : "Chưa có bài làm đã lưu"}
        </span>
      </div>
      <div className="hints">
        <button
          className="btn subtle"
          disabled={hints >= e.hints.length}
          onClick={() => setHints((h) => h + 1)}
        >
          <Lightbulb size={16} />
          {hints >= e.hints.length
            ? "Đã mở hết gợi ý"
            : `Mở gợi ý ${hints + 1}/${e.hints.length}`}
        </button>
        {e.hints.slice(0, hints).map((h, i) => (
          <p key={i}>
            <strong>Gợi ý {i + 1}.</strong> {h}
          </p>
        ))}
      </div>
      {!solution ? (
        <button className="text-link" onClick={() => setSolution(true)}>
          Xem đáp án tham khảo <ChevronDown size={16} />
        </button>
      ) : (
        <div className="reference-solution">
          <h4>Đáp án tham khảo</h4>
          <p>
            Đây là một cách giải. Việc mở đáp án không xác nhận bài làm của bạn
            đúng.
          </p>
          <CodeBlock code={e.solution} language={lesson.language} />
          <p>{e.explanation}</p>
          <div className="comparison">
            <Lightbulb size={18} />
            <p>
              <strong>Cách khác & đánh đổi</strong>
              <br />
              {e.alternative}
            </p>
          </div>
          <button className="text-link" onClick={() => setSolution(false)}>
            Ẩn đáp án
          </button>
        </div>
      )}
      <fieldset className="self-check">
        <legend>Checklist tự đánh giá</legend>
        {e.checklist.map((c, i) => (
          <label key={c}>
            <input
              type="checkbox"
              checked={checks[i]}
              onChange={(evt) => {
                setChecks((v) =>
                  v.map((old, j) => (i === j ? evt.target.checked : old)),
                );
                setAssessed(false);
              }}
            />
            {c}
          </label>
        ))}
      </fieldset>
      <button
        className="btn"
        disabled={busy || !code.trim() || !checks.every(Boolean)}
        onClick={() => save(true)}
      >
        <Target size={16} />
        {assessed ? "Đã lưu tự đánh giá" : "Xác nhận đã tự đánh giá"}
      </button>
      <p className="small-text muted">
        Tích đủ checklist rồi xác nhận. Không có chấm code tự động.
      </p>
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
    </article>
  );
}
