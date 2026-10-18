import { useState } from "react";
import { PACIENCIA } from "../config/gameConfig";
import { HelpBar, LetterBoard, SceneCast, TopBar } from "../components/ui";
import { blip } from "../lib/sound";
import { solvedTiles } from "../state/logic";
import { useSession } from "../state/sessionStore";

export function Mission2() {
  const screen = useSession().persisted.screen;
  if (screen === "P13") return <Question which="q1" />;
  if (screen === "P14") return <Question which="q2" />;
  if (screen === "P15") return <Panel />;
  if (screen === "P16") return <RadioOpen />;
  if (screen === "P17") return <Saved />;
  return <Arrive />;
}

function Arrive() {
  const session = useSession();
  return (
    <section className="stack">
      <TopBar title="Puesto de escucha" />
      <SceneCast>
        <div className="prop-radio" aria-hidden="true" />
      </SceneCast>
      <p className="lead">La radio mezcla dos voces. Una invita a esperar y volver a escuchar. La otra empuja a hacerlo ya.</p>
      <button type="button" className="btn" onClick={() => { session.prepareM2(); session.setScreen("P13"); }}>Escuchar</button>
    </section>
  );
}

function Question({ which }: { which: "q1" | "q2" }) {
  const session = useSession();
  const [hint, setHint] = useState("");
  const answered = session.persisted.activity.m2[which];
  const first = which === "q1";
  const correct = () => {
    session.answerM2(which);
    session.setFeedback(first ? "Volver a escuchar es un camino de paciencia." : "Intentar otro paso se parece a PACIENCIA.");
    blip(session.persisted.sounds);
  };
  return (
    <section className="stack">
      <TopBar title={first ? "Primera escucha" : "Segunda escucha"} />
      <p className="lead">
        {first
          ? "El mensaje llega entrecortado. ¿Qué ayuda a escucharlo?"
          : "El agente quiere la pista ya. ¿Qué frase se parece a PACIENCIA?"}
      </p>
      {first ? (
        <>
          <button type="button" className={hint === "escuchar" ? "choice hint" : "choice"} onClick={correct}>Volver a escuchar despacito</button>
          <button type="button" className="choice" onClick={() => session.setFeedback("Golpear la radio no aclara el mensaje. Tu turno sigue igual. Puedes elegir otra vez.")}>Golpear la radio</button>
          <button type="button" className="choice" onClick={() => session.setFeedback("Irse sin mirar deja la pista donde está. Podemos probar otra opción.")}>Irse sin mirar</button>
        </>
      ) : (
        <>
          <button type="button" className={hint === "paso" ? "choice hint" : "choice"} onClick={correct}>Puedo intentar otro paso</button>
          <button type="button" className="choice" onClick={() => session.setFeedback("Tiene que salir ahora mismo es impulso. La radio pide otra frase.")}>Tiene que salir ahora mismo</button>
          <button type="button" className="choice" onClick={() => session.setFeedback("Romper la hoja no guarda la pista. El progreso sigue aquí.")}>Mejor rompo la hoja</button>
        </>
      )}
      <HelpBar
        onJuntos={() => { setHint(first ? "escuchar" : "paso"); session.setFeedback(first ? "Juntos señalamos volver a escuchar. Esa opción queda marcada." : "Juntos marcamos la frase que permite otro paso."); }}
        onPartes={() => { setHint(first ? "escuchar" : "paso"); session.setFeedback(first ? "Un paso: mira la opción marcada, la que no golpea ni se va." : "Un paso: mira la frase marcada, la que no apura."); }}
      />
      {answered && (
        <button type="button" className="btn" onClick={() => session.setScreen(first ? "P14" : "P15")}>
          {first ? "Siguiente pregunta" : "Ir al panel"}
        </button>
      )}
    </section>
  );
}

function Panel() {
  const session = useSession();
  const explorers = session.persisted.level === "exploradores";
  const { pool, slots } = session.persisted.activity.m2;
  const target = explorers ? "PACIENCIA" : PACIENCIA;
  const ready = solvedTiles(slots, target);
  return (
    <section className="stack">
      <TopBar title="Panel de la radio" />
      <p className="lead">
        {explorers
          ? "Elige la tarjeta PACIENCIA para la radio. IMPULSO puede volver a la mesa."
          : "Forma PACIENCIA. Si reinicias el panel, las preguntas que ya respondiste siguen guardadas."}
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
            session.setFeedback("IMPULSO empuja a hacerlo ya. Puedes dejar esa tarjeta en la mesa y probar la otra.");
            return;
          }
          session.placeM2(id);
          blip(session.persisted.sounds);
        }}
        onRemove={(index) => session.returnM2(index)}
      />
      <div className="row">
        <button type="button" className="btn quiet" onClick={() => { session.resetM2Panel(); session.setFeedback("El panel volvió a empezar. Las preguntas siguen respondidas."); }}>Reiniciar panel</button>
      </div>
      <HelpBar
        onJuntos={() => session.setFeedback(session.assistM2() ? "Colocamos una pieza juntos." : "El panel ya muestra PACIENCIA.")}
        onPartes={() => session.setFeedback(session.assistM2() ? "Un paso quedó colocado. Lo demás no se borró." : "No falta ninguna pieza.")}
      />
      <button type="button" className="btn" onClick={() => ready ? session.setScreen("P16") : session.setFeedback("Todavía no está PACIENCIA. Puedes reiniciar el panel sin perder las preguntas.")}>
        Probar el panel
      </button>
    </section>
  );
}

function RadioOpen() {
  const session = useSession();
  const explorers = session.persisted.level === "exploradores";
  const target = explorers ? "PACIENCIA" : PACIENCIA;
  const ready = solvedTiles(session.persisted.activity.m2.slots, target) || session.persisted.activity.m2.opened;
  return (
    <section className="stack center">
      <TopBar title="Abrir la radio" />
      <SceneCast>
        <div className={session.persisted.activity.m2.opened ? "prop-radio on" : "prop-radio"} />
      </SceneCast>
      {!ready && <button type="button" className="btn" onClick={() => session.setScreen("P15")}>Volver al panel</button>}
      {ready && !session.persisted.activity.m2.opened && (
        <button type="button" className="btn" onClick={() => { if (session.openRadio()) blip(session.persisted.sounds); }}>Abrir con PACIENCIA</button>
      )}
      {session.persisted.activity.m2.opened && (
        <>
          <p className="lead">La radio deja la segunda pista: Radio, 7.</p>
          <button type="button" className="btn" onClick={() => { session.finishMission(2); session.setScreen("P17"); }}>Guardar en la libreta</button>
        </>
      )}
    </section>
  );
}

function Saved() {
  const session = useSession();
  return (
    <section className="stack">
      <TopBar title="Pista guardada" />
      <p className="lead">Radio, 7. La libreta la guarda por ti.</p>
      <button type="button" className="btn" onClick={() => session.setScreen("P06")}>Volver al mapa</button>
    </section>
  );
}
