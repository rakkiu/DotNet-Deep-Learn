import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { catalog, findLesson, gradeQuestion } from "./content";
import { learningStorage, STORAGE_KEY, validateState } from "./storage";
import type {
  Catalog,
  State,
  Progress,
  Attempt,
  Submission,
  SectionKey,
} from "./types";
function put<T>(rows: T[], row: T, key: (x: T) => string): T[] {
  return [...rows.filter((x) => key(x) !== key(row)), row];
}
type Store = {
  catalog: Catalog;
  state: State;
  message: string;
  notify: (s: string) => void;
  replaceState: (state: State) => void;
  saveProgress: (
    id: string,
    section: SectionKey,
    read: boolean,
  ) => Promise<void>;
  saveNote: (id: string, text: string) => Promise<void>;
  bookmark: (id: string, saved: boolean) => Promise<void>;
  answer: (
    lesson: string,
    question: string,
    option: string,
  ) => Promise<Attempt>;
  saveSubmission: (
    lesson: string,
    exercise: string,
    code: string,
    checks: boolean[],
    assessed: boolean,
  ) => Promise<void>;
};
const Context = createContext<Store | null>(null);
export const useStore = () => useContext(Context)!;
export function StoreProvider({
  initial,
  children,
}: {
  initial: State;
  children: ReactNode;
}) {
  const [state, setState] = useState(initial),
    [message, setMessage] = useState("");
  const notify = (s: string) => setMessage(s);
  // Read the latest on-disk value before each operation, merge only this operation,
  // then persist BEFORE publishing state. A failed write must never report success.
  const commit = (change: (s: State) => State) => {
    const next = learningStorage.save(change(learningStorage.load()));
    setState(next);
    return next;
  };
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      try {
        const next = learningStorage.load();
        setState(next);
      } catch (e) {
        notify((e as Error).message);
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const value: Store = {
    catalog,
    state,
    message,
    notify,
    replaceState(next) {
      const clean = learningStorage.save(validateState(next));
      setState(clean);
      notify("Đã khôi phục dữ liệu trong trình duyệt này.");
    },
    async saveProgress(id, section, read) {
      findLesson(id);
      const row: Progress = {
        lessonId: id,
        section,
        read,
        updatedAt: new Date().toISOString(),
      };
      commit((s) => ({
        ...s,
        progress: put(s.progress, row, (x) => x.lessonId),
      }));
    },
    async saveNote(id, text) {
      findLesson(id);
      commit((s) => ({
        ...s,
        notes: put(s.notes, { lessonId: id, text }, (x) => x.lessonId),
      }));
      notify("Đã lưu ghi chú trong trình duyệt.");
    },
    async bookmark(id, saved) {
      findLesson(id);
      commit((s) => ({
        ...s,
        bookmarks: saved
          ? put(s.bookmarks, { lessonId: id }, (x) => x.lessonId)
          : s.bookmarks.filter((x) => x.lessonId !== id),
      }));
      notify(saved ? "Đã lưu bài vào yêu thích." : "Đã bỏ yêu thích.");
    },
    async answer(lessonId, questionId, optionId) {
      const feedback = gradeQuestion(lessonId, questionId, optionId);
      let row!: Attempt;
      commit((s) => {
        row = {
          id: s.attempts.reduce((max, a) => Math.max(max, a.id), 0) + 1,
          lessonId,
          questionId,
          optionId,
          correct: feedback.correct,
          feedback: JSON.stringify(feedback),
          createdAt: new Date().toISOString(),
        };
        return { ...s, attempts: [...s.attempts, row] };
      });
      return row;
    },
    async saveSubmission(lessonId, exerciseId, code, checks, assessed) {
      const row: Submission = {
        id: lessonId + ":" + exerciseId,
        lessonId,
        exerciseId,
        code,
        checks: JSON.stringify(checks),
        assessed,
        updatedAt: new Date().toISOString(),
      };
      commit((s) => ({
        ...s,
        submissions: put(s.submissions, row, (x) => x.id),
      }));
      notify(
        assessed
          ? "Đã lưu tự đánh giá. Đây không phải kết quả chấm code."
          : "Đã lưu bài làm trong trình duyệt.",
      );
    },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
