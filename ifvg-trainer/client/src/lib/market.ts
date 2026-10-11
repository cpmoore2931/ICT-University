/** Chart time, levels, and gaps. All clocks are New York. No future bars. */

export type Bar = { t: number; o: number; h: number; l: number; c: number; v: number };

export type Level = {
  id: string;
  name: string;
  price: number;
  color: string;
  dashed?: boolean;
};

export type Fvg = {
  dir: "bull" | "bear";
  top: number;
  bottom: number;
  left: number;
  formed: number;
  inverted: boolean;
};

const NY = "America/New_York";

export function nyParts(unix: number): { hh: number; mm: number; key: string } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: NY,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const bag: Record<string, string> = {};
  for (const part of fmt.formatToParts(new Date(unix * 1000))) {
    bag[part.type] = part.value;
  }
  let hh = Number(bag.hour);
  if (hh === 24) hh = 0;
  const key = `${bag.year}-${bag.month}-${bag.day}`;
  return { hh, mm: Number(bag.minute), key };
}

export function formatClock(unix: number): string {
  const text = new Intl.DateTimeFormat("en-US", {
    timeZone: NY,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(unix * 1000));
  return `${text} ET`;
}

export function sliceTo(bars: Bar[], cursor: number): Bar[] {
  const out: Bar[] = [];
  for (const bar of bars) {
    if (bar.t > cursor) break;
    out.push(bar);
  }
  return out;
}

export function aggregate(bars: Bar[], minutes: number): Bar[] {
  if (minutes <= 1) return bars;
  const size = minutes * 60;
  const out: Bar[] = [];
  for (const bar of bars) {
    const t = Math.floor(bar.t / size) * size;
    const last = out[out.length - 1];
    if (!last || last.t !== t) {
      out.push({ t, o: bar.o, h: bar.h, l: bar.l, c: bar.c, v: bar.v });
    } else {
      last.h = Math.max(last.h, bar.h);
      last.l = Math.min(last.l, bar.l);
      last.c = bar.c;
      last.v += bar.v;
    }
  }
  return out;
}

export function stepForward(bars: Bar[], cursor: number, tfMin: number): number {
  const size = tfMin * 60;
  const bucket = Math.floor(cursor / size) * size;
  let lastInBucket = cursor;
  for (const bar of bars) {
    if (bar.t < cursor) continue;
    if (Math.floor(bar.t / size) * size === bucket) lastInBucket = bar.t;
    else break;
  }
  if (lastInBucket > cursor) return lastInBucket;
  const next = bars.find((bar) => bar.t > cursor);
  if (!next) return cursor;
  const nextBucket = Math.floor(next.t / size) * size;
  let last = next.t;
  for (const bar of bars) {
    if (Math.floor(bar.t / size) * size === nextBucket) last = bar.t;
  }
  return last;
}

export function stepBack(bars: Bar[], cursor: number, tfMin: number, floor: number): number {
  const size = tfMin * 60;
  const curBucket = Math.floor(cursor / size) * size;
  let prev = -1;
  for (const bar of bars) {
    if (bar.t >= floor && Math.floor(bar.t / size) * size < curBucket) prev = bar.t;
  }
  return prev < 0 ? floor : prev;
}

export function roundTick(price: number, tick: number): number {
  const steps = Math.round(price / tick);
  const rounded = steps * tick;
  return Math.round(rounded * 1000) / 1000;
}

function minutes(unix: number): number {
  const parts = nyParts(unix);
  return parts.hh * 60 + parts.mm;
}

function range(bars: Bar[], start: number, end: number): { high: number; low: number } | null {
  let high = -Infinity;
  let low = Infinity;
  let count = 0;
  for (const bar of bars) {
    const mark = minutes(bar.t);
    if (mark >= start && mark < end) {
      high = Math.max(high, bar.h);
      low = Math.min(low, bar.l);
      count += 1;
    }
  }
  if (!count) return null;
  return { high, low };
}

function swings(bars: Bar[], wing: number, mode: "high" | "low"): { index: number; price: number }[] {
  const found: { index: number; price: number }[] = [];
  for (let i = wing; i < bars.length - wing; i += 1) {
    let ok = true;
    for (let k = i - wing; k <= i + wing; k += 1) {
      if (k === i) continue;
      if (mode === "high" && bars[k].h >= bars[i].h) ok = false;
      if (mode === "low" && bars[k].l <= bars[i].l) ok = false;
      if (!ok) break;
    }
    if (ok) found.push({ index: i, price: mode === "high" ? bars[i].h : bars[i].l });
  }
  return found;
}

function equalPrices(bars: Bar[], mode: "high" | "low", tol: number): number[] {
  const points = swings(bars, 4, mode);
  const levels: { price: number; index: number }[] = [];
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length && j < i + 8; j += 1) {
      if (Math.abs(points[i].price - points[j].price) > tol) continue;
      const price = mode === "high"
        ? Math.max(points[i].price, points[j].price)
        : Math.min(points[i].price, points[j].price);
      let tagged = false;
      for (let k = points[j].index + 1; k < bars.length; k += 1) {
        if (mode === "high" && bars[k].h >= price) tagged = true;
        if (mode === "low" && bars[k].l <= price) tagged = true;
        if (tagged) break;
      }
      if (!tagged) levels.push({ price, index: points[j].index });
    }
  }
  const last = bars[bars.length - 1]?.c ?? 0;
  levels.sort((a, b) => Math.abs(a.price - last) - Math.abs(b.price - last));
  const unique: number[] = [];
  for (const level of levels) {
    if (unique.every((price) => Math.abs(price - level.price) > tol)) unique.push(level.price);
    if (unique.length === 2) break;
  }
  return unique;
}

