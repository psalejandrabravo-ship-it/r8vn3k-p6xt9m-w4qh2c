import { useEffect, useState } from "react";
import { CASE_BRIDGE, CLOSE_1, CLOSE_1_NEXT, NUMBER_LINE, OPEN_CASE, QUESTIONS, STORY, STORY_TITLE } from "../config/case";
import { clueByMission } from "../config/gameConfig";
import { Hud } from "../components/ui";
import { Robot, type RobotPose } from "../components/Robot";
import { blip } from "../lib/sound";
import { speak } from "../lib/speech";
import { useSession } from "../state/sessionStore";

type Phase = "open" | "story" | "questions" | "number" | "close";
const BOOK_OPEN = "/assets/story/libro-abierto.png";
const BOOK_TURN = "/assets/story/libro-pasa.png";

export function Mission1() {
  const session = useSession();
  const done = session.persisted.missions[1] === "completed" || session.persisted.missions[1] === "skipped";
  const questions = QUESTIONS[session.persisted.level];
  const [phase, setPhase] = useState<Phase>(done ? "close" : "open");
  const [greet, setGreet] = useState<RobotPose>("saludando");
  const [page, setPage] = useState(0);
  const [turning, setTurning] = useState(false);
  const [bridged, setBridged] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [reply, setReply] = useState<string | null>(null);
  const [replyNext, setReplyNext] = useState<"retry" | "continue" | "number">("retry");
  const [picked, setPicked] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const number = clueByMission(1).number;
  const question = questions[qIndex];
  const narration = session.persisted.narration;

  useEffect(() => {
    if (phase !== "open") return;
    const timer = window.setTimeout(() => setGreet("señalando"), session.persisted.reducedMotion ? 0 : 700);
    return () => window.clearTimeout(timer);
  }, [phase, session.persisted.reducedMotion]);

  useEffect(() => {
    if (phase === "number" && !done) session.finishMission(1);
  }, [phase, done]);

  useEffect(() => {
    if (phase === "story") speak(STORY[page].text, narration);
    else if (phase === "questions" && bridged && !reply) speak(question.prompt, narration);
  }, [phase, page, bridged, reply, qIndex, narration, question.prompt]);

  const goPage = (next: number) => {
    if (turning || next < 0 || next >= STORY.length || next === page) return;
    if (session.persisted.reducedMotion) {
      setPage(next);
      blip(session.persisted.sounds);
      return;
    }
    setTurning(true);
    window.setTimeout(() => {
      setPage(next);
      setTurning(false);
      blip(session.persisted.sounds);
    }, 680);
  };

  const pose: RobotPose = phase === "open" ? greet
    : phase === "number" ? "descubrimiento"
    : phase === "questions" && !bridged ? "pensando"
    : phase === "questions" && reply ? "acompañando"
    : phase === "questions" ? "pensando"
    : phase === "close" ? "acompañando"
    : "señalando";

  const say = phase === "open" ? OPEN_CASE
    : phase === "questions" && !bridged ? CASE_BRIDGE
    : phase === "questions" && reply ? reply
    : phase === "number" ? NUMBER_LINE
    : phase === "close" ? `${CLOSE_1} ${CLOSE_1_NEXT}`
    : undefined;

  const repeat = () => {
    const text = phase === "story" ? STORY[page].text
      : phase === "questions" && bridged && !reply ? question.prompt
      : say;
    if (text) speak(text, narration);
  };

  return (
    <section className="play story-play">
      <Hud title={STORY_TITLE} onRepeat={repeat} onHint={phase === "questions" && bridged && !reply ? () => { setHint(question.hint); speak(question.hint, narration); } : undefined} />
      <div className="story-layout">
        <Robot pose={pose} say={say} bubble={phase === "number" || phase === "close"} fresh={phase === "number" ? number : undefined} />
        {phase === "open" && (
          <div className="story-stage">
            <img className="book-pic intro-book" src={BOOK_OPEN} alt="" />
            <button type="button" className="btn" onClick={() => { setPhase("story"); setPage(0); }}>Abrir el cuento</button>
          </div>
        )}
        {phase === "story" && (
          <div className="story-stage">
            <p className="reading">{STORY[page].text}</p>
            {!turning && <img className="popout" src={STORY[page].image} alt="" />}
            <img className="book-pic" src={turning ? BOOK_TURN : BOOK_OPEN} alt="" />
            <div className="book-nav">
              <button type="button" className="text-arrow" disabled={page === 0 || turning} onClick={() => goPage(page - 1)}>Anterior</button>
              <span>{page + 1} / {STORY.length}</span>
              {page < STORY.length - 1 ? (
                <button type="button" className="text-arrow" disabled={turning} onClick={() => goPage(page + 1)}>Siguiente</button>
              ) : (
                <button type="button" className="btn" onClick={() => { setPhase("questions"); setBridged(false); setQIndex(0); setReply(null); setPicked(null); setHint(null); }}>Investigar el caso</button>
              )}
            </div>
          </div>
        )}
        {phase === "questions" && (
          <div className="case-ask">
            {!bridged ? (
              <button type="button" className="btn" onClick={() => setBridged(true)}>Seguir</button>
            ) : reply ? (
              <div className="ask-reply">
                {question.options.find((option) => option.id === picked)?.image && (
                  <img src={question.options.find((option) => option.id === picked)?.image} alt="" />
                )}
                <button type="button" className="btn" onClick={() => {
                  if (replyNext === "retry") { setReply(null); setPicked(null); return; }
                  if (replyNext === "number" || qIndex + 1 >= questions.length) { setPhase("number"); return; }
                  setQIndex(qIndex + 1);
                  setReply(null);
                  setPicked(null);
                  setHint(null);
                }}>{replyNext === "retry" ? "Elegir otra opción" : "Seguir"}</button>
              </div>
            ) : (
              <>
                <p className="reading ask">{question.prompt}</p>
                {hint && <p className="hint-line">{hint}</p>}
                {question.support && <img className="support" src={question.support} alt="" />}
                {question.options.some((option) => option.image) ? (
                  <div className="action-cards">
                    {question.options.map((option) => (
                      <button key={option.id} type="button" className="action-card" aria-label={option.label} onClick={() => { setPicked(option.id); setReply(option.reply); setReplyNext(option.next); blip(session.persisted.sounds); }}>
                        {option.image && <img src={option.image} alt="" />}
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="visual-choices">
                    {question.options.map((option) => (
                      <button key={option.id} type="button" className="choice" onClick={() => { setPicked(option.id); setReply(option.reply); setReplyNext(option.next); blip(session.persisted.sounds); }}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {phase === "number" && (
          <div className="case-ask">
            <p className="found-number">{number}</p>
            <button type="button" className="btn" onClick={() => setPhase("close")}>Seguir</button>
          </div>
        )}
        {phase === "close" && (
          <div className="case-ask">
            <p className="reading ask">{CLOSE_1}</p>
            <p className="reading ask">{CLOSE_1_NEXT}</p>
            <button type="button" className="btn" onClick={() => session.setScreen("P06")}>Volver al mapa</button>
          </div>
        )}
      </div>
    </section>
  );
}
