import { describe, expect, it } from "vitest";
import { aggregate, buildLevels, formatClock, nyParts, sliceTo, stepForward } from "./market";
import type { Bar } from "./market";

function unix(iso: string): number {
  return Date.parse(iso) / 1000;
}

function bar(iso: string, high: number, low: number, close = high): Bar {
  return { t: unix(iso), o: close, h: high, l: low, c: close, v: 1 };
}

describe("New York time", () => {
  it("turns the sample UTC stamp into 9:30 AM ET", () => {
    const t = unix("2026-10-05T13:30:00Z");
    const parts = nyParts(t);
    expect(parts.key).toBe("2026-10-05");
    expect(parts.hh).toBe(9);
    expect(parts.mm).toBe(30);
    expect(formatClock(t)).toBe("9:30 AM ET");
  });

  it("uses standard time in January", () => {
    const parts = nyParts(unix("2026-01-15T14:30:00Z"));
    expect(parts.hh).toBe(9);
    expect(parts.mm).toBe(30);
  });
});

describe("replay levels hide the future", () => {
  const bars = [
    bar("2026-10-06T00:00:00Z", 110, 100),
    bar("2026-10-06T03:00:00Z", 112, 101),
    bar("2026-10-06T06:00:00Z", 105, 99),
    bar("2026-10-06T07:00:00Z", 108, 100),
    bar("2026-10-06T08:00:00Z", 101, 98, 100),
    bar("2026-10-06T08:30:00Z", 150, 90, 140),
    bar("2026-10-06T13:00:00Z", 200, 80, 190),
  ];

  it("at 4:00 AM only uses Asia and London so far", () => {
    const cursor = unix("2026-10-06T08:00:00Z");
    const seen = sliceTo(bars, cursor);
    expect(seen).toHaveLength(5);
    const levels = buildLevels(seen, seen, 180, 70, 1);
    const asia = levels.find((level) => level.id === "asia-high");
    const london = levels.find((level) => level.id === "london-high");
    const pre = levels.find((level) => level.id === "pre-low");
    expect(asia?.price).toBe(112);
    expect(london?.price).toBe(108);
    expect(pre?.price).toBe(98);
    expect(levels.find((level) => level.id === "day-high")?.price).toBe(180);
    expect(levels.some((level) => level.price === 150 || level.price === 200)).toBe(false);
  });
});

describe("timeframes", () => {
  it("builds one 5-minute candle from five 1-minute bars", () => {
    const start = unix("2026-10-06T08:00:00Z");
    const bars: Bar[] = [0, 1, 2, 3, 4].map((i) => ({
      t: start + i * 60,
      o: 10 + i,
      h: 20 + i,
      l: 5,
      c: 12 + i,
      v: 1,
    }));
    const [candle] = aggregate(bars, 5);
    expect(candle.o).toBe(10);
    expect(candle.h).toBe(24);
    expect(candle.l).toBe(5);
    expect(candle.c).toBe(16);
    expect(stepForward(bars, bars[0].t, 5)).toBe(bars[4].t);
  });
});
