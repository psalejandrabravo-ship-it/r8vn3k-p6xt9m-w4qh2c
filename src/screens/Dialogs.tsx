import { CLUES, TRANSVERSAL, agentById, sourceLabel } from "../config/gameConfig";
import { useSession, type DialogId } from "../state/sessionStore";
import type { MissionId } from "../config/gameConfig";

export function Dialogs() {
  const session = useSession();
  const dialog = session.dialog;
  if (!dialog) return null;
  return (
    <div className="dialog" role="dialog" aria-modal="true">
      <div className="dialog-card">
        {dialog === "guide" && <Guide onClose={() => session.openDialog(null)} />}
        {dialog === "pause" && <Pause />}
        {dialog === "breath" && <Breath />}
        {dialog === "end" && <End />}
        {dialog === "notebook" && <Notebook />}
        {dialog === "fichas" && <Fichas />}
        {dialog === "adult" && <Adult />}
        {dialog !== "guide" && dialog !== "pause" && dialog !== "breath" && dialog !== "end" && dialog !== "notebook" && dialog !== "fichas" && dialog !== "adult" && (
          <Fallback dialog={dialog} />
        )}
      </div>
    </div>
  );
}

function Fallback({ dialog }: { dialog: DialogId }) {
  const session = useSession();
  return (
    <>
      <p>{dialog}</p>
      <button type="button" className="btn" onClick={() => session.openDialog(null)}>Cerrar</button>
    </>
  );
}

function Guide({ onClose }: { onClose: () => void }) {
  return (
    <>
      <h2>Guía para acompañar</h2>
      <ul>
        <li>Validar lo que se siente, sin exigir que desaparezca.</li>
        <li>Ofrecer apoyos concretos: juntos, por partes o una pausa.</li>
        <li>Ajustar el nivel si hace falta.</li>
        <li>No forzar la frustración ni una sola respuesta correcta cuando todas cuidan.</li>
        <li>Detenerse si se necesita acompañamiento fuera de la pantalla.</li>
      </ul>
      <p>{TRANSVERSAL}</p>
      <button type="button" className="btn" onClick={onClose}>Cerrar</button>
    </>
  );
}

function Pause() {
  const session = useSession();
  return (
    <>
      <h2>Podemos detenernos</h2>
      <p>Lo que hicimos sigue guardado.</p>
      <button type="button" className="btn" onClick={() => session.openDialog(null)}>Descansar un momento</button>
      <button type="button" className="btn" onClick={() => session.openDialog(null)}>Moverme un poco</button>
      <button type="button" className="btn" onClick={() => session.openDialog("breath")}>Respirar suave, si quiero</button>
      <button type="button" className="btn quiet" onClick={() => session.openDialog(null)}>Volver</button>
      <button type="button" className="btn gold" onClick={() => session.openDialog("end")}>Terminar por hoy</button>
    </>
  );
}

function Breath() {
  const session = useSession();
  const calm = session.persisted.reducedMotion;
  return (
    <>
      <h2>Respirar suave</h2>
      {calm ? <p>Podemos quedar en silencio un momento, sin animación.</p> : <div className="breath" aria-hidden="true" />}
      <p>No es obligatorio. El juego espera.</p>
      <button type="button" className="btn" onClick={() => session.openDialog(null)}>Volver</button>
    </>
  );
}

function End() {
  const session = useSession();
  return (
    <>
      <h2>Terminar por hoy</h2>
      <p>La persona adulta puede confirmar. El progreso técnico queda en esta pestaña.</p>
      <button type="button" className="btn" onClick={() => { session.openDialog(null); session.setScreen("P29"); }}>Sí, terminar</button>
      <button type="button" className="btn quiet" onClick={() => session.openDialog(null)}>Seguir jugando</button>
    </>
  );
}

function Notebook() {
  const session = useSession();
  return (
    <>
      <h2>Libreta de investigación</h2>
      <ul>
        {CLUES.map((clue) => {
          const found = session.persisted.cluesFound[clue.id];
          return <li key={clue.id}>{clue.name}: {found ? `${found.number}. ${sourceLabel(found.source)}` : "Pendiente"}</li>;
        })}
      </ul>
      <button type="button" className="btn" onClick={() => session.openDialog(null)}>Cerrar</button>
    </>
  );
}

function Fichas() {
  const session = useSession();
  const ids = session.persisted.selectedAgents.filter((id) => id > 0);
  return (
    <>
      <h2>Fichas</h2>
      {ids.length === 0 && <p>Todavía no hay agentes elegidos.</p>}
      <div className="fichas">
        {ids.map((id) => {
          const agent = agentById(id);
          if (!agent) return null;
          return (
            <article key={id}>
              <img src={agent.image} alt="" />
              <b>{agent.short}</b>
              <span className="mini-pips">
                {CLUES.map((clue) => <i key={clue.id} className={session.persisted.cluesFound[clue.id] ? "on" : ""} />)}
              </span>
            </article>
          );
        })}
      </div>
      <button type="button" className="btn" onClick={() => session.openDialog(null)}>Cerrar</button>
    </>
  );
}

function Adult() {
  const session = useSession();
  const missions: { id: MissionId; name: string }[] = [
    { id: 1, name: "Sala de las cartas" },
    { id: 2, name: "Puesto de escucha" },
    { id: 3, name: "Archivo de las huellas" },
  ];
  return (
    <>
      <h2>Panel del adulto</h2>
      <p>Omitir entrega la pista con apoyo y deja la misión como «Con apoyo», no como completada.</p>
      {missions.map((mission) => (
        <button
          key={mission.id}
          type="button"
          className="btn secondary"
          onClick={() => {
            const message = session.skipMission(mission.id);
            session.setFeedback(message);
            session.openDialog(null);
          }}
        >
          Apoyo en {mission.name}
        </button>
      ))}
      <label className="notes">
        Notas de esta visita
        <textarea value={session.memory.sessionNotes} onChange={(event) => session.setNotes(event.target.value)} rows={3} />
      </label>
      <p className="fine">Las notas no se guardan al cerrar la pestaña ni salen en el resumen.</p>
      <button type="button" className="btn" onClick={() => { session.openDialog(null); session.setScreen("P30"); }}>Resumen</button>
      <button type="button" className="btn quiet" onClick={() => session.openDialog(null)}>Cerrar</button>
    </>
  );
}
