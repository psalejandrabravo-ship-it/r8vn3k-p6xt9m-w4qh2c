import { useEffect, useState } from "react";
import { CLOSE_3, CLOSE_3_CASE, CLOSE_3_MORE } from "../config/case";
import { clueByMission } from "../config/gameConfig";
import { Hud } from "../components/ui";
import { Robot, type RobotPose } from "../components/Robot";
import { blip } from "../lib/sound";
import { speak } from "../lib/speech";
import { useSession } from "../state/sessionStore";

type Phase = "intro" | "order" | "why" | "bridge" | "choices" | "chosen" | "number" | "close";

type Card = { id: string; label: string; image: string };

const SEQUENCE: Card[] = [
  { id: "cae", label: "La torre se cayó.", image: "/assets/story/pagina-3.png" },
  { id: "enojo", label: "Me siento enojado y frustrado.", image: "/assets/story/pagina-4.png" },
  { id: "detengo", label: "Me detengo y pruebo algo que me ayude.", image: "/assets/mision3/me-detengo.png" },
  { id: "decido", label: "Pienso y decido qué hacer.", image: "/assets/mision3/decido.png" },
];

const CONTINUATIONS = [
  { id: "intentar", title: "Intentarlo otra vez", legend: "Puedo volver a construir cuando esté listo.", reply: "Puede volver a intentarlo cuando esté listo. No tiene que salir perfecto.", image: "/assets/mision3/intentar.png" },
  { id: "cambiar", title: "Cambiar la idea", legend: "Puedo probar una base más ancha o una torre más baja.", reply: "Puede probar otra forma de construir. Cambiar el plan también es una opción.", image: "/assets/mision3/cambiar.png" },
  { id: "ayuda", title: "Pedir ayuda", legend: "Puedo pedir que construyamos juntos.", reply: "Puede pedir ayuda y construir acompañado. No tiene que resolverlo solo.", image: "/assets/mision3/ayuda.png" },
  { id: "despues", title: "Dejarlo para después", legend: "Puedo descansar y volver más tarde.", reply: "Puede descansar y volver más tarde. Hacer una pausa no es fracasar.", image: "/assets/mision3/despues.png" },
];

const WHY = [
  { id: "pensar", label: "Me da un momento para pensar y elegir sin lastimar.", reply: "Sí. La pausa puede darnos un momento para pensar qué hacer." },
  { id: "solo", label: "Hace que el problema se arregle solo.", reply: "La pausa no arregla todo ni obliga a dejar de sentir enojo. Puede ayudarnos a elegir el siguiente paso sin lastimar." },
  { id: "obliga", label: "Me obliga a dejar de estar enojado.", reply: "La pausa no arregla todo ni obliga a dejar de sentir enojo. Puede ayudarnos a elegir el siguiente paso sin lastimar." },
];

const INTRO = "Agentes, las pistas de la torre quedaron desordenadas. Ordenemos lo que pasó y descubramos cómo puede continuar la historia.";
const ORDER_PROMPT = "Ordena las cuatro pistas. Toca una y después un espacio, o arrástrala.";
const ORDER_HINT = "Mira qué pasó primero con la torre. Después viene lo que sintió.";
const ORDER_RETRY = "Todavía hay pistas por ordenar. Miremos de nuevo: ¿qué pasó primero con la torre?";
const ORDER_NEXT = "Después de sentir frustración, ¿qué puede ayudar antes de decidir?";
const ORDER_OK = "¡Ordenamos las pistas! La torre se cayó, apareció la frustración y el personaje hizo una pausa para poder elegir qué hacer.";
const WHY_Q = "¿Por qué puede ayudar hacer una pausa antes de decidir?";
const BRIDGE = "No hace falta estar completamente tranquilo para elegir un siguiente paso. Podemos intentarlo otra vez, cambiar el plan, pedir ayuda o dejarlo para después.";
const ASK = "¿Cómo te gustaría que continuara esta historia?";

