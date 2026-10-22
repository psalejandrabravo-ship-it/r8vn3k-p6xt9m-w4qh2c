import { useEffect, useState } from "react";
import { CLUES } from "../config/gameConfig";
import { speak } from "../lib/speech";
import { useSession } from "../state/sessionStore";

export type RobotPose = "neutral" | "saludando" | "señalando" | "pensando" | "acompañando" | "descubrimiento";

const POSE_SRC: Record<RobotPose, string> = {
  neutral: "/assets/robot/neutral.png",
  saludando: "/assets/robot/saludando.png",
  señalando: "/assets/robot/señalando.png",
  pensando: "/assets/robot/pensando.png",
  acompañando: "/assets/robot/acompañando.png",
  descubrimiento: "/assets/robot/descubrimiento.png",
};

export function Robot({
  pose,
  say,
  bubble = false,
  fresh,
  className = "",
  onTap,
  src,
}: {
  pose: RobotPose;
  say?: string;
  bubble?: boolean;
  fresh?: number;
  className?: string;
  onTap?: () => void;
  src?: string;
}) {
  const session = useSession();
  const [nudged, setNudged] = useState(false);
  const reduce = session.persisted.reducedMotion;
  useEffect(() => {
    if (!say) return;
    speak(say, session.persisted.narration);
  }, [say, session.persisted.narration]);
  return (
    <div className={`robot-guide${nudged && !reduce ? " nudged" : ""}${reduce ? " still" : ""} ${className}`.trim()}>
      {say && <p className="robot-say">{say}</p>}
      <div className="robot-stack">
        {bubble && <NumberBubble fresh={fresh} />}
        <button
          type="button"
          className="robot-body"
          aria-label="Robot guía"
          onClick={() => {
            onTap?.();
            if (reduce) return;
            setNudged(true);
            window.setTimeout(() => setNudged(false), 420);
          }}
        >
          <img src={src ?? POSE_SRC[pose]} alt="" />
        </button>
      </div>
    </div>
  );
}

export function NumberBubble({ fresh, open = true }: { fresh?: number; open?: boolean }) {
  const clues = useSession().persisted.cluesFound;
  if (!open) return null;
  return (
    <div className="thought" aria-label="Números que recuerda el robot">
      {CLUES.map((clue) => {
        const found = clues[clue.id]?.number;
        return (
          <b key={clue.id} className={found && found === fresh ? "arrive" : found ? "known" : "empty"}>
            {found ?? ""}
          </b>
        );
      })}
    </div>
  );
}
