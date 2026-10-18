import { useEffect, useRef } from "react";
import { CLUES, TRANSVERSAL, agentById, sourceLabel, statusLabel } from "../config/gameConfig";
import { TopBar } from "../components/ui";
import { hush } from "../lib/speech";
import { useSession } from "../state/sessionStore";

export function Closing() {
  const screen = useSession().persisted.screen;
  if (screen === "P29") return <Farewell />;
  if (screen === "P30") return <Summary />;
  return <Video />;
}

function Video() {
  const session = useSession();
  const ref = useRef<HTMLVideoElement>(null);
  const src = session.memory.videoSrc;
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const pause = () => {
      if (window.innerWidth < 900 && window.innerHeight > window.innerWidth) node.pause();
    };
    window.addEventListener("resize", pause);
    return () => window.removeEventListener("resize", pause);
  }, [src]);
  return (
    <section className="stack">
      <TopBar title="Antes de despedirnos" />
      <p className="lead">Veamos juntos este cierre, si hay un video. Si no hay archivo, seguimos igual.</p>
      {src ? (
        <video ref={ref} className="video" controls src={src} onPlay={() => hush()} />
      ) : (
        <div className="video-fallback">
          <p>Aquí irá nuestro video de cierre.</p>
          <p>Mientras no haya archivo, este panel nos espera.</p>
        </div>
      )}
      <label className="btn quiet file">
        Elegir video en este dispositivo
        <input
          type="file"
          accept="video/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            session.setVideo(URL.createObjectURL(file));
          }}
        />
      </label>
      <button type="button" className="btn" onClick={() => { ref.current?.pause(); session.setScreen("P29"); }}>Continuar</button>
    </section>
  );
}

function Farewell() {
  const session = useSession();
  return (
    <section className="stack center">
      <img className="farewell-robot" src="/assets/illustrations/characters/103469.png" alt="" />
      <h1>Gracias por explorar juntos</h1>
      <p className="lead">A veces algo cuesta. Podemos sentirlo, buscar apoyo y elegir qué hacer después.</p>
      <p className="lead">{TRANSVERSAL}</p>
      <p className="credit">MIRARIM</p>
      <div className="row">
        <button type="button" className="btn" onClick={() => session.newVisit()}>Nueva sesión</button>
        <button type="button" className="btn secondary" onClick={() => session.setScreen("P30")}>Resumen del acompañante</button>
      </div>
    </section>
  );
}

export function Summary() {
  const session = useSession();
  const { level, mode, participants, missions, cluesFound, helpsUsed, selectedAgents } = session.persisted;
  const names = selectedAgents.map((id) => agentById(id)?.short ?? "").filter(Boolean);
  return (
    <section className="stack summary">
      <TopBar title="Resumen del acompañante" />
      <p>Nivel: {level === "exploradores" ? "Exploradores" : "Detectives"}</p>
      <p>Modo: {mode === "individual" ? "Individual" : `Grupal, ${participants} participantes`}</p>
      <p>Agentes: {names.join(", ") || "Sin asignar"}</p>
      <h2>Misiones</h2>
      <ul>
        <li>Sala de las cartas: {statusLabel(missions[1])}</li>
        <li>Puesto de escucha: {statusLabel(missions[2])}</li>
        <li>Archivo de las huellas: {statusLabel(missions[3])}</li>
      </ul>
      <h2>Pistas</h2>
      <ul>
        {CLUES.map((clue) => {
          const found = cluesFound[clue.id];
          return <li key={clue.id}>{clue.name}: {found ? `${found.number} · ${sourceLabel(found.source)}` : "Pendiente"}</li>;
        })}
      </ul>
      <p>Ayudas usadas: {helpsUsed.length}</p>
      <p className="fine">Este resumen describe la experiencia. No mide ni diagnostica el desarrollo socioemocional. Reflexiones, herramientas elegidas y notas del adulto no se incluyen.</p>
      <div className="row no-print">
        <button type="button" className="btn" onClick={() => window.print()}>Imprimir</button>
        <button type="button" className="btn quiet" onClick={() => session.setScreen("P06")}>Mapa</button>
        <button type="button" className="btn quiet" onClick={() => session.setScreen("P29")}>Despedida</button>
      </div>
    </section>
  );
}