function mix(cards: Card[]) {
  const next = [...cards];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  if (next.every((card, index) => card.id === SEQUENCE[index].id)) return mix(cards);
  return next;
}

export function Mission3() {
  const session = useSession();
  const older = session.persisted.level === "detectives";
  const number = clueByMission(3).number;
  const [phase, setPhase] = useState<Phase>("intro");
  const [pool, setPool] = useState<Card[]>(() => mix(SEQUENCE));
  const [slots, setSlots] = useState<(Card | null)[]>([null, null, null, null]);
  const [selected, setSelected] = useState<string | null>(null);
  const [orderNote, setOrderNote] = useState<string | null>(null);
  const [hinted, setHinted] = useState(false);
  const [whyNote, setWhyNote] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const choice = CONTINUATIONS.find((item) => item.id === picked);
  const full = slots.every(Boolean);
  const othersReady = Boolean(session.persisted.cluesFound.carta && session.persisted.cluesFound.radio);
  const missionsDone = ([1, 2, 3] as const).every((id) => {
    const status = session.persisted.missions[id];
    return status === "completed" || status === "skipped";
  });

  const say = phase === "intro" ? INTRO
    : phase === "order" ? (hinted ? ORDER_HINT : orderNote ?? ORDER_PROMPT)
    : phase === "why" ? (whyNote ?? WHY_Q)
    : phase === "bridge" ? BRIDGE
    : phase === "choices" ? ASK
    : phase === "chosen" ? choice?.reply
    : phase === "number"
      ? (othersReady
        ? "¡Encontramos el tercer número! Ya tenemos las pistas para abrir el maletín."
        : "¡Encontramos el tercer número! Lo guardaré con las otras pistas.")
      : `${CLOSE_3} ${CLOSE_3_MORE}${missionsDone ? ` ${CLOSE_3_CASE}` : ""}`;

  const pose: RobotPose = phase === "number" ? "descubrimiento"
    : phase === "intro" || phase === "bridge" || phase === "choices" ? "señalando"
    : phase === "order" && !orderNote ? "pensando"
    : "acompañando";

  useEffect(() => {
    if (phase === "number") session.finishMission(3);
  }, [phase]);

  const repeat = () => { if (say) speak(say, session.persisted.narration); };

  const place = (index: number, id = selected) => {
    if (!id) {
      if (slots[index]) setSelected(slots[index]?.id ?? null);
      return;
    }
    const card = SEQUENCE.find((item) => item.id === id);
    if (!card) return;
    const displaced = slots[index];
    const nextSlots = slots.map((slot) => (slot?.id === id ? null : slot));
    nextSlots[index] = card;
    const nextPool = pool.filter((item) => item.id !== id);
    if (displaced && displaced.id !== id) nextPool.push(displaced);
    setSlots(nextSlots);
    setPool(nextPool);
    setSelected(null);
    setHinted(false);
    setOrderNote(null);
    blip(session.persisted.sounds);
  };

  const review = () => {
    const correct = slots.every((card, index) => card?.id === SEQUENCE[index].id);
    const started = slots[0]?.id === "cae" && slots[1]?.id === "enojo";
    setOrderNote(correct ? ORDER_OK : started ? ORDER_NEXT : ORDER_RETRY);
    setHinted(false);
    blip(session.persisted.sounds);
  };

  const goAfterOrder = () => setPhase(older ? "why" : "bridge");
  const ordered = orderNote === ORDER_OK;

  return (
    <section className={`play story-play guide-play mission-3 phase-${phase}`}>
      <Hud title="El caso de las pistas desordenadas" onRepeat={repeat} onHint={phase === "order" ? () => setHinted(true) : undefined} />
      <div className="story-layout">
        <Robot pose={pose} say={say} bubble={phase === "number" || phase === "close"} fresh={phase === "number" ? number : undefined} onTap={phase === "number" ? () => setPhase("close") : phase === "close" ? () => session.setScreen("P06") : undefined} />
        {phase === "intro" && (
          <div className="m3-board">
            <button type="button" className="btn" onClick={() => setPhase("order")}>Ordenar las pistas</button>
          </div>
        )}
        {phase === "order" && (
          <div className="m3-board">
            <div className="m3-pool" aria-label="Pistas desordenadas">
              {pool.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className={selected === card.id ? "m3-card is-selected" : "m3-card"}
                  draggable
                  aria-pressed={selected === card.id}
                  aria-label={card.label}
                  onDragStart={(event) => { event.dataTransfer.setData("text/plain", card.id); setSelected(card.id); }}
                  onClick={() => setSelected(selected === card.id ? null : card.id)}
                >
                  <img src={card.image} alt="" />
                  <span>{card.label}</span>
                </button>
              ))}
            </div>
            <div className="m3-slots">
              {slots.map((card, index) => (
                <button
                  key={index}
                  type="button"
                  className={card && selected === card.id ? "m3-slot is-selected" : "m3-slot"}
                  aria-label={`Espacio ${index + 1}${card ? `, ${card.label}` : ", vacío"}`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => { event.preventDefault(); place(index, event.dataTransfer.getData("text/plain") || selected); }}
                  onClick={() => place(index)}
                >
                  <b>{index + 1}</b>
                  {card && <img src={card.image} alt="" />}
                  {card && <span>{card.label}</span>}
                </button>
              ))}
            </div>
            <div className="m3-actions">
              <button type="button" className="btn" disabled={!full} onClick={review}>Revisar el orden</button>
              {ordered && <button type="button" className="btn" onClick={goAfterOrder}>Continuar</button>}
            </div>
          </div>
        )}
        {phase === "why" && (
          <div className="m3-board">
            <p className="reading ask">{WHY_Q}</p>
            <div className="visual-choices">
              {WHY.map((option) => (
                <button key={option.id} type="button" className="choice" onClick={() => { setWhyNote(option.reply); blip(session.persisted.sounds); }}>{option.label}</button>
              ))}
            </div>
            {whyNote && <button type="button" className="btn" onClick={() => setPhase("bridge")}>Continuar</button>}
          </div>
        )}
        {phase === "bridge" && (
          <div className="m3-board">
            <button type="button" className="btn" onClick={() => setPhase("choices")}>Ver las continuaciones</button>
          </div>
        )}
        {phase === "choices" && (
          <div className="m3-board">
            <p className="reading ask">{ASK}</p>
            <div className="m3-options">
              {CONTINUATIONS.map((option) => (
                <button key={option.id} type="button" className="m3-card" aria-label={option.title} onClick={() => { setPicked(option.id); setPhase("chosen"); blip(session.persisted.sounds); }}>
                  <img src={option.image} alt="" />
                  <span>{option.title}</span>
                  <small>{option.legend}</small>
                </button>
              ))}
            </div>
          </div>
        )}
        {phase === "chosen" && choice && (
          <div className="m3-board">
            <img className="m3-hero" src={choice.image} alt="" />
            <div className="m3-actions">
              <button type="button" className="btn secondary" onClick={() => setPhase("choices")}>Elegir otra continuación</button>
              <button type="button" className="btn" onClick={() => setPhase("number")}>Continuar</button>
            </div>
          </div>
        )}
        {phase === "number" && (
          <div className="m3-board">
            <p className="found-number">{number}</p>
            <button type="button" className="advance-arrow" aria-label="Seguir" onClick={() => setPhase("close")}>
              <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M16 10 L34 24 L16 38" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        )}
        {phase === "close" && (
          <div className="m3-board">
            <button type="button" className="btn map-return" onClick={() => session.setScreen("P06")}>Volver al mapa</button>
          </div>
        )}
      </div>
    </section>
  );
}
