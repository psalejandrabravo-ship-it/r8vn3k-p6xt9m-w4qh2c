import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CALMA,
  CLUES,
  CODE,
  CODE_ICONS,
  PACIENCIA,
  SCENE_ORDER,
  STORAGE_KEY,
  type ClueId,
  type ClueSource,
  type Level,
  type MissionId,
  type MissionStatus,
  type Mode,
  type ScreenId,
  type Tile,
  clueByMission,
} from "../config/gameConfig";
import { assistScenes, assistTiles, emptySlots, placeScene, placeTile, removeScene, removeTile, resetTiles, shuffle, tilesFrom } from "./logic";

export interface ActivityState {
  tutorial: { hinted: boolean; opened: boolean; line: number };
  m1: { riddleSolved: boolean; doorOpen: boolean; pool: Tile[]; slots: (Tile | null)[] };
  m2: { prepared: boolean; q1: boolean; q2: boolean; opened: boolean; pool: Tile[]; slots: (Tile | null)[] };
  m3: { seen: boolean; ordered: boolean; reflected: boolean; pool: string[]; slots: (string | null)[] };
  code: { slots: (string | null)[] };
  toolsSeen: string[];
}

export interface Persisted {
  screen: ScreenId;
  level: Level;
  mode: Mode;
  participants: number;
  narration: boolean;
  sounds: boolean;
  reducedMotion: boolean;
  selectedAgents: number[];
  currentTurn: number;
  missions: Record<MissionId, MissionStatus>;
  cluesFound: Partial<Record<ClueId, { number: number; source: ClueSource }>>;
  helpsUsed: string[];
  activity: ActivityState;
}

export interface MemoryState {
  voluntaryChoices: string[];
  toolsChosen: Record<number, string>;
  sessionNotes: string;
  videoSrc: string | null;
  reflection: string | null;
}

export type DialogId = "pause" | "notebook" | "adult" | "guide" | "end" | "fichas" | "breath" | null;

function freshActivity(): ActivityState {
  return {
    tutorial: { hinted: false, opened: false, line: 0 },
    m1: { riddleSolved: false, doorOpen: false, pool: tilesFrom(CALMA), slots: emptySlots(CALMA.length) },
    m2: { prepared: false, q1: false, q2: false, opened: false, pool: tilesFrom(PACIENCIA), slots: emptySlots(PACIENCIA.length) },
    m3: { seen: false, ordered: false, reflected: false, pool: shuffle([...SCENE_ORDER]), slots: [null, null, null, null] },
    code: { slots: [null, null, null] },
    toolsSeen: [],
  };
}

export function freshPersisted(): Persisted {
  return {
    screen: "P01",
    level: "detectives",
    mode: "individual",
    participants: 2,
    narration: true,
    sounds: true,
    reducedMotion: false,
    selectedAgents: [],
    currentTurn: 0,
    missions: { 1: "pending", 2: "pending", 3: "pending" },
    cluesFound: {},
    helpsUsed: [],
    activity: freshActivity(),
  };
}

function emptyMemory(): MemoryState {
  return { voluntaryChoices: [], toolsChosen: {}, sessionNotes: "", videoSrc: null, reflection: null };
}

function nextM2(level: Level, pool: Tile[], slots: (Tile | null)[]) {
  if (level !== "exploradores") return assistTiles(pool, slots, PACIENCIA);
  const sitting = slots[0];
  if (sitting?.char === "PACIENCIA") return { pool, slots, placed: false };
  const nextPool = sitting ? [...pool, sitting] : [...pool];
  const tile = nextPool.find((item) => item.char === "PACIENCIA");
  if (!tile) return { pool, slots, placed: false };
  return {
    pool: nextPool.filter((item) => item.id !== tile.id),
    slots: [tile],
    placed: true,
  };
}

function nextCode(
  slots: (string | null)[],
  target: readonly string[],
  owned: (token: string) => boolean,
) {
  const index = slots.findIndex((slot, i) => slot !== target[i]);
  if (index < 0) return { slots, placed: false };
  const need = target[index];
  if (!need || !owned(need)) return { slots, placed: false };
  const next = slots.slice();
  next[index] = need;
  return { slots: next, placed: true };
}

function ownsCode(cluesFound: Persisted["cluesFound"], mode: "iconos" | "numeros", token: string) {
  if (mode === "iconos") return Boolean(cluesFound[token as ClueId]);
  return CLUES.some((clue) => cluesFound[clue.id] && String(clue.number) === token);
}

