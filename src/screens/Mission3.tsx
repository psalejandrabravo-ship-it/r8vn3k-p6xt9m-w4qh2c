import { ALMA, REFLECTIONS, SCENE_ORDER, SCENES } from "../config/gameConfig";
import { Companion, Hud } from "../components/ui";
import { blip } from "../lib/sound";
import { placeScene, solvedScenes } from "../state/logic";
import { useSession } from "../state/sessionStore";

export function Mission3() {
  const session = useSession();
  const { pool, slots, ordered } = session.persisted.activity.m3;
  const learn = (id: string) => {
    session.reflect(id, REFLECTIONS.find((item) => item.id === id)?.label ?? "");
    session.finishMission(3);
    session.setScreen("P06");
    session.setFeedback("Huellas, 2 queda en el tablero.");
    blip(session.persisted.sounds);
  };
  return (
    <section className="play">
      <Hud title="Archivo de las huellas" />
      <div className="play-layout">
        <Companion pose={ordered ? "happy" : "idle"} />
        <div className="dossier">
          {!ordered && (
            <>
              <p className="lead">Ordena los momentos de Alma: A, B, C y D. Si no coincide, nada se pierde.</p>
              <div className="slots" aria-label="Orden de la historia">
                {slots.map((id, index) => {
                  const scene = SCENES.find((item) => item.id === id);
                  return (
                    <button key={index} type="button" className="scene-slot" onClick={() => session.returnM3(index)}>
                      {scene ? `${scene.id}. ${scene.title}` : index + 1}
                    </button>
                  );
                })}
              </div>
              <div className="tray">
                {pool.map((id) => {
                  const scene = SCENES.find((item) => item.id === id);
                  if (!scene) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      className="choice"
                      onClick={() => {
                        if (slots.every(Boolean)) {
                          session.setFeedback("Los cuatro espacios están llenos. Toca uno para devolver ese momento.");
                          return;
                        }
                        const next = placeScene(pool, slots, id);
                        if (!next) return;
                        session.placeM3(id);
                        blip(session.persisted.sounds);
                        if (next.slots.every(Boolean) && !solvedScenes(next.slots, SCENE_ORDER)) {
                          session.setFeedback("Este orden no cuenta la historia. Toca un momento para moverlo. Tu turno sigue igual.");
                        }
                      }}
                    >
                      <img src={ALMA.image} alt="" />
                      {scene.id}. {scene.title}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {ordered && (
            <>
              <p className="lead">Alma pudo sentir que costaba y aun así seguir. Huellas, 2. Todas estas opciones cuidan.</p>
              {REFLECTIONS.map((item) => (
                <button key={item.id} type="button" className="choice" onClick={() => learn(item.id)}>{item.label}</button>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
