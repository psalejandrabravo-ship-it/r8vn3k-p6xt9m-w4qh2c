import { useEffect, useState, type ReactNode } from "react";
import { CLUES, agentById, detectiveName, type ClueId } from "../config/gameConfig";
import { hush } from "../lib/speech";
import { useSession } from "../state/sessionStore";
import { ClueIcon, ExpandIcon } from "./Icons";
import type { Tile } from "../config/gameConfig";

export function TopBar({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="topbar">
      <strong>{title}</strong>
      <div className="row tight">{children}</div>
    </header>
  );
}

export function Hud({ title }: { title: string }) {
  const session = useSession();
  const agentId = session.currentAgentId();
  const agent = agentId ? agentById(agentId) : undefined;
  const name = agentId ? detectiveName(session.persisted.names, session.persisted.selectedAgents, agentId) : "";
  return (
    <header className="hud">
      <button type="button" className="icon-btn back" aria-label="Volver al mapa" onClick={() => session.setScreen("P06")}>
        <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M30 12 L16 24 L30 36" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {agent && <img className="hud-avatar" src={agent.image} alt="" />}
      <div>
        <strong>{title}</strong>
        {name && <small>{name}</small>}
      </div>
    </header>
  );
}

export function Companion({ pose = "idle" }: { pose?: "idle" | "walk" | "happy" }) {
  const session = useSession();
  const agentId = session.currentAgentId();
  const agent = agentId ? agentById(agentId) : undefined;
  if (!agent) return null;
  const name = detectiveName(session.persisted.names, session.persisted.selectedAgents, agent.id);
  return (
    <figure className={`companion pose-${pose}`}>
      <img src={agent.image} alt="" />
      <figcaption>{name}</figcaption>
    </figure>
  );
}

export function Feedback() {
  const { feedback } = useSession();
  if (!feedback) return null;
  return <p className="banner" role="status">{feedback}</p>;
}

export function CluePips() {
  const { cluesFound } = useSession().persisted;
  return (
    <div className="pips" aria-label="Pistas del maletín">
      {CLUES.map((clue) => {
        const found = cluesFound[clue.id];
        return (
          <span key={clue.id} className={found ? "pip on" : "pip"}>
            <ClueIcon id={clue.id} />
            <b>{found ? found.number : "?"}</b>
          </span>
        );
      })}
    </div>
  );
}

export function HelpBar({ onJuntos, onPartes }: { onJuntos: () => void; onPartes: () => void }) {
  const session = useSession();
  const screen = session.persisted.screen;
  return (
    <div className="helpbar">
      <button type="button" className="btn gold" onClick={() => { session.noteHelp(`${screen}:juntos`); onJuntos(); }}>Ayuda juntos</button>
      <button type="button" className="btn secondary" onClick={() => { session.noteHelp(`${screen}:partes`); onPartes(); }}>Por partes</button>
      <button type="button" className="btn quiet" onClick={() => { session.noteHelp(`${screen}:pausa`); session.openDialog("breath"); }}>Una pausa</button>
    </div>
  );
}

export function LetterBoard({
  pool,
  slots,
  wide,
  onPlace,
  onRemove,
}: {
  pool: Tile[];
  slots: (Tile | null)[];
  wide?: boolean;
  onPlace: (id: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="board">
      <div className="slots" aria-label="Espacios de la palabra">
        {slots.map((slot, index) => (
          <button key={index} type="button" className={wide ? "letter wide" : "letter"} onClick={() => onRemove(index)}>
            {slot?.char ?? ""}
          </button>
        ))}
      </div>
      <div className="tray" aria-label="Letras disponibles">
        {pool.map((tile) => (
          <button key={tile.id} type="button" className={wide ? "letter wide" : "letter"} onClick={() => onPlace(tile.id)}>
            {tile.char}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FullscreenButton() {
  const { setFeedback } = useSession();
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label="Pantalla completa"
      onClick={() => {
        const stage = document.getElementById("stage");
        if (!stage) return;
        const done = document.fullscreenElement
          ? document.exitFullscreen()
          : stage.requestFullscreen();
        done.catch(() => setFeedback("Este dispositivo no abrió la pantalla completa."));
      }}
    >
      <ExpandIcon />
    </button>
  );
}

export function Orientation() {
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    const check = () => {
      const portrait = window.innerWidth < 900 && window.innerHeight > window.innerWidth;
      setBlocked(portrait);
      if (portrait) {
        hush();
        document.querySelectorAll("video").forEach((node) => {
          if (node instanceof HTMLVideoElement) node.pause();
        });
      }
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);
  if (!blocked) return null;
  return (
    <div className="orientation" role="alertdialog" aria-label="Gira la pantalla">
      <p>Gira tu celular para continuar la misión</p>
      <p className="sub">La aventura se ve mejor en horizontal. Lo que hiciste sigue guardado.</p>
    </div>
  );
}

export function SceneCast({ children }: { children: ReactNode }) {
  const agent = agentById(useSession().currentAgentId() ?? 0);
  return (
    <div className="cast">
      {agent && <img className="cast-agent" src={agent.image} alt="" />}
      <div className="cast-prop">{children}</div>
    </div>
  );
}

export function CodeToken({ token }: { token: string }) {
  if (token === "carta" || token === "radio" || token === "huellas") {
    const clue = CLUES.find((item) => item.id === token);
    return (
      <>
        <ClueIcon id={token as ClueId} />
        <span>{clue?.name}</span>
      </>
    );
  }
  return <b>{token}</b>;
}
