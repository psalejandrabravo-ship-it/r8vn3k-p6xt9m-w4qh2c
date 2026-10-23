import { useEffect, useState } from "react";
import { clueByMission, type MissionId } from "../config/gameConfig";
import { Hud } from "../components/ui";
import { Robot } from "../components/Robot";
import { blip, chime } from "../lib/sound";
import { useSession } from "../state/sessionStore";

const INTRO = "¡Tenemos las tres pistas! Introduce los números en el orden en que los encontramos. Si necesitas recordarlos, tócame.";
const WRONG = "Todavía no se abre. Revisemos las pistas y el orden de las misiones.";
const OPENED = "¡Abrimos el maletín! Encontraste tu insignia de detective. Tócala para recordar lo que descubrimos.";

const LEARNING = [
  {
    id: 1,
    title: "Reconozco lo que siento",
    summary: "Puedo sentir enojo o frustración.",
    image: "/assets/story/pagina-4.png",
    text: [
      "Cuando algo no sale como esperaba, puedo sentir enojo o frustración. Mi cuerpo puede darme pistas: aprieto las manos, siento calor en la cara o noto tensión.",
      "Sentir enojo no es hacer daño. Puedo decir “estoy enojado” y hacer una pausa para no lastimarme, lastimar a otra persona o romper cosas.",
    ],
  },
  {
    id: 2,
    title: "Pruebo algo que me ayude",
    summary: "Puedo hacer una pausa y buscar apoyo.",
    image: "/assets/illustrations/cards/respirar.png",
    text: [
      "Puedo probar respirar despacio, tomar agua, contar, moverme suavemente, tomar distancia o pedir ayuda y compañía. Si me gustan los abrazos, puedo pedir uno. Si necesito llorar, está bien.",
      "No a todos nos ayuda lo mismo. Puedo probar otra opción si la primera no me ayuda. No tengo que dejar de estar enojado de inmediato.",
    ],
  },
  {
    id: 3,
    title: "Elijo cómo continuar",
    summary: "Puedo pensar y decidir mi siguiente paso.",
    image: "/assets/mision3/decido.png",
    text: [
      "Después de una pausa, puedo intentarlo otra vez, cambiar la idea, pedir ayuda o dejarlo para después.",
      "No hace falta estar completamente tranquilo para elegir qué hacer. A veces necesito más de una pausa o compañía. Descansar también es una opción válida.",
    ],
  },
];

function missionCode(clues: ReturnType<typeof useSession>["persisted"]["cluesFound"]) {
  return ([1, 2, 3] as const).map((mission) => {
    const clue = clueByMission(mission);
    const found = clues[clue.id];
    return { mission, number: found ? String(found.number) : "" };
  });
}

export function Briefcase() {
  const screen = useSession().persisted.screen;
  if (screen === "P25") return <Discoveries />;
  return <CaseLock />;
}

