import { useEffect, useRef, useState } from "react";
import { CLOSE_3, CLOSE_3_CASE, CLOSE_3_MORE } from "../config/case";
import { clueByMission } from "../config/gameConfig";
import { Hud } from "../components/ui";
import { Robot, type RobotPose } from "../components/Robot";
import { blip } from "../lib/sound";
import { speak, hush } from "../lib/speech";
import { useSession } from "../state/sessionStore";

type Phase = "intro" | "order" | "why" | "bridge" | "choices" | "chosen" | "number" | "close";

type Card = { id: string; label: string; image: string };

const SEQUENCE: Card[] = [
  { id: "cae", label: "La torre se cayó.", image: "/assets/story/pagina-3.png" },
  { id: "enojo", label: "Me siento enojado y frustrado.", image: "/assets/story/pagina-4.png" },
  { id: "detengo", label: "Me detengo e intento calmarme un poco.", image: "/assets/mision3/me-detengo.png" },
  { id: "decido", label: "Pienso y busco qué hacer.", image: "/assets/mision3/decido.png" },
];

const CONTINUATIONS = [
  { id: "intentar", title: "Intentarlo otra vez", legend: "Puedo volver a construir cuando esté listo.", reply: "Puede volver a intentarlo cuando esté listo. No tiene que salir perfecto.", image: "/assets/mision3/intentar.png", video: "/assets/video/intentar.mp4" },
  { id: "cambiar", title: "Cambiar la idea", legend: "Puedo probar una base más ancha o una torre más baja.", reply: "Puede probar otra forma de construir. Cambiar el plan también es una opción.", image: "/assets/mision3/cambiar.png", video: "/assets/video/cambiar.mp4" },
  { id: "ayuda", title: "Pedir ayuda", legend: "Puedo pedir que construyamos juntos.", reply: "Puede pedir ayuda y construir acompañado. No tiene que resolverlo solo.", image: "/assets/mision3/ayuda.png", video: "/assets/video/ayuda.mp4" },
  { id: "despues", title: "Dejarlo para después", legend: "Puedo descansar y volver más tarde.", reply: "Puede descansar y volver más tarde. Hacer una pausa no es fracasar.", image: "/assets/mision3/despues.png", video: "/assets/video/despues.mp4" },
];

const WHY = [
  { id: "pensar", label: "Me da un momento para pensar y elegir sin lastimar.", reply: "Sí. La pausa puede darnos un momento para pensar qué hacer." },
  { id: "solo", label: "Hace que el problema se arregle solo.", reply: "La pausa no arregla todo ni obliga a dejar de sentir enojo. Puede ayudarnos a elegir el siguiente paso sin lastimar." },
  { id: "obliga", label: "Me obliga a dejar de estar enojado.", reply: "La pausa no arregla todo ni obliga a dejar de sentir enojo. Puede ayudarnos a elegir el siguiente paso sin lastimar." },
];

