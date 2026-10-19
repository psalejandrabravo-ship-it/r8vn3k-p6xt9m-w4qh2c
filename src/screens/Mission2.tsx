import { useEffect } from "react";
import { PACIENCIA } from "../config/gameConfig";
import { Companion, Hud, LetterBoard } from "../components/ui";
import { blip } from "../lib/sound";
import { solvedTiles } from "../state/logic";
import { useSession } from "../state/sessionStore";

export function Mission2() {
  const session = useSession();
  const explorers = session.persisted.level === "exploradores";
  const { pool, slots, q1, q2, opened } = session.persisted.activity.m2;
  const target = explorers ? "PACIENCIA" : PACIENCIA;
  const ready = solvedTiles(slots, target) || opened;
  useEffect(() => {
    session.prepareM2();
  }, []);
  const finish = () => {
    session.answerM2("q2");
    session.finishMission(2);
    session.setScreen("P06");
    session.setFeedback("Radio, 7 queda en el tablero.");
    blip(session.persisted.sounds);
  };
  return (
    <section className="play">
      <Hud title="Puesto de escucha" />
      <div className="play-layout">
        <Companion pose={ready ? "happy" : "idle"} />
        <div className="dossier">
          {!ready && (
            <>
              <p className="lead">
                {explorers
                  ? "La radio mezcla dos caminos. Elige la tarjeta PACIENCIA."
                  : "Forma PACIENCIA en el panel. Toca una letra colocada para devolverla."}
              </p>
              <LetterBoard
                wide={explorers}
                pool={pool}
                slots={slots}
                onPlace={(id) => {
                  if (slots.every(Boolean)) {
                    session.setFeedback("El panel está lleno. Toca lo que colocaste para devolverlo.");
                    return;
                  }
                  const tile = pool.find((item) => item.id === id);
                  if (explorers && tile?.char === "IMPULSO") {
                    session.setFeedback("IMPULSO empuja a hacerlo ya. Prueba la otra tarjeta. Tu turno sigue igual.");
                    return;
                  }
                  session.placeM2(id);
                  blip(session.persisted.sounds);
                }}
                onRemove={(index) => session.returnM2(index)}
              />
            </>
          )}
          {ready && !q1 && (
            <>
              <p className="lead">La radio se abrió: Radio, 7. El mensaje llega entrecortado. ¿Qué ayuda a escucharlo?</p>
              <button type="button" className="choice" onClick={() => { session.answerM2("q1"); blip(session.persisted.sounds); }}>Volver a escuchar despacito</button>
              <button type="button" className="choice" onClick={() => session.setFeedback("Golpear la radio no aclara el mensaje. Puedes elegir otra vez.")}>Golpear la radio</button>
              <button type="button" className="choice" onClick={() => session.setFeedback("Irse deja la pista donde está. Podemos probar otra opción.")}>Irse sin mirar</button>
            </>
          )}
          {ready && q1 && !q2 && (
            <>
              <p className="lead">Alguien quiere la pista ya. ¿Qué frase se parece a PACIENCIA?</p>
              <button type="button" className="choice" onClick={finish}>Puedo intentar otro paso</button>
              <button type="button" className="choice" onClick={() => session.setFeedback("Tiene que salir ahora mismo es impulso. La radio pide otra frase.")}>Tiene que salir ahora mismo</button>
              <button type="button" className="choice" onClick={() => session.setFeedback("Romper la hoja no guarda la pista. El progreso sigue aquí.")}>Mejor rompo la hoja</button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
