import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronRight,
  Download,
  GraduationCap,
  Moon,
  RotateCcw,
  Search,
  Sun,
  X,
} from "lucide-react";
import { useStore } from "./store";
import { latestAttempts, metrics, pendingReview, type Lesson } from "./types";
import { LessonPage, QuizCard } from "./Learning";
import DataPage from "./DataPage";
import { topicName } from "./topics";
export default function App() {
  const { message, notify } = useStore(),
    location = useLocation();
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("ddl-theme") === "dark";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem("ddl-theme", dark ? "dark" : "light");
    } catch {}
  }, [dark]);
  useEffect(() => {
    if (location.hash)
      requestAnimationFrame(() =>
        document.getElementById(location.hash.slice(1))?.scrollIntoView(),
      );
    else window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => notify(""), 5000);
    return () => clearTimeout(id);
  }, [message]);
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Đến nội dung chính
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link
            className="brand"
            to="/"
            aria-label="DotNet Deep Learn — trang chủ"
          >
            <span className="brand-mark">d.</span>
            <span>
              DotNet <strong>Deep Learn</strong>
            </span>
          </Link>
          <nav aria-label="Điều hướng chính">
            <NavLink to="/" end>
              <BookOpen size={17} />
              Bài học
            </NavLink>
            <NavLink to="/review">
              <RotateCcw size={17} />
              Ôn lại
            </NavLink>
          </nav>
          <div className="header-tools">
            <Link
              className="icon-btn"
              to="/data"
              aria-label="Dữ liệu & sao lưu"
            >
              <Download size={18} />
            </Link>
            <button
              className="icon-btn"
              onClick={() => setDark((d) => !d)}
              aria-label={
                dark
                  ? "Chuyển sang giao diện sáng"
                  : "Chuyển sang giao diện tối"
              }
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>
      <main id="main" className="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/lessons" element={<Library />} />
          <Route
            path="/bookmarks"
            element={<Navigate to="/?saved=yes" replace />}
          />
          <Route path="/lessons/:lessonId/:section?" element={<LessonPage />} />
          <Route path="/review" element={<Review />} />
          <Route path="/progress" element={<Navigate to="/review" replace />} />
          <Route path="/data" element={<DataPage />} />
          <Route
            path="*"
            element={
              <div className="empty">
                <h1>Không tìm thấy trang</h1>
                <Link className="btn primary" to="/">
                  Về bài học
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="site-footer">
        <span>Học để giải thích được. Ôn để áp dụng được.</span>
        <Link to="/data">
          Dữ liệu chỉ lưu trên trình duyệt này <ChevronRight size={14} />
        </Link>
      </footer>
      {message && (
        <div className="toast" role="status">
          <Check size={18} />
          <span>{message}</span>
          <button
            className="icon-btn"
            aria-label="Đóng thông báo"
            onClick={() => notify("")}
          >
            <X size={17} />
          </button>
        </div>
      )}
    </>
  );
}
function Library({ favorites = false }: { favorites?: boolean }) {
  const {
    catalog: { lessons },
    state,
  } = useStore();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "",
    topic = params.get("topic") ?? "",
    saved = favorites || params.get("saved") === "yes";
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  const filtered = lessons.filter(
    (l) =>
      (!topic || l.topicId === topic) &&
      (!saved || state.bookmarks.some((b) => b.lessonId === l.id)) &&
      norm([l.title, l.description, ...l.tags].join(" ")).includes(norm(q)),
  );
  const set = (key: string, value: string) => {
    const p = new URLSearchParams(params);
    if (value) p.set(key, value);
    else p.delete(key);
    setParams(p, { replace: true });
  };
  const last = [...state.progress].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    )[0],
    current = lessons.find((l) => l.id === last?.lessonId);
  return (
    <div className="library-page">
      <section className="home-intro">
        <div className="eyebrow">MỘT KHÁI NIỆM, HIỂU ĐẾN NƠI</div>
        <h1>
          Học điều mới.
          <br />
          <span>Hiểu lại điều đã biết.</span>
        </h1>
        <p>
          Định nghĩa rõ ràng, ví dụ có đầu vào và kết quả.
          <br className="desktop-break" /> Đọc từng bước khi mới học, xem bản
          tóm tắt khi cần ôn.
        </p>
        <div className="entry-paths">
          <Link
            className="btn primary"
            to={`/lessons/${lessons[0].id}/explain`}
          >
            <GraduationCap size={18} />
            Tôi muốn học từ đầu
            <ArrowRight size={16} />
          </Link>
          <Link className="btn" to="/review">
            <RotateCcw size={17} />
            Tôi muốn ôn lại
          </Link>
        </div>
      </section>
      {current && (
        <div className="resume-line">
          <BookOpen size={18} />
          <div>
            <small>BÀI GẦN NHẤT</small>
            <strong>{current.shortTitle}</strong>
          </div>
          <Link
            className="text-link"
            to={`/lessons/${current.id}/${last.section}`}
          >
            Tiếp tục học <ArrowRight size={16} />
          </Link>
        </div>
      )}
      <section className="catalog-section">
        <div className="catalog-heading">
          <div>
            <span className="eyebrow">CHỌN ĐIỀU BẠN MUỐN HIỂU</span>
            <h2>Bài học</h2>
          </div>
          <span className="muted">{filtered.length} bài đang có</span>
        </div>
        <div className="search-row">
          <label className="search-box">
            <Search size={19} />
            <input
              aria-label="Tìm bài học"
              placeholder="Tìm một khái niệm, ví dụ: đa hình…"
              value={q}
              onChange={(e) => set("q", e.target.value)}
            />
          </label>
          <select
            aria-label="Chủ đề"
            value={topic}
            onChange={(e) => set("topic", e.target.value)}
          >
            <option value="">Tất cả chủ đề</option>
            {[...new Set(lessons.map((l) => l.topicId))].map((id) => (
              <option value={id} key={id}>
                {topicName(id)}
              </option>
            ))}
          </select>
          <button
            className={`btn save-filter ${saved ? "active" : ""}`}
            aria-pressed={saved}
            onClick={() => set("saved", saved ? "" : "yes")}
          >
            <Bookmark size={17} />
            <span>Đã lưu</span>
          </button>
        </div>
        {filtered.length ? (
          <div className="lesson-list">
            {filtered.map((l) => (
              <LessonRow key={l.id} lesson={l} number={l.order} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <Search size={28} />
            <h3>Chưa có bài phù hợp</h3>
            <p>
              Thử từ khóa khác hoặc bỏ bộ lọc. Bài yêu thích sẽ hiện khi bạn lưu
              bằng biểu tượng dấu trang.
            </p>
            <button className="btn" onClick={() => setParams({})}>
              Xóa bộ lọc
            </button>
          </div>
        )}
        <p className="small-print">
          <BookOpen size={15} />
          Đánh dấu đã đọc và điểm trắc nghiệm chỉ ghi lại hoạt động, không xác
          nhận đã thành thạo.
        </p>
      </section>
    </div>
  );
}
function LessonRow({ lesson: l, number }: { lesson: Lesson; number: number }) {
  const { state, bookmark, notify } = useStore();
  const [busy, setBusy] = useState(false);
  const saved = state.bookmarks.some((b) => b.lessonId === l.id),
    m = metrics(l, state);
  return (
    <article className="lesson-row">
      <span className="lesson-number">{String(number).padStart(2, "0")}</span>
      <div className="lesson-row-copy">
        <div className="lesson-meta">
          <span>{topicName(l.topicId)}</span>
          <span>{l.minutes} phút</span>
          <span>
            {m.read ? "Đã đọc" : m.started ? "Đang học" : "Chưa bắt đầu"}
          </span>
        </div>
        <h3>
          <Link to={`/lessons/${l.id}/explain`}>{l.title}</Link>
        </h3>
        <p>{l.description}</p>
        <div className="prereq-line">
          Cần biết trước: {l.prerequisites.join(" · ")}
        </div>
      </div>
      <div className="row-actions">
        <button
          className={`icon-btn ${saved ? "is-bookmarked" : ""}`}
          aria-label={`${saved ? "Bỏ lưu" : "Lưu bài"}: ${l.shortTitle}`}
          aria-pressed={saved}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await bookmark(l.id, !saved);
            } catch (e) {
              notify((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
        </button>
        <Link
          className="row-arrow"
          to={`/lessons/${l.id}/explain`}
          aria-label={`Học: ${l.shortTitle}`}
        >
          <ArrowRight size={20} />
        </Link>
      </div>
    </article>
  );
}
function Review() {
  const {
    catalog: { lessons },
    state,
  } = useStore();
  const [queue] = useState(() => pendingReview(state.attempts));
  const [topic, setTopic] = useState("");
  const list = queue.filter(
    (a) =>
      !topic || lessons.find((l) => l.id === a.lessonId)?.topicId === topic,
  );
  const latest = latestAttempts(state.attempts);
  return (
    <div className="review-page">
      <div className="page-heading">
        <span className="eyebrow">NHỚ LẠI, GIẢI THÍCH, ÁP DỤNG</span>
        <h1>Ôn lại kiến thức</h1>
        <p>Làm lại câu đã sai, hoặc chọn một bài để xem nhanh ý chính.</p>
      </div>
      <div className="review-summary">
        <span>
          <strong>{pendingReview(state.attempts).length}</strong> câu còn cần ôn
        </span>
        <span>
          <strong>{state.attempts.length}</strong> lần trả lời được giữ lại
        </span>
        <span>
          <strong>{latest.filter((a) => a.correct).length}</strong> câu đúng gần
          nhất
        </span>
      </div>
      <section className="quick-lessons">
        <h2>Chọn bài để ôn nhanh</h2>
        {lessons.map((l) => (
          <Link key={l.id} to={`/lessons/${l.id}/explain?mode=review`}>
            <span>{l.shortTitle}</span>
            <ArrowRight size={17} />
          </Link>
        ))}
      </section>
      <div className="catalog-heading">
        <h2>Câu từng trả lời sai</h2>
        <select
          aria-label="Chủ đề ôn tập"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option value="">Tất cả chủ đề</option>
          {[...new Set(lessons.map((l) => l.topicId))].map((t) => (
            <option key={t} value={t}>
              {topicName(t)}
            </option>
          ))}
        </select>
      </div>
      {list.length ? (
        list.map((a, i) => {
          const lesson = lessons.find((l) => l.id === a.lessonId)!;
          return (
            <QuizCard
              key={a.questionId}
              lesson={lesson}
              question={lesson.questions.find((q) => q.id === a.questionId)!}
              index={i}
              review
            />
          );
        })
      ) : (
        <div className="empty">
          <Check size={26} />
          <h3>Không có câu cần ôn trong mục này</h3>
          <p>
            Bạn có thể mở phần tự kiểm tra của từng bài. Trả lời đúng không thay
            thế việc tự giải thích hoặc thực hành.
          </p>
        </div>
      )}
      <details className="history-panel">
        <summary>Lịch sử trả lời · {state.attempts.length} lần</summary>
        {[...state.attempts].reverse().map((a) => (
          <div className="history-row" key={a.id}>
            <span>
              {
                lessons
                  .find((l) => l.id === a.lessonId)
                  ?.questions.find((q) => q.id === a.questionId)?.prompt
              }
            </span>
            <small>{new Date(a.createdAt).toLocaleString("vi-VN")}</small>
            <strong className={a.correct ? "correct" : "incorrect"}>
              {a.correct ? "✓ Đúng" : "✕ Cần ôn"}
            </strong>
          </div>
        ))}
      </details>
    </div>
  );
}
