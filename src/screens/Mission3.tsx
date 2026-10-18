import { ALMA, REFLECTIONS, SCENE_ORDER, SCENES } from "../config/gameConfig";
import { HelpBar, TopBar } from "../components/ui";
import { blip } from "../lib/sound";
import { solvedScenes } from "../state/logic";
import { useSession } from "../state/sessionStore";

export function Mission3() {
  const screen = useSession().persisted.screen;
  if (screen === "P19") return <Gallery />;
  if (screen === "P20") return <Order />;
  if (screen === "P21") return <Reflect />;
  if (screen === "P22") return <Saved />;
  return <Arrive />;
}

function Arrive() {
  const session = useSession();
  return (
    <section className="stack">
      <TopBar title="Archivo de las huellas" />
      <p className="lead">Cuatro momentos de Alma están sueltos. Primero los miramos. Después los ponemos en el orden en que ocurrieron.</p>
      <img className="alma" src={ALMA.image} alt="Alma, agente de trenza oscura" />
      <button type="button" className="btn" onClick={() => session.setScreen("P19")}>Mirar los momentos</button>
    </section>
  );
}

function Gallery() {
  const session = useSession();
  return (
    <section className="stack">
      <TopBar title="Los cuatro momentos" />
      <div className="scenes">
        {SCENES.map((scene) => (
          <article key={scene.id} className="scene-card">
            <img src={ALMA.image} alt="" />
            <div>
              <b>{scene.id}. {scene.title}</b>
              <p>{scene.text}</p>
            </div>
          </article>
        ))}
      </div>
      <button type="button" className="btn" onClick={() => { session.seeScenes(); session.setScreen("P20"); }}>Ordenarlos</button>
    </section>
  );
}

function Order() {
  const session = useSession();
  const { pool, slots } = session.persisted.activity.m3;
  return (
    <section className="stack">
      <TopBar title="Ordenar A, B, C y D" />
      <p className="lead">Toca un momento y entra en el primer espacio libre. Toca un espacio para devolverlo. Si el orden no coincide, no se pierde nada.</p>
      <div className="slots" aria-label="Orden de la historia">
        {slots.map((id, index) => {
          const scene = SCENES.find((item) => item.id === id);
          return (
            <button key={index} type="button" className="scene-slot" onClick={() => session.returnM3(index)}>
              {scene ? `${scene.id}. ${scene.title}` : `${index + 1}`}
            </button>
          );
        })}
      </div>
      <div className="tray">
        {pool.map((id) => {
          const scene = SCENES.find((item) => item.id === id);
          if (!scene) return null;
          return (
            <button key={id} type="button" className="choice" onClick={() => {
              if (slots.every(Boolean)) {
                session.setFeedback("Los cuatro espacios están llenos. Toca uno para devolver ese momento.");
                return;
              }
              session.placeM3(id);
              blip(session.persisted.sounds);
            }}>
              {scene.id}. {scene.title}
            </button>
          );
        })}
      </div>
      <div className="row">
        <button type="button" className="btn quiet" onClick={() => { session.resetM3(); session.setFeedback("Los momentos volvieron a mezclarse. La historia no se borró."); }}>Mezclar de nuevo</button>
      </div>
      <HelpBar
        onJuntos={() => session.setFeedback(session.assistM3() ? "Colocamos el siguiente momento juntos." : "El orden ya es A, B, C, D.")}
        onPartes={() => session.setFeedback(session.assistM3() ? "Un momento quedó en su lugar." : "No falta ningún momento.")}
      />
      <button
        type="button"
        className="btn"
        onClick={() => {
          if (!solvedScenes(slots, SCENE_ORDER)) {
            session.setFeedback("Este orden no cuenta la historia de Alma. Puedes mover un momento. Tu turno sigue igual.");
            return;
          }
          session.markOrdered();
          blip(session.persisted.sounds);
          session.setScreen("P21");
        }}
      >
        Revisar la historia
      </button>
    </section>
  );
}

function Reflect() {
  const session = useSession();
  return (
    <section className="stack">
      <TopBar title="Después de la historia" />
      <p className="lead">Todas estas opciones cuidan a Alma. Puedes elegir cualquiera.</p>
      {REFLECTIONS.map((item) => (
        <button
          key={item.id}
          type="button"
          className="choice"
          onClick={() => {
            session.reflect(item.id, item.label);
            session.finishMission(3);
            session.setFeedback("Esa opción también es válida. La pista queda guardada.");
            session.setScreen("P22");
          }}
        >
          {item.label}
        </button>
      ))}
      <HelpBar
        onJuntos={() => session.setFeedback("Cualquiera de estas opciones es válida. No hay una sola respuesta correcta.")}
        onPartes={() => session.setFeedback("Un paso: elige la que quieras. Todas continúan.")}
      />
    </section>
  );
}

function Saved() {
  const session = useSession();
  return (
    <section className="stack">
      <TopBar title="Pista guardada" />
      <p className="lead">Huellas, 2. Alma pudo sentir que costaba y aun así seguir. La pista está en la libreta.</p>
      <button type="button" className="btn" onClick={() => session.setScreen("P06")}>Volver al mapa</button>
    </section>
  );
}
