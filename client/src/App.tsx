import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Braces,
  Check,
  ChevronRight,
  Clock,
  Code2,
  Database,
  GraduationCap,
  LayoutDashboard,
  Layers,
  Menu,
  Moon,
  Search,
  Sun,
  Target,
  TrendingUp,
  Workflow,
  X,
  RotateCcw,
  Boxes,
  Globe,
  Component,
  Lightbulb,
  HardDrive,
} from "lucide-react";
import { useStore } from "./store";
import DataPage from "./DataPage";
import {
  latestAttempts,
  metrics,
  pendingReview,
  type Lesson,
  type Topic,
} from "./types";
import { LessonPage, QuizCard } from "./Learning";
const icons: Record<string, typeof Code2> = {
  Braces,
  Boxes,
  Workflow,
  Database,
  Layers,
  Globe,
  Component,
};
export const TopicIcon = ({
  topic,
  size = 22,
}: {
  topic?: Topic;
  size?: number;
}) => {
  const Icon = icons[topic?.icon ?? ""] ?? Code2;
  return <Icon size={size} />;
};
export const topicName = (id: string) =>
  ({
    oop: "OOP",
    linq: "LINQ",
    sql: "Database & SQL",
    csharp: "C# nền tảng",
    efcore: "EF Core",
    aspnet: "ASP.NET Core",
    solid: "SOLID",
  })[id] ?? id;
