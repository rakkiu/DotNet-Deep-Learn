import { useState } from "react";
import { Download, Upload, HardDrive, ShieldCheck } from "lucide-react";
import type { State } from "./types";
import { parseBackup, serializeBackup, STORAGE_KEY } from "./storage";
import { useStore } from "./store";
function download(text: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function BackupTools({
  state,
  onRestore,
}: {
  state?: State;
  onRestore: (state: State) => void;
}) {
  const [pending, setPending] = useState<State>(),
    [filename, setFilename] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  return (
    <section className="backup-tools">
      <div className="backup-actions">
        <button
          className="btn primary"
          onClick={() => {
            setError("");
            try {
              const text = state
                ? serializeBackup(state)
                : localStorage.getItem(STORAGE_KEY);
              if (!text) throw new Error("Chưa có dữ liệu để xuất.");
              download(text, "dotnet-deep-learn-backup.json");
              setMessage("Đã tạo tệp sao lưu. Giữ tệp này ở nơi riêng tư.");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <Download size={17} />
          {state ? "Xuất bản sao lưu" : "Tải dữ liệu hiện có để khôi phục"}
        </button>
        <label className="import-label">
          Nhập tệp sao lưu JSON
          <input
            type="file"
            accept="application/json,.json"
            aria-label="Nhập tệp sao lưu JSON"
            onChange={async (e) => {
              setError("");
              setMessage("");
              setPending(undefined);
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                if (file.size > 5 * 1024 * 1024)
                  throw new Error(
                    "Tệp vượt quá 5 MB. Vui lòng chọn tệp sao lưu nhỏ hơn.",
                  );
                const candidate = parseBackup(await file.text());
                setPending(candidate);
                setFilename(file.name);
              } catch (err) {
                setError((err as Error).message);
              } finally {
                e.target.value = "";
              }
            }}
          />
        </label>
      </div>
      {pending && (
        <div className="import-preview">
          <h3>
            <Upload size={18} /> Kiểm tra trước khi khôi phục
          </h3>
          <p>
            Tệp <strong>{filename}</strong>: {pending.progress.length} bài đã
            bắt đầu, {pending.attempts.length} lần trả lời,{" "}
            {pending.notes.length} ghi chú, {pending.submissions.length} bài
            làm.
          </p>
          <p>
            Khôi phục sẽ{" "}
            <strong>thay thế toàn bộ dữ liệu học trong trình duyệt này</strong>.
            Hãy xuất bản sao hiện tại trước nếu cần giữ lại. Chỉ thay đổi sau
            khi bạn nhấn nút bên dưới.
          </p>
          <div className="backup-actions">
            <button
              className="btn primary"
              onClick={() => {
                setError("");
                try {
                  onRestore(pending);
                  setPending(undefined);
                  setMessage("Đã khôi phục dữ liệu thành công.");
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Thay thế bằng bản sao lưu
            </button>
            <button className="btn" onClick={() => setPending(undefined)}>
              Hủy khôi phục
            </button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="backup-message">
          {message}
        </p>
      )}
    </section>
  );
}
export default function DataPage() {
  const { state, replaceState } = useStore();
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">DỮ LIỆU THUỘC VỀ BẠN</div>
          <h1>Dữ liệu & sao lưu</h1>
          <p>
            Học ngay trên trình duyệt. Chủ động giữ một bản sao hành trình của
            bạn.
          </p>
        </div>
        <span className="personal-badge">
          <HardDrive size={17} /> Lưu trên thiết bị này
        </span>
      </div>
      <div className="info-banner">
        <ShieldCheck size={22} />
        <p>
          Ứng dụng xử lý hoàn toàn ở client. Tiến độ, bài làm, lịch sử, ghi chú
          và yêu thích chỉ nằm trong localStorage của trình duyệt này, theo địa
          chỉ website. Không có tài khoản hay đồng bộ máy chủ. Xóa dữ liệu
          website, dùng cửa sổ riêng tư, đổi trình duyệt hoặc đổi tên miền/cổng sẽ có
          bộ dữ liệu khác.
        </p>
      </div>
      <article className="progress-panel">
        <h2>Sao lưu & chuyển thiết bị</h2>
        <p className="muted">
          Xuất tệp JSON trên thiết bị cũ, mở trang này trên thiết bị mới rồi
          nhập tệp. Nội dung học đã được đóng gói trong website; tệp chỉ chứa dữ
          liệu cá nhân.
        </p>
        <BackupTools state={state} onRestore={replaceState} />
      </article>
      <article className="progress-panel data-note">
        <h2>Chuyển từ phiên bản SQLite trước đây</h2>
        <p>
          Database cũ không bị xóa và không được trình duyệt tự truy cập. Nếu
          bạn đã có tiến độ ở bản cũ, dùng công cụ chuyển đổi trong README để
          xuất SQLite thành JSON, rồi nhập tại đây.
        </p>
        <p>
          Đáp án được đóng gói cùng frontend để chấm trên thiết bị. Luồng học
          vẫn chỉ mở giải thích sau khi gửi, nhưng người dùng có thể xem mã
          nguồn; đây không phải hệ thống thi có bảo mật đáp án.
        </p>
      </article>
    </>
  );
}