export function buildLevels(
  oneMin: Bar[],
  tfBars: Bar[],
  pdh: number | null,
  pdl: number | null,
  eqTol: number,
): Level[] {
  const levels: Level[] = [];
  const asia = range(oneMin, 20 * 60, 24 * 60);
  const london = range(oneMin, 2 * 60, 5 * 60);
  const pre = range(oneMin, 4 * 60, 8 * 60 + 30);
  if (asia) {
    levels.push({ id: "asia-high", name: "Asia high", price: asia.high, color: "#FFE600" });
    levels.push({ id: "asia-low", name: "Asia low", price: asia.low, color: "#FFE600" });
  }
  if (london) {
    levels.push({ id: "london-high", name: "London high", price: london.high, color: "#00E676" });
    levels.push({ id: "london-low", name: "London low", price: london.low, color: "#00E676" });
  }
  if (pre) {
    levels.push({ id: "pre-high", name: "Pre high", price: pre.high, color: "#FF2D2D" });
    levels.push({ id: "pre-low", name: "Pre low", price: pre.low, color: "#FF2D2D" });
  }
  if (pdh != null) levels.push({ id: "day-high", name: "Day high", price: pdh, color: "#FFFFFF" });
  if (pdl != null) levels.push({ id: "day-low", name: "Day low", price: pdl, color: "#FFFFFF" });
  for (const price of equalPrices(tfBars, "high", eqTol)) {
    levels.push({
      id: `eq-high-${price}`,
      name: "Equal high",
      price,
      color: "#FFE600",
      dashed: true,
    });
  }
  for (const price of equalPrices(tfBars, "low", eqTol)) {
    levels.push({
      id: `eq-low-${price}`,
      name: "Equal low",
      price,
      color: "#FFE600",
      dashed: true,
    });
  }
  return levels;
}

export function dolChoices(levels: Level[], last: number): Level[] {
  return levels.filter((level) => {
    const draw = level.id === "asia-high" || level.id === "london-high" || level.id.startsWith("eq-high");
    return draw && level.price > last;
  });
}

export type StepMark = {
  n: number;
  name: string;
  t: number;
  price: number;
};

export type TradeMark = {
  kind: "entry" | "stop" | "target" | "exit";
  name: string;
  why: string;
  t: number;
  price: number;
};

function afterOpenLock(unix: number): boolean {
  const { hh, mm } = nyParts(unix);
  if (hh >= 18) return false;
  return hh > 8 || (hh === 8 && mm >= 30);
}

function isDraw(level: Level): boolean {
  return level.id === "asia-high" || level.id === "london-high" || level.id.startsWith("eq-high");
}

type Pattern = {
  sweep: number;
  extreme: number;
  extremeAt: number;
  shape: number;
  gapTop: number;
  gapBottom: number;
  flip: number;
  retest: number;
};

/** The long pattern, using only bars already on screen. */
function readPattern(bars: Bar[], vMin: number, minGap: number): Pattern | null {
  if (!bars.length || !afterOpenLock(bars[bars.length - 1].t)) return null;
  const pre = range(bars, 4 * 60, 8 * 60 + 30);
  if (!pre) return null;

  let sweep = -1;
  for (let i = 0; i < bars.length; i += 1) {
    if (afterOpenLock(bars[i].t) && bars[i].l < pre.low) {
      sweep = i;
      break;
    }
  }
  if (sweep < 0) return null;

  const windowEnd = bars[sweep].t + 20 * 60;
  let extreme = Infinity;
  let extremeAt = sweep;
  let shape = -1;
  for (let i = sweep; i < bars.length && bars[i].t <= windowEnd; i += 1) {
    if (bars[i].l < extreme) {
      extreme = bars[i].l;
      extremeAt = i;
    }
    if (i !== sweep && bars[i].c > pre.low && bars[i].c - extreme >= vMin) {
      shape = i;
      break;
    }
  }

  const empty: Pattern = {
    sweep,
    extreme,
    extremeAt,
    shape,
    gapTop: 0,
    gapBottom: 0,
    flip: -1,
    retest: -1,
  };
  if (shape < 0) return empty;

  const gaps: { top: number; bottom: number; formed: number }[] = [];
  for (let i = Math.max(2, sweep); i < bars.length; i += 1) {
    const first = bars[i - 2];
    const third = bars[i];
    if (first.l > third.h && first.l - third.h >= minGap) {
      gaps.push({ top: first.l, bottom: third.h, formed: i });
    }
  }

  let flip = -1;
  let chosen: { top: number; bottom: number } | null = null;
  for (const gap of gaps) {
    for (let k = Math.max(gap.formed + 1, shape + 1); k < bars.length; k += 1) {
      if (bars[k].c > gap.top) {
        if (flip < 0 || k < flip) {
          flip = k;
          chosen = gap;
        }
        break;
      }
    }
  }
  if (flip < 0 || !chosen) return empty;

  let retest = -1;
  for (let i = flip + 1; i < bars.length; i += 1) {
    if (bars[i].c < chosen.bottom) break;
    if (bars[i].l <= chosen.top && bars[i].h >= chosen.bottom) {
      retest = i;
      break;
    }
  }
  return {
    sweep,
    extreme,
    extremeAt,
    shape,
    gapTop: chosen.top,
    gapBottom: chosen.bottom,
    flip,
    retest,
  };
}

