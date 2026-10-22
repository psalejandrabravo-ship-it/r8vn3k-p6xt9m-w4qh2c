import { useState } from "react";
import { CLUES, CODE, CODE_ICONS, TOOLS } from "../config/gameConfig";
import { ClueIcon } from "../components/Icons";
import { CodeToken, Hud } from "../components/ui";
import { Robot } from "../components/Robot";
import { blip } from "../lib/sound";
import { useSession } from "../state/sessionStore";

export function Briefcase() {
  const session = useSession();
  const [mode, setMode] = useState<"iconos" | "numeros">("iconos");
  const slots = session.persisted.activity.code.slots;
  const found = CLUES.filter((clue) => session.persisted.cluesFound[clue.id]);
  const target = mode === "iconos" ? CODE_ICONS : CODE;
  const ready = slots.every((slot, index) => slot === target[index]);
  const go = (toolId: string | null) => {
    if (toolId) session.chooseTool(toolId);
    else session.skipToolChoice();
    session.setScreen("P28");
  };
  return (
    <section className="play story-play guide-play">
      <Hud title="El maletín" />
      <div className="story-layout">
        <Robot
          pose={ready ? "descubrimiento" : "pensando"}
          say={ready ? "Dentro están las herramientas que aprendimos. No hay un premio que haya que llevarse." : "Estos son los números que encontramos. El orden es el de las misiones."}
          bubble
        />
        <div className="dossier">
          {!ready && (
            <>
              <p className="lead">Coloca los números en el orden de las misiones. Si falta uno, el maletín espera.</p>
              <div className="row">
                <button type="button" className={mode === "iconos" ? "choice on" : "choice"} onClick={() => { setMode("iconos"); session.clearCode(); }}>Pistas</button>
                <button type="button" className={mode === "numeros" ? "choice on" : "choice"} onClick={() => { setMode("numeros"); session.clearCode(); }}>Números</button>
              </div>
              <div className="slots">
                {slots.map((token, index) => (
                  <button key={index} type="button" className="letter wide" onClick={() => session.returnCode(index)}>
                    {token ? <CodeToken token={token} /> : index + 1}
                  </button>
                ))}
              </div>
              <div className="tray">
                {mode === "iconos"
                  ? found.map((clue) => (
                    <button key={clue.id} type="button" className="choice" onClick={() => place(clue.id)}><ClueIcon id={clue.id} /> {clue.name}</button>
                  ))
                  : found.map((clue) => (
                    <button key={clue.id} type="button" className="letter" onClick={() => place(String(clue.number))}>{clue.number}</button>
                  ))}
              </div>
            </>
          )}
          {ready && (
            <>
              <p className="lead">Reconocer el enojo, decirlo sin dañar, buscar una forma de calma y probar otra estrategia. Puedes mirar una herramienta, o ninguna.</p>
              {TOOLS.map((tool) => (
                <button key={tool.id} type="button" className="choice" onClick={() => { session.seeTool(tool.id); go(tool.id); }}>
                  {tool.name}. {tool.text}
                </button>
              ))}
              <button type="button" className="choice" onClick={() => go(null)}>Seguir sin elegir</button>
            </>
          )}
        </div>
      </div>
    </section>
  );

  function place(token: string) {
    if (slots.includes(token)) return;
    const next = slots.slice();
    const index = next.findIndex((slot) => slot === null);
    if (index < 0) {
      session.setFeedback("Los tres espacios están llenos. Toca uno para sacarlo.");
      return;
    }
    next[index] = token;
    session.placeCode(token);
    blip(session.persisted.sounds);
    if (next.every(Boolean) && next.some((slot, i) => slot !== target[i])) {
      session.setFeedback("Ese orden no abre el maletín. Toca un espacio para cambiarlo. Las pistas siguen guardadas.");
    }
  }
}
