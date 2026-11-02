import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "./styles.css";
import "./upgrade.css";
import "./oop.css";
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
      <main className="empty-state">
        <h1>Không thể hiển thị trang</h1>
        <p>Vui lòng tải lại để mở thư viện.</p>
        <button className="button-primary" onClick={() => location.reload()}>
          Tải lại trang
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Boundary>
      <HashRouter>
        <App />
      </HashRouter>
    </Boundary>
  </React.StrictMode>,
);
