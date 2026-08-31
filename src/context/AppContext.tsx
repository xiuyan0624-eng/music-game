import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { playBeep, playNote, speakLetter, speakNumber } from "../lib/audio";

export type ProjectId = "home" | "beat" | "keyboard";

type AudioApi = {
  playBeep: typeof playBeep;
  playNote: typeof playNote;
  speakLetter: typeof speakLetter;
  speakNumber: typeof speakNumber;
};

type AppContextValue = {
  project: ProjectId;
  openProject: (project: "beat" | "keyboard") => void;
  goHome: () => void;
  registerHomeInterrupt: (fn: (() => void) | null) => void;
  audio: AudioApi;
};

const AppContext = createContext<AppContextValue | null>(null);

function projectFromHash(): ProjectId {
  const hash = location.hash.slice(1);
  if (hash === "beat" || hash === "keyboard") return hash;
  return "home";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<ProjectId>(() => projectFromHash());
  const interruptRef = useRef<(() => void) | null>(null);

  const registerHomeInterrupt = useCallback((fn: (() => void) | null) => {
    interruptRef.current = fn;
  }, []);

  const openProject = useCallback((next: "beat" | "keyboard") => {
    setProject(next);
    if (location.hash !== `#${next}`) history.replaceState(null, "", `#${next}`);
  }, []);

  const goHome = useCallback(() => {
    interruptRef.current?.();
    setProject("home");
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  }, []);

  useEffect(() => {
    const onHash = () => setProject(projectFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const audio = useMemo<AudioApi>(
    () => ({ playBeep, playNote, speakLetter, speakNumber }),
    [],
  );

  const value = useMemo(
    () => ({ project, openProject, goHome, registerHomeInterrupt, audio }),
    [project, openProject, goHome, registerHomeInterrupt, audio],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
