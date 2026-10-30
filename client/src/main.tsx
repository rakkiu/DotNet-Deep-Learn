import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { BookOpen, RefreshCw } from "lucide-react";
import { StoreProvider } from "./store";
import { learningStorage } from "./storage";
import { BackupTools } from "./DataPage";
import type { State } from "./types";
import App from "./App";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/be-vietnam-pro/800.css";
import "./styles.css";
function Bootstrap() {
  const [data, setData] = useState<State>(),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    Promise.resolve()
      .then(() => learningStorage.load())
      .then((state) => {
        if (active) setData(state);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [retry]);
  if (error)
    return (
      <main className="startup">
        <BookOpen size={40} />
        <h1>Chưa tải được không gian học</h1>
        <p role="alert">{error}</p>
        <p>
          Dữ liệu hiện có chưa bị xóa. Cho phép bộ nhớ cục bộ hoặc khôi phục từ
          bản sao lưu.
        </p>
        <BackupTools
          onRestore={(state) => {
            learningStorage.save(state);
            setData(state);
            setError("");
          }}
        />
        <button className="btn primary" onClick={() => setRetry((r) => r + 1)}>
          <RefreshCw size={16} />
          Thử lại
        </button>
      </main>
    );
  if (!data)
    return (
      <main className="startup" role="status">
        <BookOpen className="pulse" size={40} />
        <h1>Đang mở không gian học…</h1>
        <p>Chuẩn bị nội dung và tiến độ của bạn.</p>
      </main>
    );
  return (
    <StoreProvider initial={data}>
      <HashRouter>
        <App />
      </HashRouter>
    </StoreProvider>
  );
}
class Boundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="startup">
        <h1>Không thể hiển thị trang</h1>
        <p>Vui lòng tải lại. Dữ liệu đã lưu vẫn nằm trong trình duyệt này.</p>
        <button className="btn primary" onClick={() => location.reload()}>
          Tải lại
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById("root")!).render(
  <Boundary>
    <Bootstrap />
  </Boundary>,
);