export function AppLink({ lesson, label }: { lesson: Lesson; label?: string }) {
  const { state } = useStore();
  return (
    <Link
      className="btn primary"
      to={`/lessons/${lesson.id}/${state.progress.find((p) => p.lessonId === lesson.id)?.section ?? "explain"}`}
    >
      {label ?? "Bắt đầu học"}
      <ArrowRight size={16} />
    </Link>
  );
}
export default function App() {
  const { state, message, notify } = useStore();
  const location = useLocation(),
    navigate = useNavigate();
  const [mobile, setMobile] = useState(false),
    [dark, setDark] = useState(() => {
      try {
        return localStorage.getItem("ddl-theme") === "dark";
      } catch {
        return false;
      }
    }),
    [search, setSearch] = useState("");
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem("ddl-theme", dark ? "dark" : "light");
    } catch {}
  }, [dark]);
  useEffect(() => {
    setMobile(false);
    if (location.hash) {
      requestAnimationFrame(() =>
        document.getElementById(location.hash.slice(1))?.scrollIntoView(),
      );
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => notify(""), 5000);
    return () => clearTimeout(t);
  }, [message]);
  const navRef = useRef<HTMLElement>(null),
    menuRef = useRef<HTMLButtonElement>(null);
  const [smallScreen, setSmallScreen] = useState(
    () => window.matchMedia("(max-width:780px)").matches,
  );
  useEffect(() => {
    const m = window.matchMedia("(max-width:780px)");
    const listener = () => setSmallScreen(m.matches);
    m.addEventListener("change", listener);
    return () => m.removeEventListener("change", listener);
  }, []);
  useEffect(() => {
    if (!mobile) return;
    const controls = () =>
      Array.from(
        navRef.current?.querySelectorAll<HTMLElement>(
          "a,button:not(:disabled)",
        ) ?? [],
      );
    controls()
      .find((e) => e.classList.contains("mobile-close"))
      ?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobile(false);
        menuRef.current?.focus();
      }
      if (e.key === "Tab") {
        const list = controls(),
          first = list[0],
          last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [mobile]);
  const review = pendingReview(state.attempts).length;
  const nav = [
    { to: "/", text: "Tổng quan", icon: LayoutDashboard },
    { to: "/lessons", text: "Khám phá bài học", icon: BookOpen },
    { to: "/review", text: "Ôn tập kiến thức", icon: RotateCcw },
    { to: "/progress", text: "Tiến độ của tôi", icon: TrendingUp },
    { to: "/bookmarks", text: "Bài học yêu thích", icon: Bookmark },
    { to: "/data", text: "Dữ liệu & sao lưu", icon: HardDrive },
  ];
  return (
    <div className="app-shell">
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
      {mobile && (
        <button
          className="nav-scrim"
          aria-label="Đóng điều hướng"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        ref={navRef}
        id="main-navigation"
        inert={smallScreen && !mobile}
        className={`sidebar ${mobile ? "is-open" : ""}`}
      >
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Code2 size={25} />
          </span>
          <span>
            DotNet<span className="brand-sub">DEEP LEARN</span>
          </span>
        </Link>
        <button
          className="icon-btn mobile-close"
          onClick={() => setMobile(false)}
          aria-label="Đóng menu"
        >
          <X />
        </button>
        <p className="nav-label">KHÔNG GIAN HỌC TẬP</p>
        <nav aria-label="Điều hướng chính">
          {nav.map((n) => (
            <NavLink key={n.to} end={n.to === "/"} to={n.to}>
              <n.icon size={19} />
              <span>{n.text}</span>
              {n.to === "/review" && review > 0 && (
                <span className="nav-count">{review}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-tip">
          <span className="tip-icon">
            <Lightbulb size={21} />
          </span>
          <strong>
            Hiểu bản chất.
            <br />
            Vững thực hành.
          </strong>
          <p>Mỗi câu hỏi “vì sao” là một bước tiến mới.</p>
          <span className="tip-line" />
        </div>
        <div className="sidebar-bottom">
          <span className="avatar">B</span>
          <div>
            <strong>Không gian của bạn</strong>
            <small>Cá nhân · Lưu trên trình duyệt</small>
          </div>
          <span
            className="online-dot"
            title="Dữ liệu dùng chung cho một người học"
          />
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="top-left">
            <button
              ref={menuRef}
              aria-controls="main-navigation"
              aria-expanded={mobile}
              className="icon-btn menu-btn"
              onClick={() => setMobile(true)}
              aria-label="Mở điều hướng"
            >
              <Menu />
            </button>
            <span className="crumb-home">Không gian học tập</span>
            <ChevronRight size={14} />
            <span>
              {location.pathname === "/"
                ? "Tổng quan"
                : location.pathname.startsWith("/lessons/")
                  ? "Bài học"
                  : (nav.find((n) => n.to === location.pathname)?.text ??
                    "Trang")}
            </span>
          </div>
          <div className="top-actions">
            <form
              className="top-search"
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                navigate("/lessons?q=" + encodeURIComponent(search));
              }}
            >
              <Search size={16} />
              <input
                aria-label="Tìm kiếm toàn bộ bài học"
                placeholder="Tìm bài học, kiến thức…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd>↵</kbd>
            </form>
            <button
              className="icon-btn theme-btn"
              aria-label={
                dark
                  ? "Chuyển sang giao diện sáng"
                  : "Chuyển sang giao diện tối"
              }
              onClick={() => setDark((x) => !x)}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <span className="avatar small">B</span>
          </div>
        </header>
        <main id="main" className="main-content" tabIndex={-1}>
          <Routes>
            <Route path="/data" element={<DataPage />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/lessons" element={<Library />} />
            <Route path="/bookmarks" element={<Library bookmarksOnly />} />
            <Route
              path="/lessons/:lessonId/:section?"
              element={<LessonPage />}
            />
            <Route path="/review" element={<Review />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route
              path="*"
              element={
                <div className="empty">
                  <h1>Không tìm thấy trang</h1>
                  <Link className="btn primary" to="/">
                    Về tổng quan
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>
        <footer className="footer">
          <span>
            DotNet Deep Learn <span className="footer-dot">·</span> Học để hiểu,
            không chỉ để nhớ.
          </span>
          <span>
            <span className="online-dot" /> Dữ liệu chỉ lưu trong trình duyệt
            này
          </span>
        </footer>
      </div>
      {message && (
        <div className="toast" role="status">
          <Check size={18} />
          {message}
          <button
            className="icon-btn"
            aria-label="Đóng thông báo"
            onClick={() => notify("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function Dashboard() {
  const {
    catalog: { lessons, topics },
    state,
  } = useStore();
  const started = state.progress.length,
    completed = lessons.filter((l) => metrics(l, state).complete).length,
    review = pendingReview(state.attempts).length;
  const last = [...state.progress].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  )[0];
  const next = lessons.find((l) => !metrics(l, state).complete) ?? lessons[0];
  const current = lessons.find((l) => l.id === last?.lessonId) ?? next;
  const read = state.progress.filter((p) => p.read).length;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="mini-spark">✦</span> MỖI NGÀY, HIỂU SÂU HƠN MỘT
            CHÚT
          </div>
          <h1>Hôm nay, bạn muốn hiểu gì?</h1>
          <p>Tiếp nối hành trình C# và .NET, từ bản chất đến thực hành.</p>
        </div>
        <span className="personal-badge">
          <GraduationCap size={17} /> Học theo nhịp của bạn
        </span>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-label">
            <span /> {started ? "TIẾP TỤC HÀNH TRÌNH" : "BẮT ĐẦU HÀNH TRÌNH"}
          </span>
          <h2>
            {started ? "Một bước nhỏ hôm nay." : "Đừng chỉ nhớ cú pháp."}
            <br />
            <span>
              {started
                ? "Một nền tảng vững ngày mai."
                : "Hãy hiểu cách nó hoạt động."}
            </span>
          </h2>
          <p>
            {started
              ? `Bạn đang học “${current.shortTitle}”. Quay lại phần đã lưu và khám phá điều tiếp theo.`
              : "Dự đoán kết quả, khám phá cơ chế và tự tay áp dụng. Kiến thức vững bắt đầu từ câu hỏi “vì sao?”."}
          </p>
          <div className="hero-bottom">
            <AppLink
              lesson={current}
              label={started ? "Tiếp tục học" : "Khám phá bài đầu tiên"}
            />
            <span>
              <Clock size={15} /> {current.minutes} phút ·{" "}
              {topicName(current.topicId)}
            </span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="art-spark s1">+</span>
          <span className="art-spark s2">✦</span>
          <div className="floating-tag tag-cs">C#</div>
          <div className="code-window">
            <div className="window-dots">
              <i />
              <i />
              <i />
              <span>your-next-level.cs</span>
            </div>
            <pre>
              <span className="code-purple">while</span> (curiosity) {"{"}
              <br />
              {"  "}
              <span className="code-blue">Learn</span>();
              <br />
              {"  "}
              <span className="code-blue">Understand</span>();
              <br />
              {"  "}
              <span className="code-blue">Build</span>();
              <br />
              {"}"}
            </pre>
            <div className="code-caption">
              <span>✓</span> Kiến thức → kỹ năng
            </div>
          </div>
          <div className="floating-tag tag-braces">{"{ }"}</div>
          <div className="art-floor" />
        </div>
      </section>
      <section className="stats-grid" aria-label="Tổng quan tiến độ">
        {[
          {
            icon: BookOpen,
            label: "Bài đã bắt đầu",
            value: started,
            unit: "/ 3 bài",
            color: "purple",
          },
          {
            icon: Check,
            label: "Hoàn thành lộ trình",
            value: completed,
            unit: "/ 3 bài",
            color: "green",
          },
          {
            icon: RotateCcw,
            label: "Câu cần ôn lại",
            value: review,
            unit: "câu hỏi",
            color: "orange",
          },
          {
            icon: Target,
            label: "Phần kiến thức đã đọc",
            value: read,
            unit: "/ 3 bài",
            color: "blue",
          },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <span className={`stat-icon ${s.color}`}>
              <s.icon size={20} />
            </span>
            <div>
              <p>{s.label}</p>
              <strong>
                {s.value}
                <small>{s.unit}</small>
              </strong>
            </div>
          </div>
        ))}
      </section>
      <div className="dashboard-columns">
        <section>
          <div className="section-heading">
            <div>
              <h2>Lộ trình nhỏ, nền tảng vững</h2>
              <p>Ba bài học trọng tâm. Học một lần, hiểu nhiều lớp.</p>
            </div>
            <Link className="text-link" to="/lessons">
              Tất cả bài học <ArrowRight size={15} />
            </Link>
          </div>
          <div className="lesson-grid">
            {lessons.map((l) => (
              <LessonCard key={l.id} lesson={l} />
            ))}
          </div>
        </section>
        <aside className="next-card">
          <span className="eyebrow">
            <Workflow size={15} /> BƯỚC TIẾP THEO
          </span>
          <h3>
            {review
              ? "Biến lỗi sai thành hiểu biết"
              : completed === 3
                ? "Ôn lại để kết nối kiến thức"
                : "Mỗi khái niệm là một mắt xích"}
          </h3>
          <p>
            {review
              ? `Có ${review} câu hỏi đang chờ bạn làm lại. Thử giải thích vì sao trước khi chọn đáp án.`
              : `${next.shortTitle} là gợi ý tiếp theo trong thứ tự học của bạn.`}
          </p>
          <div className="next-steps">
            <span>
              <i className="active-step">1</i> Hiểu cơ chế
            </span>
            <span>
              <i>2</i> Dự đoán & kiểm chứng
            </span>
            <span>
              <i>3</i> Áp dụng & tự đánh giá
            </span>
          </div>
          <Link
            className="text-link"
            to={review ? "/review" : `/lessons/${next.id}/explain`}
          >
            {review ? "Ôn tập ngay" : "Khám phá bài gợi ý"}
            <ArrowUpRight size={16} />
          </Link>
        </aside>
      </div>
      <section className="topics-section">
        <div className="section-heading">
          <div>
            <h2>Khám phá theo chủ đề</h2>
            <p>Kết nối những mảnh ghép trong hệ sinh thái .NET.</p>
          </div>
          <span className="muted small-text">7 chủ đề · 3 bài học hiện có</span>
        </div>
        <div className="topic-grid">
          {topics.map((t) => {
            const count = lessons.filter((l) => l.topicId === t.id).length;
            return count ? (
              <Link
                className={`topic-tile topic-${t.id}`}
                key={t.id}
                to={"/lessons?topic=" + t.id}
              >
                <span className="topic-icon">
                  <TopicIcon topic={t} />
                </span>
                <div>
                  <h3>{t.title}</h3>
                  <span>{count} bài học</span>
                </div>
                <ChevronRight size={16} />
              </Link>
            ) : (
              <div className="topic-tile soon" key={t.id}>
                <span className="topic-icon">
                  <TopicIcon topic={t} />
                </span>
                <div>
                  <h3>{t.title}</h3>
                  <span>Sắp có</span>
                </div>
                <span className="soon-dot" />
              </div>
            );
          })}
        </div>
      </section>
      <div className="learning-note">
        <Lightbulb size={18} />
        <p>
          <strong>Học sâu không phải là đọc hết.</strong> Hãy thử dự đoán, giải
          thích lựa chọn và áp dụng vào một tình huống mới.
        </p>
      </div>
    </>
  );
}
export function LessonCard({ lesson: l }: { lesson: Lesson }) {
  const {
    catalog: { topics },
    state,
    bookmark,
    notify,
  } = useStore();
  const m = metrics(l, state),
    saved = state.bookmarks.some((b) => b.lessonId === l.id),
    [busy, setBusy] = useState(false);
  return (
    <article className={`lesson-card topic-${l.topicId}`}>
      <div className="lesson-card-top">
        <span className="topic-icon">
          <TopicIcon topic={topics.find((t) => t.id === l.topicId)} />
        </span>
        <button
          className={`icon-btn ${saved ? "is-bookmarked" : ""}`}
          disabled={busy}
          aria-label={
            saved
              ? `Bỏ yêu thích: ${l.shortTitle}`
              : `Yêu thích: ${l.shortTitle}`
          }
          aria-pressed={saved}
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
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="card-meta">
        <span>{topicName(l.topicId)}</span>
        <span>·</span>
        {l.level}
      </div>
      <h3>
        <Link to={`/lessons/${l.id}/explain`}>{l.title}</Link>
      </h3>
      <p>{l.description}</p>
      <div className="card-tags">
        {l.tags.slice(1).map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <div className="card-progress">
        {m.started ? (
          <>
            <span>
              {m.complete ? "Hoàn thành lộ trình" : `${m.percent}% lộ trình`}
            </span>
            <span className="progress-track">
              <i style={{ width: m.percent + "%" }} />
            </span>
          </>
        ) : (
          <span className="not-started">Chưa bắt đầu</span>
        )}
      </div>
      <div className="card-footer">
        <span>
          <Clock size={14} />
          {l.minutes} phút
        </span>
        <Link
          to={`/lessons/${l.id}/${state.progress.find((p) => p.lessonId === l.id)?.section ?? "explain"}`}
        >
          {m.started ? "Tiếp tục học" : "Bắt đầu học"}
          <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}
function Library({ bookmarksOnly = false }: { bookmarksOnly?: boolean }) {
  const {
    catalog: { topics, lessons },
    state,
  } = useStore();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "",
    topic = params.get("topic") ?? "",
    level = params.get("level") ?? "",
    status = params.get("status") ?? "";
  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .toLowerCase();
  const filtered = lessons.filter((l) => {
    const m = metrics(l, state);
    return (
      (!bookmarksOnly || state.bookmarks.some((b) => b.lessonId === l.id)) &&
      (!topic || l.topicId === topic) &&
      (!level || l.level === level) &&
      (!status ||
        (status === "new"
          ? !m.started
          : status === "complete"
            ? m.complete
            : m.started && !m.complete)) &&
      norm([l.title, l.description, ...l.tags].join(" ")).includes(norm(query))
    );
  });
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">THƯ VIỆN KIẾN THỨC</div>
          <h1>{bookmarksOnly ? "Bài học yêu thích" : "Khám phá bài học"}</h1>
          <p>Chọn một vấn đề. Hiểu đến tận cơ chế.</p>
        </div>
        <span className="personal-badge">
          <BookOpen size={17} />
          {filtered.length} bài học
        </span>
      </div>
      <div className="filter-panel">
        <label className="library-search">
          <Search size={19} />
          <input
            value={query}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Tìm tiêu đề, mô tả hoặc tag…"
            aria-label="Tìm bài học"
          />
        </label>
        <div className="filters">
          <label>
            Chủ đề
            <select
              aria-label="Chủ đề"
              value={topic}
              onChange={(e) => set("topic", e.target.value)}
            >
              <option value="">Tất cả chủ đề</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                  {lessons.some((l) => l.topicId === t.id) ? "" : " · Sắp có"}
                </option>
              ))}
            </select>
          </label>
          <label>
            Mức độ
            <select
              aria-label="Mức độ"
              value={level}
              onChange={(e) => set("level", e.target.value)}
            >
              <option value="">Tất cả mức độ</option>
              <option>Cốt lõi</option>
              <option>Trung cấp</option>
            </select>
          </label>
          <label>
            Trạng thái
            <select
              aria-label="Trạng thái"
              value={status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="new">Chưa bắt đầu</option>
              <option value="learning">Đang học</option>
              <option value="complete">Hoàn thành lộ trình</option>
            </select>
          </label>
          <button className="btn subtle" onClick={() => setParams({})}>
            Xóa bộ lọc
          </button>
        </div>
      </div>
      {filtered.length ? (
        <div className="library-grid">
          {filtered.map((l) => (
            <div key={l.id}>
              <LessonCard lesson={l} />
              <div className="prereq">
                <strong>Trước khi học:</strong> {l.prerequisites.join(" · ")}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">
          <Search size={30} />
          <h2>
            {topic && !lessons.some((l) => l.topicId === topic)
              ? "Chủ đề này sắp có bài học"
              : "Chưa tìm thấy bài phù hợp"}
          </h2>
          <p>
            {bookmarksOnly
              ? "Đánh dấu biểu tượng yêu thích trên bài học để lưu vào đây."
              : "Thử từ khóa ngắn hơn hoặc bỏ bớt bộ lọc."}
          </p>
          <button className="btn" onClick={() => setParams({})}>
            Xóa bộ lọc
          </button>
          {bookmarksOnly && (
            <Link className="text-link" to="/lessons">
              Khám phá bài học <ArrowRight size={16} />
            </Link>
          )}
        </div>
      )}
    </>
  );
}
function Review() {
  const {
    catalog: { lessons, topics },
    state,
  } = useStore();
  const [queue] = useState(() => pendingReview(state.attempts)),
    [topic, setTopic] = useState("");
  const questions = queue.filter(
    (a) =>
      !topic || lessons.find((l) => l.id === a.lessonId)?.topicId === topic,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">BIẾN LỖI SAI THÀNH HIỂU BIẾT</div>
          <h1>Ôn tập kiến thức</h1>
          <p>
            Trả lời lại trước khi xem giải thích. Mọi lần làm đều được giữ lại.
          </p>
        </div>
        <span className="personal-badge">
          <RotateCcw size={17} />
          {pendingReview(state.attempts).length} câu còn cần ôn
        </span>
      </div>
      <div className="info-banner">
        <Lightbulb size={21} />
        <p>
          Trả lời đúng sẽ gỡ câu khỏi danh sách cần ôn. Điều đó chưa chứng minh
          bạn đã thành thạo — hãy giải thích được vì sao các lựa chọn còn lại
          sai.
        </p>
      </div>
      <label className="inline-filter">
        Chủ đề
        <select
          aria-label="Chủ đề"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option value="">Tất cả chủ đề</option>
          {topics
            .filter((t) => lessons.some((l) => l.topicId === t.id))
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
        </select>
      </label>
      {questions.length ? (
        <div className="review-list">
          {questions.map((a, i) => {
            const l = lessons.find((l) => l.id === a.lessonId)!;
            const q = l.questions.find((q) => q.id === a.questionId)!;
            return (
              <QuizCard key={q.id} lesson={l} question={q} index={i} review />
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <span className="empty-icon">
            <Check size={28} />
          </span>
          <h2>Không có câu cần ôn trong mục này</h2>
          <p>
            Bạn có thể làm câu hỏi trong từng bài để kiểm tra lại kiến thức.
          </p>
          <Link className="btn primary" to="/lessons">
            Khám phá bài học <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </>
  );
}
function ProgressPage() {
  const {
    catalog: { lessons },
    state,
  } = useStore();
  const pending = pendingReview(state.attempts);
  const latest = latestAttempts(state.attempts);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">NHÌN LẠI ĐỂ TIẾN XA HƠN</div>
          <h1>Tiến độ của tôi</h1>
          <p>
            Mỗi loại hoạt động là một tín hiệu riêng, không phải thước đo thành
            thạo.
          </p>
        </div>
      </div>
      <div className="info-banner">
        <Target size={21} />
        <p>
          “Hoàn thành lộ trình” nghĩa là đã đánh dấu đọc, trả lời đúng gần nhất
          5/5 câu và tự đánh giá 3/3 bài tập. Ứng dụng không tự chấm code hay
          gắn nhãn “hiểu sâu”.
        </p>
      </div>
      <div className="progress-list">
        {lessons.map((l) => {
          const m = metrics(l, state),
            wrong = pending.filter((a) => a.lessonId === l.id).length;
          return (
            <article className="progress-panel" key={l.id}>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">{topicName(l.topicId)}</span>
                  <h2>{l.shortTitle}</h2>
                </div>
                <span className={`pill ${m.complete ? "success" : ""}`}>
                  {m.complete
                    ? "Hoàn thành lộ trình"
                    : m.started
                      ? "Đang học"
                      : "Chưa bắt đầu"}
                </span>
              </div>
              <div className="progress-track large">
                <i style={{ width: m.percent + "%" }} />
              </div>
              <div className="progress-details">
                <div>
                  <BookOpen size={18} />
                  <span>
                    Đã đọc
                    <strong>
                      {m.read ? "Đã đánh dấu đọc" : "Chưa đánh dấu"}
                    </strong>
                  </span>
                </div>
                <div>
                  <Target size={18} />
                  <span>
                    Trắc nghiệm gần nhất
                    <strong>{m.correct} / 5 câu đúng</strong>
                  </span>
                </div>
                <div>
                  <Code2 size={18} />
                  <span>
                    Tự đánh giá bài tập<strong>{m.assessed} / 3 bài</strong>
                  </span>
                </div>
                <div>
                  <RotateCcw size={18} />
                  <span>
                    Còn cần ôn<strong>{wrong} câu hỏi</strong>
                  </span>
                </div>
              </div>
              <AppLink
                lesson={l}
                label={m.started ? "Quay lại bài học" : "Bắt đầu học"}
              />
            </article>
          );
        })}
      </div>
      <section className="history-panel">
        <div className="section-heading">
          <div>
            <h2>Lịch sử làm trắc nghiệm</h2>
            <p>
              {state.attempts.length} lần trả lời ·{" "}
              {latest.filter((a) => a.correct).length}/15 câu đúng ở lần gần
              nhất
            </p>
          </div>
        </div>
        {!state.attempts.length ? (
          <p className="muted">
            Lịch sử sẽ xuất hiện khi bạn gửi câu trả lời đầu tiên.
          </p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Câu hỏi</th>
                  <th>Đã chọn</th>
                  <th>Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {[...state.attempts].reverse().map((a) => {
                  const l = lessons.find((l) => l.id === a.lessonId)!,
                    q = l.questions.find((q) => q.id === a.questionId)!;
                  return (
                    <tr key={a.id}>
                      <td>{new Date(a.createdAt).toLocaleString("vi-VN")}</td>
                      <td>
                        <Link to={`/lessons/${l.id}/quiz`}>{q.prompt}</Link>
                      </td>
                      <td>
                        {q.options.find((o) => o.id === a.optionId)?.text}
                      </td>
                      <td>
                        <span
                          className={`result-text ${a.correct ? "correct" : "incorrect"}`}
                        >
                          {a.correct ? "✓ Đúng" : "✕ Cần ôn"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
