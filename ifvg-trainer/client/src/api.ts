export type DayCard = {
  day: string;
  label: string;
  bars: number;
  status: "none" | "practiced" | "passed";
};

export type Library = {
  symbols: string[];
  notes: string[];
  days: Record<string, DayCard[]>;
};

export type Bar = { t: number; o: number; h: number; l: number; c: number; v: number };

export type Session = {
  symbol: string;
  day: string;
  label: string;
  dpp: number;
  tick: number;
  eq: number;
  gap: number;
  pdh: number | null;
  pdl: number | null;
  start: number | null;
  bars: Bar[];
};

export async function getLibrary(): Promise<Library> {
  const boot = (window as Window & { __DATA__?: Library }).__DATA__;
  if (boot && Array.isArray(boot.symbols)) {
    delete (window as Window & { __DATA__?: Library }).__DATA__;
    return boot;
  }
  const response = await fetch("/api/library", { cache: "no-store" });
  if (!response.ok) throw new Error("library");
  return response.json();
}

export async function loadWeek(): Promise<Library> {
  const response = await fetch("/api/import", { method: "POST" });
  if (!response.ok) throw new Error("import");
  return response.json();
}

export async function getSession(symbol: string, day: string): Promise<Session> {
  const response = await fetch(`/api/session?symbol=${symbol}&day=${day}`);
  if (!response.ok) throw new Error("session");
  return response.json();
}

export async function savePractice(symbol: string, day: string, status: "practiced" | "passed"): Promise<void> {
  await fetch("/api/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol, day, status }),
  });
}