const INTRO = "Agentes, las pistas de la torre quedaron desordenadas. Ordenemos lo que pasó y descubramos cómo puede continuar la historia.";
const ORDER_HINT = "Mira qué pasó primero con la torre. Después viene lo que sintió.";
const ORDER_RETRY = "Todavía hay pistas por ordenar. Miremos de nuevo: ¿qué pasó primero con la torre?";
const ORDER_NEXT = "Después de sentir frustración, ¿qué puede ayudar antes de decidir?";
const ORDER_OK = "¡Ordenamos las pistas! La torre se cayó, apareció la frustración y el personaje hizo una pausa para poder elegir qué hacer.";
const WHY_Q = "¿Por qué puede ayudar hacer una pausa antes de decidir?";
const BRIDGE = "No hace falta estar completamente tranquilo para decidir qué hacer. Una pausa ayuda a no actuar por impulso.";
const ASK = "¿Qué podríamos hacer cuando nos enfrentamos a la frustración?";

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
  const [phase, setPhase] = useState<Phase>("order");
  const [pool, setPool] = useState<Card[]>(() => mix(SEQUENCE));
  const [slots, setSlots] = useState<(Card | null)[]>([null, null, null, null]);
  const [selected, setSelected] = useState<string | null>(null);
  const [orderNote, setOrderNote] = useState<string | null>(null);
  const [hinted, setHinted] = useState(false);
  const [whyId, setWhyId] = useState<string | null>(null);
  const [whyNote, setWhyNote] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const videos = useRef<Record<string, HTMLVideoElement | null>>({});
  const choice = CONTINUATIONS.find((item) => item.id === picked);
  const othersReady = Boolean(session.persisted.cluesFound.carta && session.persisted.cluesFound.radio);
  const missionsDone = ([1, 2, 3] as const).every((id) => {
    const status = session.persisted.missions[id];
    return status === "completed" || status === "skipped";
  });

  const say = phase === "intro" ? INTRO
    : phase === "order" ? (hinted ? ORDER_HINT : orderNote ?? INTRO)
    : phase === "why" ? (whyNote ?? WHY_Q)
    : phase === "choices" ? (choice && !choice.video ? choice.reply : BRIDGE)
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
    if (nextSlots.every(Boolean)) {
      const correct = nextSlots.every((item, index) => item?.id === SEQUENCE[index].id);
      const started = nextSlots[0]?.id === "cae" && nextSlots[1]?.id === "enojo";
      setOrderNote(correct ? ORDER_OK : started ? ORDER_NEXT : ORDER_RETRY);
    } else {
      setOrderNote(null);
    }
    blip(session.persisted.sounds);
  };

  const choose = (id: string, src: string) => {
    setPicked(id);
    blip(session.persisted.sounds);
    CONTINUATIONS.forEach((item) => {
      const node = videos.current[item.id];
      if (!node || item.id === id) return;
      node.pause();
      node.currentTime = 0;
    });
    if (!src) {
      setPlaying(null);
      return;
    }
    hush();
    const node = videos.current[id];
    if (!node) return;
    if (playing === id && !node.paused) {
      node.pause();
      setPlaying(null);
      return;
    }
    if (node.ended) node.currentTime = 0;
    void node.play();
    setPlaying(id);
  };
  const ordered = orderNote === ORDER_OK;
  const goAfterOrder = () => setPhase(older ? "why" : "choices");
  const reorder = () => {
    setPool(mix(SEQUENCE));
    setSlots([null, null, null, null]);
    setSelected(null);
    setOrderNote(null);
    setHinted(false);
  };
  const lift = (id: string) => {
    const card = SEQUENCE.find((item) => item.id === id);
    if (!card || !slots.some((slot) => slot?.id === id)) return;
    setSlots(slots.map((slot) => (slot?.id === id ? null : slot)));
    setPool(pool.some((item) => item.id === id) ? pool : [...pool, card]);
    setSelected(null);
    setOrderNote(null);
  };

  return (
    <section className={`play story-play guide-play mission-3 phase-${phase}`}>
      <Hud title="El caso de las pistas desordenadas" onRepeat={phase === "order" ? reorder : repeat} repeatLabel={phase === "order" ? "Reordenar" : "Repetir"} onHint={phase === "order" ? () => setHinted(true) : undefined} />
      <div className="story-layout">
        <Robot pose={pose} say={say} bubble={phase === "number"} fresh={phase === "number" ? number : undefined} onTap={phase === "number" ? () => session.setScreen("P06") : undefined} />
        {phase === "order" && (
          <div className="m3-board">
            <div
              className="m3-pool"
              aria-label="Pistas desordenadas"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => { event.preventDefault(); lift(event.dataTransfer.getData("text/plain") || selected || ""); }}
              onClick={(event) => { if (event.target === event.currentTarget && selected) lift(selected); }}
            >
              {pool.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className={selected === card.id ? "m3-card is-selected" : "m3-card"}
                  draggable
                  aria-pressed={selected === card.id}
                  aria-label={card.label}
                  onDragStart={(event) => { event.dataTransfer.setData("text/plain", card.id); setSelected(card.id); }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => { event.preventDefault(); event.stopPropagation(); lift(event.dataTransfer.getData("text/plain") || selected || ""); }}
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
                  className={`m3-slot${card && selected === card.id ? " is-selected" : ""}${ordered ? " is-correct" : ""}`}
                  draggable={Boolean(card)}
                  aria-label={`Espacio ${index + 1}${card ? `, ${card.label}` : ", vacío"}`}
                  onDragStart={(event) => { if (!card) return; event.dataTransfer.setData("text/plain", card.id); setSelected(card.id); }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => { event.preventDefault(); event.stopPropagation(); place(index, event.dataTransfer.getData("text/plain") || selected); }}
                  onClick={() => place(index)}
                >
                  <b>{index + 1}</b>
                  {card && <img src={card.image} alt="" />}
                  {card && <span>{card.label}</span>}
                </button>
              ))}
            </div>
            <div className="m3-actions">
              {ordered && <p className="m3-ticket">¡Bien hecho!</p>}
              {ordered && <button type="button" className="btn" onClick={goAfterOrder}>Continuar</button>}
            </div>
          </div>
        )}
        {phase === "why" && (
          <div className="m3-board">
            <p className="reading ask">{WHY_Q}</p>
            <div className="visual-choices">
              {WHY.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`choice${whyId && option.id === "pensar" ? " is-right" : ""}${whyId === option.id && option.id !== "pensar" ? " is-soft" : ""}`}
                  onClick={() => { setWhyId(option.id); setWhyNote(option.reply); blip(session.persisted.sounds); }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {whyNote && <button type="button" className="btn" onClick={() => setPhase("choices")}>Continuar</button>}
          </div>
        )}
        {phase === "choices" && (
          <div className="m3-board">
            <p className="reading ask">{ASK}</p>
            <div className="m3-options">
              {CONTINUATIONS.map((option) => (
                <div key={option.id} className={picked === option.id ? "m3-card is-selected" : "m3-card"}>
                  <div className="m3-frame">
                    <img src={option.image} alt="" />
                    {option.video && (
                      <video
                        ref={(node) => { videos.current[option.id] = node; }}
                        className={playing === option.id ? "is-on" : ""}
                        src={option.video}
                        playsInline
                        onEnded={() => setPlaying((current) => (current === option.id ? null : current))}
                      />
                    )}
                  </div>
                  <span>{option.title}</span>
                  <button type="button" className="m3-hit" aria-label={option.title} onClick={() => choose(option.id, option.video)} />
                </div>
              ))}
            </div>
            <button type="button" className="btn" onClick={() => { hush(); setPhase("number"); }}>Continuar</button>
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
            <button type="button" className="advance-arrow" aria-label="Volver al mapa" onClick={() => session.setScreen("P06")}>
              <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M16 10 L34 24 L16 38" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
