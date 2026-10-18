import type { Tile } from "../config/gameConfig";

export function shuffle<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = next[i];
    const b = next[j];
    if (a !== undefined && b !== undefined) {
      next[i] = b;
      next[j] = a;
    }
  }
  return next;
}

export function tilesFrom(word: string): Tile[] {
  return shuffle(word.split("").map((char, index) => ({ id: `${word}-${index}-${char}`, char })));
}

export function emptySlots(count: number): (Tile | null)[] {
  return Array.from({ length: count }, () => null);
}

export function placeTile(pool: Tile[], slots: (Tile | null)[], id: string): { pool: Tile[]; slots: (Tile | null)[] } | null {
  const index = slots.findIndex((slot) => slot === null);
  const tile = pool.find((item) => item.id === id);
  if (index < 0 || !tile) return null;
  const next = slots.slice();
  next[index] = tile;
  return { pool: pool.filter((item) => item.id !== id), slots: next };
}

export function removeTile(pool: Tile[], slots: (Tile | null)[], index: number): { pool: Tile[]; slots: (Tile | null)[] } | null {
  const tile = slots[index];
  if (!tile) return null;
  const next = slots.slice();
  next[index] = null;
  return { pool: [...pool, tile], slots: next };
}

export function solvedTiles(slots: (Tile | null)[], target: string): boolean {
  if (slots.some((slot) => !slot)) return false;
  return slots.map((slot) => slot?.char ?? "").join("") === target;
}

export function assistTiles(
  pool: Tile[],
  slots: (Tile | null)[],
  target: string,
): { pool: Tile[]; slots: (Tile | null)[]; placed: boolean } {
  const nextSlots = slots.slice();
  let nextPool = [...pool];
  const index = nextSlots.findIndex((slot, i) => !slot || slot.char !== target[i]);
  if (index < 0) return { pool, slots, placed: false };
  const occupying = nextSlots[index];
  if (occupying) {
    nextPool = [...nextPool, occupying];
    nextSlots[index] = null;
  }
  const need = target[index];
  const tile = nextPool.find((item) => item.char === need);
  if (!tile) return { pool: nextPool, slots: nextSlots, placed: false };
  nextSlots[index] = tile;
  nextPool = nextPool.filter((item) => item.id !== tile.id);
  return { pool: nextPool, slots: nextSlots, placed: true };
}

export function placeScene(pool: string[], slots: (string | null)[], id: string): { pool: string[]; slots: (string | null)[] } | null {
  const index = slots.findIndex((slot) => slot === null);
  if (index < 0 || !pool.includes(id)) return null;
  const next = slots.slice();
  next[index] = id;
  return { pool: pool.filter((item) => item !== id), slots: next };
}

export function removeScene(pool: string[], slots: (string | null)[], index: number): { pool: string[]; slots: (string | null)[] } | null {
  const id = slots[index];
  if (!id) return null;
  const next = slots.slice();
  next[index] = null;
  return { pool: [...pool, id], slots: next };
}

export function solvedScenes(slots: (string | null)[], target: string[]): boolean {
  return slots.length === target.length && slots.every((slot, index) => slot === target[index]);
}

export function assistScenes(
  pool: string[],
  slots: (string | null)[],
  target: string[],
): { pool: string[]; slots: (string | null)[]; placed: boolean } {
  const nextSlots = slots.slice();
  let nextPool = [...pool];
  const index = nextSlots.findIndex((slot, i) => slot !== target[i]);
  if (index < 0) return { pool, slots, placed: false };
  const occupying = nextSlots[index];
  if (occupying) {
    nextPool = [...nextPool, occupying];
    nextSlots[index] = null;
  }
  const need = target[index];
  if (!need || !nextPool.includes(need)) return { pool: nextPool, slots: nextSlots, placed: false };
  nextSlots[index] = need;
  nextPool = nextPool.filter((item) => item !== need);
  return { pool: nextPool, slots: nextSlots, placed: true };
}

export function resetTiles(word: string): { pool: Tile[]; slots: (Tile | null)[] } {
  return { pool: tilesFrom(word), slots: emptySlots(word.length) };
}
