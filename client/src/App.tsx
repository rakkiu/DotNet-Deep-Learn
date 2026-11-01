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
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  ExternalLink,
  Layers,
  List,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-json";
import {
  curriculum,
  matchSnippet,
  searchLessons,
  type Lesson,
  type Section,
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
    filtered = searchLessons(query, category);
  const set = (key: string, value: string) => {
    const p = new URLSearchParams(params);
    if (value) p.set(key, value);
    else p.delete(key);
    setParams(p, { replace: true });
  };
  return (
    <div className="library page-pad">
      {!query && !category && (
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
            <Link className="button-primary" to="/read/dotnet-first-program">
              Bắt đầu với .NET
              <ArrowRight size={17} />
            </Link>
            <a
              className="text-button"
              href="#catalog"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("catalog")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Khám phá thư viện
              <ArrowDown size={15} />
            </a>
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
          <b>11</b>
          <span>góc nhìn mỗi bài</span>
        </div>
        <div className="stats-note">
          <BookOpen size={17} />
          <span>Đọc theo thứ tự hoặc mở ngay điều bạn cần.</span>
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
                            <span>Phần {l.sourceParts.join(", ")}</span>
                          </div>
                          <h4>{l.title}</h4>
                          <p>
                            {query ? matchSnippet(l, query) : l.description}
                          </p>
                          <div className="card-bottom">
                            <span>11 mục giải thích</span>
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
  const { id } = useParams(),
    l = lessons.find((x) => x.id === id);
  const [large, setLarge] = useState(false),
    [active, setActive] = useState("identity");
  useEffect(() => {
    setActive("identity");
    const observer = new IntersectionObserver(
      (entries) => {
        const v = entries.filter((e) => e.isIntersecting);
        if (v.length) setActive(v[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    document
      .querySelectorAll(".article-section")
      .forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [id]);
  if (!l) return <Missing />;
  const index = lessons.indexOf(l),
    cat = categoryOf(l.category);
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
            PHẦN {l.sourceParts.join(", ")} TRONG BÀI GIẢNG
          </div>
          <div className="article-kind">{l.kind}</div>
          <h1>{l.title}</h1>
          <p className="article-deck">{l.description}</p>
          <div className="article-facts">
            <span>
              <BookOpen size={15} />
              11 mục giải thích
            </span>
            <span>Khoảng {l.minutes} phút đọc</span>
            <button
              aria-pressed={large}
              onClick={() => setLarge((v) => !v)}
              aria-label="Tăng cỡ chữ bài viết"
            >
              A<span className="larger-a">A</span>
            </button>
          </div>
        </header>
        <div className="prerequisite">
          <span>TRƯỚC KHI ĐỌC</span>
          <p>{l.prerequisites.join(" · ")}</p>
        </div>
        <details className="mobile-toc">
          <summary>
            <List size={17} />
            Trong bài này
            <ChevronDown size={16} />
          </summary>
          <Toc lesson={l} active={active} />
        </details>
        {l.sections.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            className="article-section"
            tabIndex={-1}
          >
            <div className="section-kicker">
              {i === 0 || l.sections[i - 1].group !== s.group ? s.group : ""}
            </div>
            <h2>
              <span>{two(i + 1)}</span>
              {s.title}
            </h2>
            <SectionBody section={s} />
          </section>
        ))}
        <div className="article-end">
          <BookOpen size={20} />
          <p>
            Bạn vừa đọc <strong>{l.title}</strong>.<br />
            Có thể mở lại bất kỳ mục nào khi cần tra cứu.
          </p>
        </div>
        <nav className="article-pagination" aria-label="Bài liền kề">
          {index > 0 ? (
            <Link to={`/read/${lessons[index - 1].id}`}>
              <span>
                <ArrowLeft size={14} />
                Bài trước
              </span>
              <strong>{lessons[index - 1].title}</strong>
            </Link>
          ) : (
            <span />
          )}
          {index < lessons.length - 1 && (
            <Link to={`/read/${lessons[index + 1].id}`}>
              <span>
                Bài tiếp theo
                <ArrowRight size={14} />
              </span>
              <strong>{lessons[index + 1].title}</strong>
            </Link>
          )}
        </nav>
      </article>
      <aside className="desktop-toc">
        <div className="toc-inner">
          <div className="sidebar-label">TRONG BÀI NÀY</div>
          <Toc lesson={l} active={active} />
          <div className="toc-foot">
            Một kiến thức, nhìn từ bản chất
            <br />
            đến cách sử dụng.
          </div>
        </div>
      </aside>
    </div>
  );
}
function Toc({ lesson, active }: { lesson: Lesson; active: string }) {
  return (
    <nav aria-label="Các mục trong bài">
      {lesson.sections.map((s, i) => (
        <Link
          key={s.id}
          to={`/read/${lesson.id}#${s.id}`}
          className={s.id === active ? "toc-active" : ""}
          aria-current={s.id === active ? "location" : undefined}
        >
          <span>{two(i + 1)}</span>
          {s.title}
        </Link>
      ))}
    </nav>
  );
}
function SectionBody({ section: s }: { section: Section }) {
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
      {s.hello && (
        <>
          <p>{s.hello.note}</p>
          <CodeBlock
            code={s.hello.setup}
            language="shell"
            label="Terminal · khởi tạo"
          />
          <CodeBlock
            code={s.hello.code}
            language={s.hello.language}
            label={s.hello.file}
          />
          {Object.entries(s.hello.files).map(([name, code]) => (
            <CodeBlock
              key={name}
              code={code}
              language={name.endsWith("cshtml") ? "markup" : "csharp"}
              label={name}
            />
          ))}
          {s.hello.request && (
            <div className="request-example">
              <b>Request minh họa</b>
              <CodeBlock
                code={`${s.hello.request.method} http://localhost:5090${s.hello.request.path}${s.hello.request.body ? "\nContent-Type: application/json\n\n" + JSON.stringify(s.hello.request.body, null, 2) : ""}`}
                language="plain"
                label="HTTP"
              />
            </div>
          )}
          <div className="output">
            <span>KẾT QUẢ ĐƯỢC GIẢI THÍCH</span>
            <pre>{s.hello.output}</pre>
          </div>
          <ol className="explanation-steps">
            {s.hello.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </>
      )}
      {s.structure && (
        <>
          <CodeBlock
            code={s.structure.code}
            language="plain"
            label="Bố cục tham khảo"
          />
          <p>{s.structure.note}</p>
        </>
      )}
      {s.links && (
        <>
          <p>
            Đọc tài liệu chính thức để tra API, điều kiện sử dụng và khác biệt
            theo phiên bản. Khi gặp lỗi, kèm phiên bản SDK/package, thông báo
            lỗi và ví dụ tối thiểu để cộng đồng có đủ ngữ cảnh.
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
            <a href={s.community} target="_blank" rel="noreferrer">
              <span>
                <small>CỘNG ĐỒNG HỎI ĐÁP</small>Stack Overflow · chủ đề liên
                quan
              </span>
              <ExternalLink size={16} />
            </a>
          </div>
        </>
      )}
    </>
  );
}
function CodeBlock({
  code,
  language,
  label,
}: {
  code: string;
  language: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false),
    [error, setError] = useState(false),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const grammar = Prism.languages[language];
  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>
          <Code2 size={14} />
          {label}
        </span>
        <button
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
          aria-label={`Sao chép ${label}`}
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
        <div className="copy-error" role="status">
          Không truy cập được clipboard. Bạn có thể chọn đoạn mã để sao chép.
        </div>
      )}
    </div>
  );
}
function Sources() {
  return (
    <div className="sources page-pad">
      <div className="eyebrow">ĐỌC CÓ NGUỒN, HỌC CÓ BỐI CẢNH</div>
      <h1>Theo bài giảng của thầy</h1>
      <p className="page-intro">
        {lessons.length} bài lý thuyết được sắp từ {parts.length} phần trong tài
        liệu <strong>{curriculum.sourceDocument}</strong>.
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
