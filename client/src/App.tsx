import { SectionBody } from "./Content";
import { Paths, Guide } from "./Paths";
import { useEffect, useRef, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Code2,
  Layers,
  List,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import {
  curriculum,
  matchSnippet,
  searchLessons,
  type Lesson,
  questionsOf,
  byId,
  orderedLessons,
  orderLabels,
  type ReadOrder,
} from "./theory";
const { categories, lessons, parts } = curriculum;
const categoryOf = (id: string) => categories.find((c) => c.id === id)!;
const two = (n: number) => String(n).padStart(2, "0");
function preference(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
export default function App() {
  const location = useLocation(),
    navigate = useNavigate();
  const [dark, setDark] = useState(
    () => preference("ddl-reading-theme", "light") === "dark",
  );
  const [menu, setMenu] = useState(false),
    [query, setQuery] = useState("");
  const search = useRef<HTMLInputElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const [mobile, setMobile] = useState(
    () => window.matchMedia("(max-width:760px)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(max-width:760px)");
    const update = () => setMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!menu || !mobile) return;
    sidebar.current?.querySelector<HTMLElement>("a")?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = sidebar.current?.querySelectorAll<HTMLElement>("a,button");
      if (!items?.length) return;
      const first = items[0],
        last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      menuButton.current?.focus();
    };
  }, [menu, mobile]);
  const activeLesson = lessons.find(
    (l) => location.pathname === `/read/${l.id}`,
  );
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem("ddl-reading-theme", dark ? "dark" : "light");
    } catch {
      /* Reading works without storage. */
    }
  }, [dark]);
  useEffect(() => {
    setMenu(false);
    document.title = activeLesson
      ? `${activeLesson.title} · DotNet Deep Learn`
      : "DotNet Deep Learn · Thư viện lý thuyết";
    if (location.hash)
      requestAnimationFrame(() => {
        const h = document.getElementById(location.hash.slice(1));
        h?.scrollIntoView();
        h?.focus({ preventScroll: true });
      });
    else window.scrollTo(0, 0);
  }, [location.pathname, location.hash, activeLesson]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        search.current?.focus();
      }
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
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
      <button
        className={`menu-scrim ${menu ? "visible" : ""}`}
        onClick={() => setMenu(false)}
        aria-label="Đóng mục lục"
        tabIndex={menu ? 0 : -1}
      />
      <aside
        ref={sidebar}
        className={`sidebar ${menu ? "is-open" : ""}`}
        aria-label="Mục lục thư viện"
        inert={mobile && !menu}
        role={mobile && menu ? "dialog" : undefined}
        aria-modal={mobile && menu ? true : undefined}
      >
        <button
          className="icon-button sidebar-close"
          aria-label="Đóng mục lục bên"
          onClick={() => setMenu(false)}
        >
          <X size={18} />
        </button>
        <Link className="brand" to="/">
          <span className="brand-mark">
            d<span>.</span>
          </span>
          <span>
            DotNet <b>Deep Learn</b>
            <small>SỔ TAY CÔNG NGHỆ</small>
          </span>
        </Link>
        <div className="sidebar-body">
          <div className="sidebar-label">KHÔNG GIAN ĐỌC</div>
          <Link
            className={`side-top ${location.pathname === "/" ? "selected" : ""}`}
            to="/"
          >
            <BookOpen size={17} />
            Thư viện kiến thức<span>{lessons.length}</span>
          </Link>
          <Link
            className={`side-top ${location.pathname === "/sources" ? "selected" : ""}`}
            to="/sources"
          >
            <Layers size={17} />
            Theo bài giảng<span>{parts.length}</span>
          </Link>
          <Link
            className={`side-top ${location.pathname === "/paths/foundation" ? "selected" : ""}`}
            to="/paths/foundation"
          >
            <BookOpen size={17} />
            Học nền tảng
          </Link>
          <Link
            className={`side-top ${location.pathname === "/paths/interview" ? "selected" : ""}`}
            to="/paths/interview"
          >
            <Layers size={17} />
            Ôn phỏng vấn
          </Link>
          <Link
            className={`side-top ${location.pathname === "/guide" ? "selected" : ""}`}
            to="/guide"
          >
            <Code2 size={17} />
            Chạy mẫu & debug
          </Link>
          <div className="sidebar-label syllabus-label">CHỦ ĐỀ</div>
          <nav aria-label="Chủ đề kiến thức">
            {categories.map((c) => (
              <div className="side-category" key={c.id}>
                <Link
                  className={`category-link ${activeLesson?.category === c.id ? "active" : ""}`}
                  to={`/?category=${c.id}`}
                >
                  <span className="category-index">{c.symbol}</span>
                  <span>{c.title}</span>
                  <ChevronRight size={13} />
                </Link>
                {activeLesson?.category === c.id && (
                  <div className="side-articles">
                    {lessons
                      .filter((l) => l.category === c.id)
                      .map((l) => (
                        <Link
                          key={l.id}
                          className={l.id === activeLesson.id ? "current" : ""}
                          to={`/read/${l.id}`}
                          aria-current={
                            l.id === activeLesson.id ? "page" : undefined
                          }
                        >
                          {l.title}
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="sidebar-note">
            <span className="live-dot" />
            Hiểu bản chất. Đọc theo nhu cầu.
            <p>
              Khái niệm, cơ chế và ví dụ được giải thích ngay trong từng bài.
            </p>
          </div>
        </div>
        <div className="sidebar-bottom">
          <Code2 size={16} />
          <span>C# / .NET / Web</span>
          <span className="edition">02</span>
        </div>
      </aside>
      <div className="workspace" inert={mobile && menu}>
        <header className="topbar">
          <button
            ref={menuButton}
            className="icon-button mobile-menu"
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            aria-label="Mở mục lục"
          >
            {menu ? <X size={21} /> : <Menu size={21} />}
          </button>
          <div className="breadcrumb">
            <Link to="/">Thư viện</Link>
            <ChevronRight size={13} />
            <span>
              {activeLesson
                ? categoryOf(activeLesson.category).title
                : location.pathname === "/sources"
                  ? "Theo bài giảng"
                  : location.pathname.includes("/paths/")
                    ? "Lộ trình đọc"
                    : location.pathname === "/guide"
                      ? "Chạy mẫu & debug"
                      : "Tổng quan"}
            </span>
          </div>
          <form
            className="header-search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/?q=${encodeURIComponent(query)}`);
            }}
            role="search"
          >
            <Search size={16} />
            <input
              ref={search}
              aria-label="Tìm toàn bộ thư viện"
              placeholder="Tìm kiến thức…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>Ctrl K</kbd>
          </form>
          <button
            className="icon-button theme-button"
            onClick={() => setDark((v) => !v)}
            aria-label={dark ? "Giao diện sáng" : "Giao diện tối"}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>
        <main id="main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Library />} />
            <Route path="/read/:id" element={<Reader />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/paths/:mode" element={<Paths />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/lessons/:id/:section?" element={<LegacyLink />} />
            <Route path="/lessons" element={<Navigate to="/" replace />} />
            {["review", "progress", "data", "bookmarks"].map((p) => (
              <Route
                key={p}
                path={`/${p}`}
                element={<Navigate to="/" replace />}
              />
            ))}
            <Route path="*" element={<Missing />} />
          </Routes>
        </main>
        <footer className="footer">
          <span>
            DotNet Deep Learn <span className="footer-dot">/</span> Thư viện lý
            thuyết
          </span>
          <Link to="/sources">
            Nguồn & phạm vi nội dung
            <ArrowRight size={13} />
          </Link>
        </footer>
      </div>
    </>
  );
}
function LegacyLink() {
  const { id } = useParams();
  return (
    <Navigate
      to={lessons.some((l) => l.id === id) ? `/read/${id}` : "/"}
      replace
    />
  );
}
function Library() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "",
    category = params.get("category") ?? "",
    origin = params.get("origin") ?? "",
    filtered = searchLessons(query, category, origin);
  const set = (key: string, value: string) => {
    const p = new URLSearchParams(params);
    if (value) p.set(key, value);
    else p.delete(key);
    setParams(p, { replace: true });
  };
  return (
    <div className="library page-pad">
      {!query && !category && !origin && (
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span />
              THƯ VIỆN LÝ THUYẾT .NET
            </div>
            <h1>
              Hiểu công nghệ.
              <br />
              <em>Từ gốc đến cách dùng.</em>
            </h1>
            <p>
              Một nơi để đọc thật rõ: công nghệ là gì, vì sao tồn tại,
              <br className="wide-break" /> hoạt động ra sao và khi nào nên
              dùng.
            </p>
            <Link className="button-primary" to="/paths/foundation">
              Học nền tảng
              <ArrowRight size={17} />
            </Link>
            <Link className="text-button" to="/paths/interview">
              Ôn phỏng vấn
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="stack-map" aria-label="Bản đồ vai trò công nghệ">
            <div className="map-label">
              NHÌN ĐÚNG VAI TRÒ<span>01 — 05</span>
            </div>
            {[
              ["C#", "Ngôn ngữ"],
              [".NET", "Nền tảng & runtime"],
              ["ASP.NET Core", "Framework web"],
              ["EF Core", "Thư viện ORM"],
              ["SQL Server", "Database"],
            ].map(([name, role], i) => (
              <div className="stack-layer" key={name}>
                <span className="stack-number">{two(i + 1)}</span>
                <strong>{name}</strong>
                <span>{role}</span>
              </div>
            ))}
            <div className="map-caption">
              Mỗi thành phần, một nhiệm vụ riêng.
            </div>
          </div>
        </section>
      )}
      <div className="library-stats">
        <div>
          <b>{lessons.length}</b>
          <span>bài lý thuyết</span>
        </div>
        <div>
          <b>{parts.length}</b>
          <span>phần bài giảng</span>
        </div>
        <div>
          <b>{lessons.filter((l) => l.origin === "extension").length}</b>
          <span>bài mở rộng phỏng vấn</span>
        </div>
        <div className="stats-note">
          <BookOpen size={17} />
          <span>
            {lessons.reduce((n, l) => n + questionsOf(l).length, 0)} câu hỏi có
            đáp án để tự đối chiếu.
          </span>
        </div>
      </div>
      <section id="catalog" className="catalog">
        <div className="section-heading">
          <div>
            <div className="eyebrow">TỪNG KHÁI NIỆM, HIỂU ĐẾN NƠI</div>
            <h2>
              {category
                ? (categories.find((c) => c.id === category)?.title ??
                  "Thư viện kiến thức")
                : "Thư viện kiến thức"}
            </h2>
          </div>
          <span className="result-count" role="status">
            {filtered.length} bài viết
          </span>
        </div>
        <label className="catalog-search">
          <Search size={20} />
          <input
            value={query}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Bạn muốn hiểu điều gì? Thử: async, database, đa hình…"
            aria-label="Tìm trong nội dung bài viết"
          />
          {query && (
            <button aria-label="Xóa từ khóa" onClick={() => set("q", "")}>
              <X size={17} />
            </button>
          )}
        </label>
        <div className="filter-chips" aria-label="Lọc theo chủ đề">
          <button
            aria-pressed={!category}
            className={!category ? "chosen" : ""}
            onClick={() => set("category", "")}
          >
            Tất cả<span>{lessons.length}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              aria-pressed={category === c.id}
              className={category === c.id ? "chosen" : ""}
              onClick={() => set("category", c.id)}
            >
              {c.title}
            </button>
          ))}
        </div>
        <div className="origin-filter" aria-label="Lọc nguồn nội dung">
          {[
            ["", "Toàn bộ"],
            ["lecture", "Trong bài giảng"],
            ["extension", "Mở rộng để ôn phỏng vấn"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={origin === value ? "chosen" : ""}
              aria-pressed={origin === value}
              onClick={() => set("origin", value)}
            >
              {label}
            </button>
          ))}
        </div>
        {query && (
          <p className="search-info">
            Kết quả trong toàn bộ nội dung cho “{query}”.
          </p>
        )}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Search size={30} />
            <h3>Chưa tìm thấy nội dung phù hợp</h3>
            <p>Thử từ khóa khác hoặc xem toàn bộ thư viện.</p>
            <button className="button-primary" onClick={() => setParams({})}>
              Xóa bộ lọc
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="catalog-groups">
            {categories
              .filter((c) => filtered.some((l) => l.category === c.id))
              .map((c) => (
                <section className="topic-group" key={c.id}>
                  <div className="topic-heading">
                    <span className="topic-symbol">{c.symbol}</span>
                    <div>
                      <h3>{c.title}</h3>
                      <p>{c.description}</p>
                    </div>
                    <span>
                      {filtered.filter((l) => l.category === c.id).length} bài
                    </span>
                  </div>
                  <div className="article-grid">
                    {filtered
                      .filter((l) => l.category === c.id)
                      .map((l) => (
                        <Link
                          key={l.id}
                          className="article-card"
                          to={`/read/${l.id}`}
                        >
                          <div className="card-meta">
                            <span>{l.kind}</span>
                            <span>
                              {l.origin === "extension"
                                ? "Mở rộng phỏng vấn"
                                : `Phần ${l.sourceParts.join(", ")}`}
                            </span>
                          </div>
                          <h4>{l.title}</h4>
                          <p>
                            {query ? matchSnippet(l, query) : l.description}
                          </p>
                          <div className="card-bottom">
                            <span>
                              {l.sections.length} mục · ~{l.minutes} phút
                            </span>
                            <span>
                              Đọc bài
                              <ArrowRight size={15} />
                            </span>
                          </div>
                        </Link>
                      ))}
                  </div>
                </section>
              ))}
          </div>
        )}
      </section>
      <section className="reading-method">
        <div className="eyebrow">MỘT BÀI VIẾT, BA LỚP KIẾN THỨC</div>
        <div>
          {[
            [
              "01",
              "Hiểu đúng bản chất",
              "Là gì, giải quyết vấn đề nào, ưu điểm và giới hạn.",
            ],
            [
              "02",
              "Nhìn vào bên trong",
              "Cơ chế hoạt động, khái niệm cốt lõi và các kết nối.",
            ],
            [
              "03",
              "Biết cách bắt đầu",
              "Ví dụ tối thiểu, tổ chức project, debug và tài liệu.",
            ],
          ].map(([n, title, text]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
function Reader() {
  const { id } = useParams();
  const l = byId.get(id ?? "");
  const [params, setParams] = useSearchParams();
  const [large, setLarge] = useState(false),
    [active, setActive] = useState("identity");
  useEffect(() => {
    setActive(l?.sections[0].id ?? "identity");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    document
      .querySelectorAll(".article-section")
      .forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [id, l]);
  if (!l) return <Missing />;
  const requested = params.get("order") as ReadOrder;
  const order: ReadOrder =
    requested in orderLabels &&
    !(requested === "lecture" && l.origin === "extension")
      ? requested
      : l.origin === "lecture"
        ? "lecture"
        : "topic";
  const sequence = orderedLessons(l, order),
    index = sequence.findIndex((x) => x.id === l.id),
    cat = categoryOf(l.category);
  const lessonLink = (lesson: Lesson) =>
    `/read/${lesson.id}?order=${order}${order === "interview" ? "#questions" : ""}`;
  return (
    <div className={`reader-layout page-pad ${large ? "large-type" : ""}`}>
      <article className="reader-article">
        <Link className="back-link" to={`/?category=${l.category}`}>
          <ArrowLeft size={15} />
          {cat.title}
        </Link>
        <header className="article-header">
          <div className="eyebrow">
            <span />
            {l.auditCode} ·{" "}
            {l.origin === "extension"
              ? "MỞ RỘNG ĐỂ ÔN PHỎNG VẤN"
              : `PHẦN ${l.sourceParts.join(", ")} TRONG BÀI GIẢNG`}
          </div>
          <div className="article-kind">{l.kind}</div>
          <h1>{l.title}</h1>
          <p className="article-deck">{l.description}</p>
          <div className="article-facts">
            <span>
              <BookOpen size={15} />
              {l.sections.length} mục giải thích
            </span>
            <span>Khoảng {l.minutes} phút đọc</span>
            <span>{questionsOf(l).length} câu hỏi đối chiếu</span>
            <button
              aria-pressed={large}
              onClick={() => setLarge((v) => !v)}
              aria-label="Tăng cỡ chữ bài viết"
            >
              A<span className="larger-a">A</span>
            </button>
          </div>
          <details className="version-context">
            <summary>Bối cảnh phiên bản · rà soát {l.reviewedAt}</summary>
            <p>
              SDK {l.version.sdk} · {l.version.framework} · {l.version.language}{" "}
              · runtime/ASP.NET Core {l.version.runtime}. EF Core{" "}
              {l.version.efCore} khi bài dùng EF; xUnit {l.version.xunit}, Test
              SDK {l.version.testSdk}, runner {l.version.xunitRunner} khi bài
              dùng test. Phiên bản ổn định được ghi rõ cho các mẫu, không dùng
              preview.
            </p>
            <Link to="/guide">Cách dựng môi trường và giới hạn kiểm chứng</Link>
          </details>
        </header>
        <div className="learning-goals">
          <span>ĐỌC XONG, BẠN CÓ THỂ</span>
          <ul>
            {l.goals.map((goal) => (
              <li key={goal}>{goal}</li>
            ))}
          </ul>
        </div>
        <div className="prerequisite">
          <span>TRƯỚC KHI ĐỌC</span>
          <p>{l.prerequisites.join(" · ")}</p>
          {l.prerequisiteIds.length > 0 && (
            <div className="related-links">
              {l.prerequisiteIds.map((id) => (
                <Link key={id} to={`/read/${id}`}>
                  {byId.get(id)!.title}
                  <ArrowRight size={13} />
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="reading-order">
          <label htmlFor="reading-order">Bài trước / tiếp theo đi theo</label>
          <select
            id="reading-order"
            value={order}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              next.set("order", e.target.value);
              setParams(next, { replace: true });
            }}
          >
            {Object.entries(orderLabels)
              .filter(([key]) => key !== "lecture" || l.origin === "lecture")
              .map(([key, label]) => (
                <option value={key} key={key}>
                  {label}
                </option>
              ))}
          </select>
        </div>
        <details className="mobile-toc">
          <summary>
            <List size={17} />
            Trong bài này
            <ChevronDown size={16} />
          </summary>
          <Toc lesson={l} active={active} />
        </details>
        {l.sections.map((section, i) => (
          <section
            key={section.id}
            id={section.id}
            className="article-section"
            tabIndex={-1}
          >
            <div className="section-kicker">
              {i === 0 || l.sections[i - 1].group !== section.group
                ? section.group
                : ""}
            </div>
            <h2>
              <span>{two(i + 1)}</span>
              {section.title}
            </h2>
            <SectionBody section={section} />
          </section>
        ))}
        {l.relatedIds.length > 0 && (
          <section className="related-reading">
            <h2>Đọc nối tiếp theo khái niệm</h2>
            <div className="related-links">
              {l.relatedIds.map((id) => (
                <Link key={id} to={`/read/${id}`}>
                  {byId.get(id)!.title}
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </section>
        )}
        <div className="article-end">
          <BookOpen size={20} />
          <p>
            Bạn vừa đọc <strong>{l.title}</strong>.<br />
            Có thể mở lại bất kỳ mục nào khi cần tra cứu.
          </p>
        </div>
        <p className="pagination-order">
          Đang đi theo: <strong>{orderLabels[order]}</strong> · {index + 1}/
          {sequence.length} bài
        </p>
        <nav className="article-pagination" aria-label="Bài liền kề">
          {index > 0 ? (
            <Link to={lessonLink(sequence[index - 1])}>
              <span>
                <ArrowLeft size={14} />
                Bài trước
              </span>
              <strong>{sequence[index - 1].title}</strong>
            </Link>
          ) : (
            <span />
          )}
          {index >= 0 && index < sequence.length - 1 && (
            <Link to={lessonLink(sequence[index + 1])}>
              <span>
                Bài tiếp theo
                <ArrowRight size={14} />
              </span>
              <strong>{sequence[index + 1].title}</strong>
            </Link>
          )}
        </nav>
      </article>
      <aside className="desktop-toc">
        <div className="toc-inner">
          <div className="sidebar-label">
            TRONG BÀI NÀY · {l.sections.length} MỤC
          </div>
          <Toc lesson={l} active={active} />
          <div className="toc-foot">
            {orderLabels[order]}
            <br />
            <Link to="/guide">Hướng dẫn chạy mẫu</Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
function Toc({ lesson, active }: { lesson: Lesson; active: string }) {
  const location = useLocation();
  return (
    <nav aria-label="Các mục trong bài">
      {lesson.sections.map((section, i) => (
        <Link
          key={section.id}
          to={`/read/${lesson.id}${location.search}#${section.id}`}
          className={section.id === active ? "toc-active" : ""}
          aria-current={section.id === active ? "location" : undefined}
        >
          <span>{two(i + 1)}</span>
          {section.title}
        </Link>
      ))}
    </nav>
  );
}
function Sources() {
  return (
    <div className="sources page-pad">
      <div className="eyebrow">ĐỌC CÓ NGUỒN, HỌC CÓ BỐI CẢNH</div>
      <h1>Theo bài giảng của thầy</h1>
      <p className="page-intro">
        {lessons.filter((l) => l.origin === "lecture").length} bài trong bài
        giảng được sắp từ {parts.length} phần trong tài liệu{" "}
        <strong>{curriculum.sourceDocument}</strong>. Thêm{" "}
        {lessons.filter((l) => l.origin === "extension").length} bài mở rộng để
        ôn phỏng vấn, được đánh dấu riêng và không gán số phần bài giảng.
      </p>
      <div className="source-note">
        <BookOpen size={22} />
        <div>
          <h2>Phạm vi & cách biên soạn</h2>
          <p>{curriculum.sourceNote}</p>
          <p>
            Các công nghệ được nhắc chung như C#, Visual Studio, unit test,
            factory, decorator và SQL có bài riêng. Những phần server tổng hợp
            được chuyển thành giải thích cơ chế HTTP. Tài liệu chính thức và
            cộng đồng nằm cuối từng bài.
          </p>
        </div>
      </div>
      <h2 className="coverage-heading">Đối chiếu đủ 41 phần</h2>
      <div className="coverage-list">
        {parts.map((p) => (
          <section key={p.number}>
            <span className="coverage-number">{two(p.number)}</span>
            <div>
              <h3>{p.title}</h3>
              {p.lessons.map((id) => (
                <Link key={id} to={`/read/${id}`}>
                  {lessons.find((l) => l.id === id)?.title}
                  <ArrowRight size={15} />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <h2 className="coverage-heading">Mở rộng để ôn phỏng vấn</h2>
      <p>
        Các bài N01–N12 bổ sung kiến thức theo yêu cầu rà soát; không được coi
        là phần thầy đã dạy.
      </p>
      <div className="extension-list">
        {lessons
          .filter((l) => l.origin === "extension")
          .map((l) => (
            <Link key={l.id} to={`/read/${l.id}`}>
              <span>{l.auditCode}</span>
              {l.title}
              <ArrowRight size={15} />
            </Link>
          ))}
      </div>
    </div>
  );
}
function Missing() {
  return (
    <div className="empty-state page-pad">
      <BookOpen size={35} />
      <h1>Chưa có bài viết này</h1>
      <p>Mở thư viện để tìm một kiến thức theo tên hoặc chủ đề.</p>
      <Link className="button-primary" to="/">
        Về thư viện
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