function CaseLock() {
  const session = useSession();
  const reduce = session.persisted.reducedMotion;
  const clues = missionCode(session.persisted.cluesFound);
  const ready = clues.every((item) => item.number) && ([1, 2, 3] as MissionId[]).every((id) => {
    const status = session.persisted.missions[id];
    return status === "completed" || status === "skipped";
  });
  const target = clues.map((item) => item.number).join("");
  const opened = Boolean(session.persisted.ending?.unlocked);
  const [phase, setPhase] = useState<"code" | "opening" | "open">(opened ? "open" : "code");
  const [digits, setDigits] = useState("");
  const [wrong, setWrong] = useState(false);
  const [marked, setMarked] = useState(false);
  const [hints, setHints] = useState(false);
  const [flash, setFlash] = useState(false);
  const [glow, setGlow] = useState(false);
  const [showBadge, setShowBadge] = useState(opened);

  useEffect(() => {
    if (phase !== "code") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key >= "0" && event.key <= "9") {
        event.preventDefault();
        push(event.key);
      } else if (event.key === "Backspace") {
        event.preventDefault();
        erase();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const push = (key: string) => {
    if (phase !== "code" || digits.length >= 3) return;
    const next = `${digits}${key}`;
    setDigits(next);
    setWrong(false);
    blip(session.persisted.sounds);
    if (next.length < 3) return;
    if (next === target) {
      setMarked(true);
      chime(session.persisted.sounds);
      setHints(false);
      if (reduce) {
        setPhase("open");
        setShowBadge(true);
        session.unlockBriefcase();
        return;
      }
      window.setTimeout(() => setFlash(true), 420);
      window.setTimeout(() => { setPhase("opening"); setFlash(false); }, 900);
      window.setTimeout(() => setPhase("open"), 1280);
      window.setTimeout(() => setGlow(true), 1500);
      window.setTimeout(() => {
        setGlow(false);
        setShowBadge(true);
        session.unlockBriefcase();
      }, 2100);
      return;
    }
    setWrong(true);
  };

  const erase = () => {
    if (phase !== "code" || marked) return;
    setDigits((value) => value.slice(0, -1));
    setWrong(false);
  };

  const say = phase === "code" ? (wrong ? WRONG : INTRO) : OPENED;

  if (!ready && !opened) {
    return (
      <section className="play case-finale">
        <Hud title="El maletín" />
        <div className="finale-body">
          <p className="reading ask">El maletín espera las tres pistas. Cuando las tres misiones estén listas, podremos abrirlo.</p>
          <button type="button" className="btn" onClick={() => session.setScreen("P06")}>Volver al mapa</button>
        </div>
      </section>
    );
  }

  return (
    <section className="play case-finale">
      <Hud title="El maletín" />
      <div className="finale-body">
        <Robot pose={phase === "code" ? "señalando" : "descubrimiento"} say={say} onTap={() => setHints((value) => !value)} />
        <p className="case-tap">Tócame para ver las pistas.</p>
        {hints && (
          <div className="thought case-thought" role="dialog" aria-label="Números de las misiones">
            {clues.map((item) => (
              <b key={item.mission} className="known" aria-label={`Misión ${item.mission}: ${item.number}`}>{item.number}</b>
            ))}
          </div>
        )}
        <div className={`case-stage is-${phase}`}>
          <img className="case-pic closed" src="/assets/ui/maletin-cerrado.png" alt="" />
          <img className="case-pic open" src="/assets/ui/maletin-abierto.png" alt={phase === "open" ? "Maletín abierto" : ""} />
          {phase === "code" && (
            <div className={`code-slots${marked ? " is-correct" : ""}`} aria-label="Código del maletín">
              {[0, 1, 2].map((index) => (
                <b key={index} aria-label={digits[index] ? `Dígito ${index + 1}: ${digits[index]}` : `Espacio ${index + 1} vacío`}>{digits[index] ?? ""}</b>
              ))}
            </div>
          )}
          {flash && !reduce && <span className="case-flash" aria-hidden="true" />}
          {glow && !reduce && <span className="case-glow" aria-hidden="true" />}
          {showBadge && (
            <button type="button" className="badge-hit" aria-label="Insignia de detective" onClick={() => session.setScreen("P25")}>
              <img src="/assets/ui/insignia-detective.png" alt="" />
            </button>
          )}
          {showBadge && <p className="badge-legend">Toca tu insignia.</p>}
        </div>
        {phase !== "open" && (
          <div className={`keypad${phase === "opening" ? " is-away" : ""}`} aria-hidden={phase !== "code"}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "borrar", "0"].map((key) => (
              <button
                key={key}
                type="button"
                className={key === "borrar" ? "span-2" : ""}
                disabled={phase !== "code"}
                aria-label={key === "borrar" ? "Borrar" : key}
                onClick={() => (key === "borrar" ? erase() : push(key))}
              >
                {key === "borrar" ? "Borrar" : key}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Discoveries() {
  const session = useSession();
  const [open, setOpen] = useState<number | null>(null);
  const card = LEARNING.find((item) => item.id === open);
  return (
    <section className="play case-finale discoveries">
      <Hud title="Lo que descubrimos" />
      <div className="finale-body learn">
        <Robot pose="acompañando" say="Ser detective también es descubrir qué sentimos y qué podemos hacer. Estas son las pistas que aprendimos." />
        <div className="learn-row">
          {LEARNING.map((item) => (
            <button
              key={item.id}
              type="button"
              className={open === item.id ? "learn-card on" : "learn-card"}
              aria-expanded={open === item.id}
              onClick={() => setOpen(open === item.id ? null : item.id)}
            >
              <small>Misión {item.id}</small>
              <img src={item.image} alt="" />
              <b>{item.title}</b>
              <span>{item.summary}</span>
            </button>
          ))}
        </div>
        {card && (
          <article className="learn-detail">
            {card.text.map((line) => <p key={line}>{line}</p>)}
          </article>
        )}
        <button type="button" className="btn" onClick={() => session.completeAdventure()}>Misión completada</button>
      </div>
    </section>
  );
}
