import { useEffect, useRef } from "react";
import { CLUES, FINAL_VIDEO, TRANSVERSAL, sourceLabel, statusLabel } from "../config/gameConfig";
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
  const src = FINAL_VIDEO || session.memory.videoSrc || "";
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
      <TopBar title="Video final" />
      {src ? (
        <>
          <video ref={ref} className="video" controls src={src} onPlay={() => hush()} />
          <button type="button" className="btn" onClick={() => { hush(); void ref.current?.play(); }}>Reproducir video</button>
        </>
      ) : (
        <div className="video-fallback">
          <p>El video final todavía no está listo.</p>
          <p>Quedará en la configuración del cierre, separado del video de inicio.</p>
        </div>
      )}
      <button type="button" className="btn" onClick={() => { ref.current?.pause(); hush(); session.setScreen("P29"); }}>Continuar</button>
    </section>
  );
}

function Farewell() {
  const session = useSession();
  return (
    <section className="stack center">
      <img className="farewell-robot" src="/assets/illustrations/characters/103469.png" alt="" />
      <img className="brand-logo end" src="/assets/brand/84070.png" alt="MIRARIM" />
      <h1>Gracias por explorar juntos</h1>
      <p className="lead">A veces algo cuesta. Podemos sentirlo, buscar apoyo y elegir qué hacer después.</p>
      <p className="lead">{TRANSVERSAL}</p>
      <div className="row">
        <button type="button" className="btn" onClick={() => session.newVisit()}>Nueva sesión</button>
        <button type="button" className="btn secondary" onClick={() => session.setScreen("P30")}>Resumen del acompañante</button>
      </div>
    </section>
  );
}

export function Summary() {
  const session = useSession();
  const { level, missions, cluesFound, helpsUsed } = session.persisted;
  return (
    <section className="stack summary">
      <TopBar title="Resumen del acompañante" />
      <p>Nivel: {level === "exploradores" ? "Exploradores, 4 a 5 años" : "Detectives, 6 a 8 años"}</p>
      <p>Guía: el robot recuerda los números. No hay personajes ni nombres asignados.</p>
      <h2>Misiones</h2>
      <ul>
        <li>El caso de la torre caída: {statusLabel(missions[1])}</li>
        <li>Detenerse y buscar la calma: {statusLabel(missions[2])}</li>
        <li>Mirar y decidir: {statusLabel(missions[3])}</li>
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
