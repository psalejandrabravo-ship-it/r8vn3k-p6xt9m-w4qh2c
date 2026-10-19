import { ALMA, SCENE_ORDER, SCENES } from "../config/gameConfig";
import { CalmLearn } from "../components/CalmLearn";
import { Companion, Hud } from "../components/ui";
import { blip } from "../lib/sound";
import { placeScene, solvedScenes } from "../state/logic";
import { useSession } from "../state/sessionStore";

export function Mission3() {
  const session = useSession();
  const { pool, slots, ordered } = session.persisted.activity.m3;
  const done = session.persisted.missions[3] === "completed" || session.persisted.missions[3] === "skipped";
  const ready = ordered || done;
  const leave = () => {
    session.finishMission(3);
    session.setScreen("P06");
    session.setFeedback("El número 2 queda en el tablero.");
    blip(session.persisted.sounds);
  };
  return (
    <section className="play with-scene">
      <img className="scene-art" src="/assets/illustrations/scenes/sala.jpg" alt="" />
      <Hud title="Archivo de las huellas" onPrevious={() => session.setScreen("P12")} />
      <div className="play-layout">
        <Companion pose={ready ? "happy" : "idle"} />
        {ready ? (
          <CalmLearn step={3} number={2} revealed={done} onContinue={leave} />
        ) : (
          <div className="dossier">
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
          </div>
        )}
      </div>
    </section>
  );
}
