import { useState } from "react";
import { CALMA } from "../config/gameConfig";
import { HelpBar, LetterBoard, SceneCast, TopBar } from "../components/ui";
import { blip } from "../lib/sound";
import { solvedTiles } from "../state/logic";
import { useSession } from "../state/sessionStore";

export function Mission1() {
  const screen = useSession().persisted.screen;
  if (screen === "P08") return <Riddle />;
  if (screen === "P09") return <Letters />;
  if (screen === "P10") return <Door />;
  if (screen === "P11") return <Saved />;
  return <Arrive />;
}

function Arrive() {
  const session = useSession();
  return (
    <section className="stack">
      <TopBar title="Sala de las cartas" />
      <SceneCast>
        <div className="prop-door" aria-hidden="true"><span /></div>
      </SceneCast>
      <p className="lead">La puerta no se abre todavía. En la mesa hay una carta: habla de parar, notar y pensar, sin hacer desaparecer lo que se siente.</p>
      <button type="button" className="btn" onClick={() => session.setScreen("P08")}>Leer la carta</button>
    </section>
  );
}

function Riddle() {
  const session = useSession();
  const explorers = session.persisted.level === "exploradores";
  const [hint, setHint] = useState("");
  const done = session.persisted.activity.m1.riddleSolved;
  const correct = () => {
    session.solveRiddle();
    session.setFeedback("CALMA es la palabra de esta puerta. No tenemos que sentirla todo el tiempo para seguir.");
    blip(session.persisted.sounds);
  };
  return (
    <section className="stack">
      <TopBar title="La carta" />
      <p className="lead">
        {explorers
          ? "Al agente no le sale todavía. ¿Qué puede ayudarle a mirar el problema otra vez?"
          : "Cuando algo cuesta, puedo parar un momento, notar cómo estoy y pensar qué hacer. Puedo ayudarme a encontrar…"}
      </p>
      {explorers ? (
        <>
          <button type="button" className={hint === "parar" ? "choice hint" : "choice"} onClick={correct}>Parar y mirar</button>
          <button type="button" className="choice" onClick={() => session.setFeedback("A veces dan ganas de golpear cuando algo molesta. Busquemos una opción que cuide al agente y sus cosas.")}>Golpear la mesa</button>
          <button type="button" className="choice" onClick={() => session.setFeedback("Apartar todo de un empujón puede desordenar la pista. Podemos mirar de otra forma.")}>Apartar todo de un empujón</button>
        </>
      ) : (
        <>
          <button type="button" className={hint === "calma" ? "choice hint" : "choice"} onClick={correct}>CALMA</button>
          <button type="button" className="choice" onClick={() => session.setFeedback("La prisa puede hacer que queramos hacerlo enseguida. Esta carta habla de parar y pensar.")}>PRISA</button>
          <button type="button" className="choice" onClick={() => session.setFeedback("El ruido es algo que escuchamos. La carta busca otra palabra.")}>RUIDO</button>
        </>
      )}
      <HelpBar
        onJuntos={() => { setHint(explorers ? "parar" : "calma"); session.setFeedback("Miramos juntos la opción que invita a parar y pensar."); }}
        onPartes={() => { setHint(explorers ? "parar" : "calma"); session.setFeedback("Un paso: busca la opción que no empuja ni apura."); }}
      />
      {done && <button type="button" className="btn" onClick={() => session.setScreen("P09")}>Formar la palabra</button>}
    </section>
  );
}

function Letters() {
  const session = useSession();
  const { pool, slots } = session.persisted.activity.m1;
  const ready = solvedTiles(slots, CALMA);
  return (
    <section className="stack">
      <TopBar title="Formar CALMA" />
      <p className="lead">Las dos A valen igual. Puedes usar cualquiera en cualquiera de los dos espacios.</p>
      <LetterBoard
        pool={pool}
        slots={slots}
        onPlace={(id) => {
          if (slots.every(Boolean)) {
            session.setFeedback("La palabra está llena. Toca una letra colocada para devolverla.");
            return;
          }
          session.placeM1(id);
          blip(session.persisted.sounds);
        }}
        onRemove={(index) => session.returnM1(index)}
      />
      <HelpBar
        onJuntos={() => session.setFeedback(session.assistM1() ? "Colocamos una letra juntos. El resto sigue igual." : "CALMA ya está formada.")}
        onPartes={() => session.setFeedback(session.assistM1() ? "Un paso: entró la siguiente letra." : "No falta ninguna letra.")}
      />
      <button
        type="button"
        className="btn"
        onClick={() => {
          if (!ready) {
            session.setFeedback("Todavía no dice CALMA. Puedes sacar una letra y probar otra. Tu turno sigue igual.");
            return;
          }
          session.setScreen("P10");
        }}
      >
        Probar la palabra
      </button>
    </section>
  );
}

function Door() {
  const session = useSession();
  const ready = solvedTiles(session.persisted.activity.m1.slots, CALMA);
  const open = session.persisted.activity.m1.doorOpen;
  return (
    <section className="stack center">
      <TopBar title="La puerta" />
      <SceneCast>
        <div className={open ? "prop-door open" : "prop-door"} aria-hidden="true"><span /></div>
      </SceneCast>
      {!ready && <button type="button" className="btn" onClick={() => session.setScreen("P09")}>Volver a las letras</button>}
      {ready && !open && <button type="button" className="btn" onClick={() => { if (!session.openDoor()) session.setFeedback("La palabra todavía no abre la puerta."); else blip(session.persisted.sounds); }}>Abrir la puerta</button>}
      {open && (
        <>
          <p className="lead">Detrás de la puerta está la primera pista: Carta, 4.</p>
          <button type="button" className="btn" onClick={() => { session.finishMission(1); session.setScreen("P11"); }}>Guardar en la libreta</button>
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
      <p className="lead">Carta, 4. Ya está en la libreta. No hace falta recordarla de memoria.</p>
      <button type="button" className="btn" onClick={() => session.setScreen("P06")}>Volver al mapa</button>
    </section>
  );
}
