import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  Copy,
  FileQuestion,
  Lightbulb,
  ListChecks,
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
  Example,
  Exercise,
  Feedback,
  Lesson,
  Question,
  SectionKey,
} from "./types";
import { metrics } from "./types";
import { topicName } from "./App";
const tabs: { id: SectionKey; label: string; icon: typeof BookOpen }[] = [
  { id: "explain", label: "Kiến thức", icon: BookOpen },
  { id: "examples", label: "Ví dụ tương tác", icon: Code2 },
  { id: "quiz", label: "Câu hỏi ôn tập", icon: FileQuestion },
  { id: "exercises", label: "Bài tập thực hành", icon: ListChecks },
];
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
          {language === "sql" ? "SQL" : "C#"}
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
  const {
    catalog: { lessons },
    state,
    saveProgress,
    bookmark,
    notify,
  } = useStore();
  const navigate = useNavigate();
  const lesson = lessons.find((l) => l.id === lessonId),
    [busy, setBusy] = useState(false);
  const initialized = useRef("");
  const tab = tabs.find((t) => t.id === section);
  const progress = state.progress.find((p) => p.lessonId === lessonId);
  useEffect(() => {
    if (lesson && tab && initialized.current !== lesson.id + "/" + section) {
      initialized.current = lesson.id + "/" + section;
      saveProgress(lesson.id, tab.id, progress?.read ?? false).catch((e) =>
        notify(e.message),
      );
    }
  }, [lessonId, section]);
  if (!lesson)
    return (
      <div className="empty">
        <h1>Không tìm thấy bài học</h1>
        <Link to="/lessons" className="btn primary">
          Về danh sách bài học
        </Link>
      </div>
    );
  if (!tab) return <Navigate to={`/lessons/${lesson.id}/explain`} replace />;
  const m = metrics(lesson, state),
    saved = state.bookmarks.some((b) => b.lessonId === lesson.id);
  const changeTab = (id: SectionKey) => navigate(`/lessons/${lesson.id}/${id}`);
  return (
    <>
      <Link className="back-link" to="/lessons">
        <ArrowLeft size={15} />
        Khám phá bài học
      </Link>
      <header className="lesson-heading">
        <div className="card-meta">
          <span>{topicName(lesson.topicId)}</span>
          <span>·</span>
          {lesson.level}
          <span>·</span>
          <Clock size={14} />
          {lesson.minutes} phút
        </div>
        <div className="title-row">
          <h1>{lesson.title}</h1>
          <button
            className={`btn ${saved ? "is-bookmarked" : ""}`}
            disabled={busy}
            aria-pressed={saved}
            onClick={async () => {
              setBusy(true);
              try {
                await bookmark(lesson.id, !saved);
              } catch (e) {
                notify((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
            {saved ? "Đã yêu thích" : "Yêu thích"}
          </button>
        </div>
        <p>{lesson.description}</p>
        <div className="version-note">{lesson.version}</div>
      </header>
      <nav className="lesson-tabs" aria-label="Các phần bài học">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => changeTab(t.id)}
            aria-current={tab.id === t.id ? "page" : undefined}
            className={tab.id === t.id ? "active" : ""}
          >
            <t.icon size={17} />
            {t.label}
            {t.id === "quiz" && <small>5</small>}
            {t.id === "exercises" && <small>3</small>}
          </button>
        ))}
      </nav>
      {section === "explain" && (
        <details className="mobile-toc">
          <summary>Mục lục bài học</summary>
          {lesson.sections.map((s) => (
            <Link key={s.id} to={"#" + s.id}>
              {s.title}
            </Link>
          ))}
        </details>
      )}
      <div className="lesson-layout">
        <div className="lesson-body" key={lesson.id + section}>
          {section === "explain" ? (
            <>
              <div className="prerequisite-box">
                <strong>Trước khi bắt đầu</strong>
                <ul>
                  {lesson.prerequisites.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <span className="pill">
                  Cốt lõi luôn hiển thị · Mở “Đào sâu” khi cần
                </span>
              </div>
              {lesson.sections.map((s, i) => (
                <section className="knowledge-section" id={s.id} key={s.id}>
                  <span className="section-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2>{s.title}</h2>
                  <p>{s.core}</p>
                  <details className="deep-dive">
                    <summary>
                      <LayersIcon /> Đào sâu <ChevronDown size={16} />
                    </summary>
                    <p>{s.deep}</p>
                  </details>
                </section>
              ))}
              <section className="sources">
                <h3>Nguồn tham khảo</h3>
                <p>
                  Đã đọc và đối chiếu nội dung từ các bản nguồn chính thức dưới
                  đây.
                </p>
                {lesson.sources.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                    {s.title} ↗
                  </a>
                ))}
              </section>
              <div className="read-panel">
                <div>
                  <CheckCircle2 size={23} />
                  <span>
                    <strong>
                      {m.read
                        ? "Bạn đã đánh dấu đọc phần kiến thức"
                        : "Bạn đã đọc xong phần kiến thức?"}
                    </strong>
                    <small>
                      Đánh dấu đọc không đồng nghĩa với đã thành thạo.
                    </small>
                  </span>
                </div>
                <button
                  className="btn"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await saveProgress(lesson.id, "explain", !m.read);
                      notify(
                        m.read
                          ? "Đã bỏ đánh dấu đọc."
                          : "Đã lưu trạng thái đọc.",
                      );
                    } catch (e) {
                      notify((e as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {m.read ? "Bỏ đánh dấu" : "Đánh dấu đã đọc"}
                </button>
              </div>
              <button
                className="btn primary next-section"
                onClick={() => changeTab("examples")}
              >
                Tiếp theo: Dự đoán kết quả
                <ArrowRight size={16} />
              </button>
            </>
          ) : section === "examples" ? (
            <>
              <div className="section-intro">
                <span className="eyebrow">DỰ ĐOÁN TRƯỚC, GIẢI THÍCH SAU</span>
                <h2>Đừng vội xem kết quả</h2>
                <p>
                  Đọc code, chọn dự đoán và gửi câu trả lời để mở kết quả kỳ
                  vọng. Đây là kết quả minh họa; trình duyệt không thực thi C#
                  hay SQL.
                </p>
              </div>
              {lesson.schema && <Schema code={lesson.schema} />}{" "}
              {lesson.examples.map((e) => (
                <ExampleCard key={e.id} example={e} lessonId={lesson.id} />
              ))}
              <button
                className="btn primary next-section"
                onClick={() => changeTab("quiz")}
              >
                Tiếp theo: Kiểm tra kiến thức
                <ArrowRight size={16} />
              </button>
            </>
          ) : section === "quiz" ? (
            <>
              <div className="section-intro">
                <span className="eyebrow">GIẢI THÍCH ĐƯỢC “VÌ SAO”</span>
                <h2>5 câu hỏi, 5 góc nhìn</h2>
                <p>
                  Mỗi câu kiểm tra một cách hiểu khác nhau. Câu trả lời sai sẽ
                  vào trang ôn tập; lần làm lại luôn được lưu riêng.
                </p>
              </div>
              {lesson.questions.map((q, i) => (
                <QuizCard key={q.id} lesson={lesson} question={q} index={i} />
              ))}
              <button
                className="btn primary next-section"
                onClick={() => changeTab("exercises")}
              >
                Tiếp theo: Tự tay áp dụng
                <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="section-intro">
                <span className="eyebrow">TỪ HIỂU ĐẾN LÀM</span>
                <h2>Bài tập thực hành</h2>
                <p>
                  Bài tập được <strong>tự đánh giá</strong>. Hệ thống lưu bài
                  làm và checklist, không thực thi code hay tự khẳng định lời
                  giải đúng.
                </p>
              </div>
              {lesson.schema && <Schema code={lesson.schema} />}{" "}
              {lesson.exercises.map((e) => (
                <ExerciseCard key={e.id} lesson={lesson} exercise={e} />
              ))}
            </>
          )}
        </div>
        <aside className="lesson-aside">
          <div className="toc-card">
            <span className="eyebrow">TRONG BÀI HỌC NÀY</span>
            {section === "explain" ? (
              lesson.sections.map((s, i) => (
                <Link to={"#" + s.id} key={s.id}>
                  <span>{i + 1}</span>
                  {s.title}
                </Link>
              ))
            ) : (
              <>
                <p className="muted">
                  {section === "examples"
                    ? "Hai ví dụ, chỉ một chi tiết thay đổi."
                    : section === "quiz"
                      ? "Trả lời từng câu trước khi xem giải thích."
                      : "Hoàn thiện → sửa lỗi → vận dụng."}
                </p>
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    className={tab.id === t.id ? "active" : ""}
                    onClick={() => changeTab(t.id)}
                  >
                    <t.icon size={15} />
                    {t.label}
                  </button>
                ))}
              </>
            )}
            <div className="toc-progress">
              <span>
                Hoạt động trong lộ trình <strong>{m.percent}%</strong>
              </span>
              <div className="progress-track">
                <i style={{ width: m.percent + "%" }} />
              </div>
              <small>
                {m.read ? "Đã đọc" : "Chưa đánh dấu đọc"} · {m.correct}/5 câu
                đúng · {m.assessed}/3 bài tự đánh giá
              </small>
            </div>
          </div>
          <Notes key={lesson.id} lesson={lesson} />
        </aside>
      </div>
    </>
  );
}
function LayersIcon() {
  return <span aria-hidden="true">◇</span>;
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