/** Numbers 1–5 for the model. Only bars already on screen. */
export function findStepMarks(
  bars: Bar[],
  levels: Level[],
  dolId: string,
  vMin: number,
  minGap: number,
): StepMark[] {
  if (!bars.length) return [];
  const marks: StepMark[] = [];
  const last = bars[bars.length - 1];
  const draws = dolId
    ? levels.filter((level) => level.id === dolId)
    : levels.filter((level) => isDraw(level) && level.price > last.c);
  for (const level of draws) {
    marks.push({ n: 1, name: "DOL", t: last.t, price: level.price });
  }

  const pattern = readPattern(bars, vMin, minGap);
  if (!pattern) return marks;
  marks.push({ n: 2, name: "Sweep", t: bars[pattern.sweep].t, price: bars[pattern.sweep].l });
  if (pattern.shape < 0) return marks;
  marks.push({ n: 3, name: "V-shape", t: bars[pattern.shape].t, price: bars[pattern.shape].h });
  if (pattern.flip < 0) return marks;
  marks.push({ n: 4, name: "Inversion", t: bars[pattern.flip].t, price: bars[pattern.flip].c });
  if (pattern.retest < 0) return marks;
  marks.push({ n: 5, name: "Retest", t: bars[pattern.retest].t, price: bars[pattern.retest].l });
  return marks;
}

/** Entry, stop, target, and the exit that prints. Only after the retest. */
export function findTradeMarks(
  bars: Bar[],
  levels: Level[],
  dolId: string,
  vMin: number,
  minGap: number,
  tick: number,
): TradeMark[] {
  const pattern = readPattern(bars, vMin, minGap);
  if (!pattern || pattern.retest < 0) return [];

  const entry = pattern.gapTop;
  const stop = tick > 0 ? roundTick(pattern.extreme - tick, tick) : pattern.extreme;
  const marks: TradeMark[] = [
    { kind: "entry", name: "Entry", why: "In the gap", t: bars[pattern.retest].t, price: entry },
    { kind: "stop", name: "Stop", why: "Under the sweep", t: bars[pattern.extremeAt].t, price: stop },
  ];

  const picked = dolId ? levels.find((level) => level.id === dolId) : undefined;
  const target = picked && picked.price > entry
    ? picked
    : levels
        .filter((level) => isDraw(level) && level.price > entry)
        .sort((a, b) => a.price - b.price)[0];
  if (target) {
    marks.push({
      kind: "target",
      name: "Target",
      why: "The DOL",
      t: bars[pattern.retest].t,
      price: target.price,
    });
  }

  for (let i = pattern.retest + 1; i < bars.length; i += 1) {
    if (bars[i].l <= stop) {
      marks.push({ kind: "exit", name: "Exit", why: "Low broke", t: bars[i].t, price: stop });
      break;
    }
    if (target && bars[i].h >= target.price) {
      marks.push({ kind: "exit", name: "Exit", why: "DOL hit", t: bars[i].t, price: target.price });
      break;
    }
  }
  return marks;
}

export function findFvgs(bars: Bar[], minSize: number): Fvg[] {
  const gaps: Fvg[] = [];
  for (let i = 2; i < bars.length; i += 1) {
    const first = bars[i - 2];
    const third = bars[i];
    if (third.l > first.h && third.l - first.h >= minSize) {
      gaps.push({
        dir: "bull",
        top: third.l,
        bottom: first.h,
        left: bars[i - 1].t,
        formed: third.t,
        inverted: false,
      });
    } else if (first.l > third.h && first.l - third.h >= minSize) {
      gaps.push({
        dir: "bear",
        top: first.l,
        bottom: third.h,
        left: bars[i - 1].t,
        formed: third.t,
        inverted: false,
      });
    }
  }
  for (const gap of gaps) {
    for (const bar of bars) {
      if (bar.t <= gap.formed) continue;
      if (gap.dir === "bull" && bar.c < gap.bottom) {
        gap.inverted = true;
        break;
      }
      if (gap.dir === "bear" && bar.c > gap.top) {
        gap.inverted = true;
        break;
      }
    }
  }
  return gaps.slice(-8);
}