function isPersisted(value: unknown): value is Persisted {
  if (!value || typeof value !== "object") return false;
  const v = value as Persisted;
  return typeof v.screen === "string" && !!v.activity && !!v.missions;
}

function loadPersisted(): Persisted | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isPersisted(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

interface Store {
  persisted: Persisted;
  memory: MemoryState;
  dialog: DialogId;
  feedback: string;
  hasSavedSession: boolean;
  activeSlot: number;
  setFeedback: (text: string) => void;
  openDialog: (dialog: DialogId) => void;
  patch: (partial: Partial<Persisted>) => void;
  setScreen: (screen: ScreenId) => void;
  startNew: () => void;
  continueSaved: () => boolean;
  newVisit: () => void;
  setLevel: (level: Level) => void;
  setMode: (mode: Mode) => void;
  setParticipants: (count: number) => void;
  toggleFlag: (key: "narration" | "sounds" | "reducedMotion") => void;
  setActiveSlot: (index: number) => void;
  assignAgent: (agentId: number) => void;
  clearSlot: (index: number) => void;
  confirmAgents: () => boolean;
  markExploring: (mission: MissionId) => void;
  noteHelp: (tag: string) => void;
  solveRiddle: () => void;
  placeM1: (id: string) => void;
  returnM1: (index: number) => void;
  assistM1: () => boolean;
  openDoor: () => boolean;
  answerM2: (which: "q1" | "q2") => void;
  prepareM2: () => void;
  placeM2: (id: string) => void;
  returnM2: (index: number) => void;
  assistM2: () => boolean;
  resetM2Panel: () => void;
  openRadio: () => boolean;
  seeScenes: () => void;
  placeM3: (id: string) => void;
  returnM3: (index: number) => void;
  assistM3: () => boolean;
  resetM3: () => void;
  markOrdered: () => void;
  reflect: (id: string, label: string) => void;
  placeCode: (token: string) => void;
  returnCode: (index: number) => void;
  clearCode: () => void;
  assistCode: (mode: "iconos" | "numeros") => boolean;
  finishMission: (mission: MissionId) => void;
  skipMission: (mission: MissionId) => string;
  seeTool: (id: string) => void;
  chooseTool: (toolId: string) => void;
  skipToolChoice: () => void;
  setNotes: (notes: string) => void;
  setVideo: (src: string | null) => void;
  hintTutorial: () => void;
  openTutorialLetter: () => void;
  revealTutorialLine: () => void;
  currentAgentId: () => number | null;
}

const Ctx = createContext<Store | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<Persisted>(freshPersisted);
  const [saveOn, setSaveOn] = useState(false);
  const [hasSavedSession, setHasSavedSession] = useState(() => loadPersisted() !== null);
  const [memory, setMemory] = useState<MemoryState>(emptyMemory);
  const [dialog, setDialog] = useState<DialogId>(null);
  const [feedback, setFeedback] = useState("");
  const [activeSlot, setActiveSlot] = useState(0);

  useEffect(() => {
    if (!saveOn) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  }, [persisted, saveOn]);

  const api = useMemo<Store>(() => {
    const update = (recipe: (prev: Persisted) => Persisted) => {
      setPersisted(recipe);
    };

    const finishMission = (mission: MissionId) => {
      update((prev) => {
        const status = prev.missions[mission];
        const clue = clueByMission(mission);
        const cluesFound = { ...prev.cluesFound };
        if (!cluesFound[clue.id] && status !== "skipped") {
          cluesFound[clue.id] = { number: clue.number, source: "activity" };
        }
        if (status === "skipped" || status === "completed") {
          return { ...prev, cluesFound };
        }
        const count = Math.max(prev.selectedAgents.length, 1);
        return {
          ...prev,
          cluesFound,
          missions: { ...prev.missions, [mission]: "completed" },
          currentTurn: (prev.currentTurn + 1) % count,
        };
      });
    };

    return {
      persisted,
      memory,
      dialog,
      feedback,
      hasSavedSession,
      activeSlot,
      setFeedback,
      openDialog: setDialog,
      patch: (partial) => update((prev) => ({ ...prev, ...partial })),
      setScreen: (screen) => {
        setFeedback("");
        update((prev) => ({ ...prev, screen }));
      },
      startNew: () => {
        setMemory(emptyMemory());
        setFeedback("");
        setDialog(null);
        setActiveSlot(0);
        setSaveOn(true);
        setHasSavedSession(true);
        setPersisted({ ...freshPersisted(), screen: "P02" });
      },
      continueSaved: () => {
        const saved = loadPersisted();
        if (!saved) return false;
        setPersisted(saved);
        setSaveOn(true);
        setHasSavedSession(true);
        setFeedback("");
        return true;
      },
      newVisit: () => {
        sessionStorage.removeItem(STORAGE_KEY);
        setSaveOn(false);
        setHasSavedSession(false);
        setMemory(emptyMemory());
        setDialog(null);
        setFeedback("");
        setPersisted(freshPersisted());
      },
      setLevel: (level) => update((prev) => ({ ...prev, level })),
      setMode: (mode) => update((prev) => ({
        ...prev,
        mode,
        participants: mode === "individual" ? 1 : Math.min(6, Math.max(2, prev.participants || 2)),
        selectedAgents: [],
      })),
      setParticipants: (count) => update((prev) => ({
        ...prev,
        participants: Math.min(6, Math.max(2, count)),
        selectedAgents: [],
      })),
      toggleFlag: (key) => update((prev) => ({ ...prev, [key]: !prev[key] })),
      setActiveSlot,
      assignAgent: (agentId) => update((prev) => {
        const needed = prev.mode === "individual" ? 1 : prev.participants;
        const slots = Array.from({ length: needed }, (_, i) => prev.selectedAgents[i] ?? 0);
        const other = slots.findIndex((id, index) => id === agentId && index !== activeSlot);
        const current = slots[activeSlot] ?? 0;
        if (other >= 0) slots[other] = current;
        slots[activeSlot] = agentId;
        return { ...prev, selectedAgents: slots };
      }),
      clearSlot: (index) => update((prev) => {
        const slots = [...prev.selectedAgents];
        slots[index] = 0;
        return { ...prev, selectedAgents: slots };
      }),
      confirmAgents: () => {
        const needed = persisted.mode === "individual" ? 1 : persisted.participants;
        const ids = persisted.selectedAgents.filter((id) => id > 0);
        if (ids.length !== needed || new Set(ids).size !== ids.length) return false;
        update((prev) => ({ ...prev, selectedAgents: ids, screen: "P04", currentTurn: 0 }));
        setFeedback("");
        return true;
      },
      markExploring: (mission) => update((prev) => (
        prev.missions[mission] === "pending"
          ? { ...prev, missions: { ...prev.missions, [mission]: "exploring" } }
          : prev
      )),
      noteHelp: (tag) => update((prev) => ({ ...prev, helpsUsed: [...prev.helpsUsed, tag] })),
      solveRiddle: () => update((prev) => ({ ...prev, activity: { ...prev.activity, m1: { ...prev.activity.m1, riddleSolved: true } } })),
      placeM1: (id) => update((prev) => {
        const moved = placeTile(prev.activity.m1.pool, prev.activity.m1.slots, id);
        if (!moved) return prev;
        return { ...prev, activity: { ...prev.activity, m1: { ...prev.activity.m1, ...moved } } };
      }),
      returnM1: (index) => update((prev) => {
        const moved = removeTile(prev.activity.m1.pool, prev.activity.m1.slots, index);
        if (!moved) return prev;
        return { ...prev, activity: { ...prev.activity, m1: { ...prev.activity.m1, ...moved, doorOpen: false } } };
      }),
      assistM1: () => {
        const preview = assistTiles(persisted.activity.m1.pool, persisted.activity.m1.slots, CALMA);
        if (!preview.placed) return false;
        update((prev) => {
          const helped = assistTiles(prev.activity.m1.pool, prev.activity.m1.slots, CALMA);
          if (!helped.placed) return prev;
          return { ...prev, activity: { ...prev.activity, m1: { ...prev.activity.m1, pool: helped.pool, slots: helped.slots } } };
        });
        return true;
      },
      openDoor: () => {
        const word = persisted.activity.m1.slots.map((slot) => slot?.char ?? "").join("");
        if (word !== CALMA) return false;
        update((prev) => {
          const current = prev.activity.m1.slots.map((slot) => slot?.char ?? "").join("");
          if (current !== CALMA) return prev;
          return { ...prev, activity: { ...prev.activity, m1: { ...prev.activity.m1, doorOpen: true } } };
        });
        return true;
      },
      answerM2: (which) => update((prev) => ({ ...prev, activity: { ...prev.activity, m2: { ...prev.activity.m2, [which]: true } } })),
      prepareM2: () => update((prev) => {
        if (prev.activity.m2.prepared) return prev;
        if (prev.level === "exploradores") {
          return {
            ...prev,
            activity: {
              ...prev.activity,
              m2: {
                ...prev.activity.m2,
                prepared: true,
                pool: shuffle([{ id: "pac", char: "PACIENCIA" }, { id: "imp", char: "IMPULSO" }]),
                slots: [null],
              },
            },
          };
        }
        return { ...prev, activity: { ...prev.activity, m2: { ...prev.activity.m2, prepared: true } } };
      }),
      placeM2: (id) => update((prev) => {
        const moved = placeTile(prev.activity.m2.pool, prev.activity.m2.slots, id);
        if (!moved) return prev;
        return { ...prev, activity: { ...prev.activity, m2: { ...prev.activity.m2, ...moved } } };
      }),
      returnM2: (index) => update((prev) => {
        const moved = removeTile(prev.activity.m2.pool, prev.activity.m2.slots, index);
        if (!moved) return prev;
        return { ...prev, activity: { ...prev.activity, m2: { ...prev.activity.m2, ...moved, opened: false } } };
      }),
      assistM2: () => {
        const preview = nextM2(persisted.level, persisted.activity.m2.pool, persisted.activity.m2.slots);
        if (!preview.placed) return false;
        update((prev) => {
          const helped = nextM2(prev.level, prev.activity.m2.pool, prev.activity.m2.slots);
          if (!helped.placed) return prev;
          return { ...prev, activity: { ...prev.activity, m2: { ...prev.activity.m2, pool: helped.pool, slots: helped.slots } } };
        });
        return true;
      },
      resetM2Panel: () => update((prev) => {
        const panel = prev.level === "exploradores"
          ? { pool: shuffle([{ id: "pac", char: "PACIENCIA" }, { id: "imp", char: "IMPULSO" }]), slots: [null] as (Tile | null)[] }
          : resetTiles(PACIENCIA);
        return { ...prev, activity: { ...prev.activity, m2: { ...prev.activity.m2, ...panel, opened: false, prepared: true } } };
      }),
      openRadio: () => {
        const target = persisted.level === "exploradores" ? "PACIENCIA" : PACIENCIA;
        const word = persisted.activity.m2.slots.map((slot) => slot?.char ?? "").join("");
        if (word !== target) return false;
        update((prev) => {
          const expected = prev.level === "exploradores" ? "PACIENCIA" : PACIENCIA;
          const current = prev.activity.m2.slots.map((slot) => slot?.char ?? "").join("");
          if (current !== expected) return prev;
          return { ...prev, activity: { ...prev.activity, m2: { ...prev.activity.m2, opened: true } } };
        });
        return true;
      },
      seeScenes: () => update((prev) => ({ ...prev, activity: { ...prev.activity, m3: { ...prev.activity.m3, seen: true } } })),
      placeM3: (id) => update((prev) => {
        const moved = placeScene(prev.activity.m3.pool, prev.activity.m3.slots, id);
        if (!moved) return prev;
        return { ...prev, activity: { ...prev.activity, m3: { ...prev.activity.m3, ...moved, ordered: false } } };
      }),
      returnM3: (index) => update((prev) => {
        const moved = removeScene(prev.activity.m3.pool, prev.activity.m3.slots, index);
        if (!moved) return prev;
        return { ...prev, activity: { ...prev.activity, m3: { ...prev.activity.m3, ...moved, ordered: false } } };
      }),
      assistM3: () => {
        const preview = assistScenes(persisted.activity.m3.pool, persisted.activity.m3.slots, SCENE_ORDER);
        if (!preview.placed) return false;
        update((prev) => {
          const helped = assistScenes(prev.activity.m3.pool, prev.activity.m3.slots, SCENE_ORDER);
          if (!helped.placed) return prev;
          return { ...prev, activity: { ...prev.activity, m3: { ...prev.activity.m3, pool: helped.pool, slots: helped.slots } } };
        });
        return true;
      },
      resetM3: () => update((prev) => ({
        ...prev,
        activity: { ...prev.activity, m3: { ...prev.activity.m3, pool: shuffle([...SCENE_ORDER]), slots: [null, null, null, null], ordered: false } },
      })),
      markOrdered: () => update((prev) => ({ ...prev, activity: { ...prev.activity, m3: { ...prev.activity.m3, ordered: true } } })),
      reflect: (id, label) => {
        setMemory((prev) => ({ ...prev, reflection: label, voluntaryChoices: [...prev.voluntaryChoices, id] }));
        update((prev) => ({ ...prev, activity: { ...prev.activity, m3: { ...prev.activity.m3, reflected: true } } }));
      },
      placeCode: (token) => update((prev) => {
        if (prev.activity.code.slots.includes(token)) return prev;
        const index = prev.activity.code.slots.findIndex((slot) => slot === null);
        if (index < 0) return prev;
        const slots = prev.activity.code.slots.slice();
        slots[index] = token;
        return { ...prev, activity: { ...prev.activity, code: { slots } } };
      }),
      returnCode: (index) => update((prev) => {
        const slots = prev.activity.code.slots.slice();
        slots[index] = null;
        return { ...prev, activity: { ...prev.activity, code: { slots } } };
      }),
      clearCode: () => update((prev) => ({ ...prev, activity: { ...prev.activity, code: { slots: [null, null, null] } } })),
      assistCode: (mode) => {
        const target = mode === "iconos" ? CODE_ICONS : CODE;
        const preview = nextCode(persisted.activity.code.slots, target, (token) => ownsCode(persisted.cluesFound, mode, token));
        if (!preview.placed) return false;
        update((prev) => {
          const helped = nextCode(prev.activity.code.slots, target, (token) => ownsCode(prev.cluesFound, mode, token));
          if (!helped.placed) return prev;
          return { ...prev, activity: { ...prev.activity, code: { slots: helped.slots } } };
        });
        return true;
      },
      finishMission,
      skipMission: (mission) => {
        const status = persisted.missions[mission];
        if (status === "completed") return "Esta misión ya tiene su pista. Sigue guardada.";
        const clue = clueByMission(mission);
        update((prev) => {
          if (prev.missions[mission] === "completed") return prev;
          const cluesFound = { ...prev.cluesFound };
          if (!cluesFound[clue.id]) cluesFound[clue.id] = { number: clue.number, source: "apoyo adulto" };
          return { ...prev, cluesFound, missions: { ...prev.missions, [mission]: "skipped" }, screen: "P06" };
        });
        return `${clue.name} queda en la libreta como apoyo. La misión no se marca como completada.`;
      },
      seeTool: (id) => update((prev) => (
        prev.activity.toolsSeen.includes(id)
          ? prev
          : { ...prev, activity: { ...prev.activity, toolsSeen: [...prev.activity.toolsSeen, id] } }
      )),
      chooseTool: (toolId) => {
        const agentId = persisted.selectedAgents[persisted.currentTurn] ?? persisted.selectedAgents[0] ?? 0;
        setMemory((prev) => ({ ...prev, toolsChosen: { ...prev.toolsChosen, [agentId]: toolId } }));
      },
      skipToolChoice: () => {
        setMemory((prev) => ({ ...prev, voluntaryChoices: [...prev.voluntaryChoices, "sin-herramienta"] }));
      },
      setNotes: (sessionNotes) => setMemory((prev) => ({ ...prev, sessionNotes })),
      setVideo: (videoSrc) => setMemory((prev) => {
        if (prev.videoSrc?.startsWith("blob:")) URL.revokeObjectURL(prev.videoSrc);
        return { ...prev, videoSrc };
      }),
      hintTutorial: () => update((prev) => ({ ...prev, activity: { ...prev.activity, tutorial: { ...prev.activity.tutorial, hinted: true } } })),
      openTutorialLetter: () => update((prev) => ({ ...prev, activity: { ...prev.activity, tutorial: { ...prev.activity.tutorial, opened: true, hinted: true } } })),
      revealTutorialLine: () => update((prev) => ({
        ...prev,
        activity: { ...prev.activity, tutorial: { ...prev.activity.tutorial, line: Math.min(3, prev.activity.tutorial.line + 1) } },
      })),
      currentAgentId: () => persisted.selectedAgents[persisted.currentTurn] ?? persisted.selectedAgents[0] ?? null,
    };
  }, [persisted, memory, dialog, feedback, saveOn, activeSlot, hasSavedSession]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useSession(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession fuera del proveedor");
  return ctx;
}
