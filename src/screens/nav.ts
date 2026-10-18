import { CALMA, PACIENCIA, type MissionId, type ScreenId } from "../config/gameConfig";
import { solvedTiles } from "../state/logic";
import type { Persisted } from "../state/sessionStore";

export function missionScreen(mission: MissionId, persisted: Persisted): ScreenId {
  const activity = persisted.activity;
  if (mission === 1) {
    if (!activity.m1.riddleSolved) return "P07";
    if (!solvedTiles(activity.m1.slots, CALMA)) return "P09";
    if (persisted.missions[1] === "completed" || persisted.missions[1] === "skipped") return "P11";
    return "P10";
  }
  if (mission === 2) {
    if (!activity.m2.q1) return "P12";
    if (!activity.m2.q2) return "P14";
    const target = persisted.level === "exploradores" ? "PACIENCIA" : PACIENCIA;
    if (!solvedTiles(activity.m2.slots, target)) return "P15";
    if (persisted.missions[2] === "completed" || persisted.missions[2] === "skipped") return "P17";
    return "P16";
  }
  if (!activity.m3.seen) return "P18";
  if (!activity.m3.ordered) return "P20";
  if (!activity.m3.reflected) return "P21";
  return "P22";
}
