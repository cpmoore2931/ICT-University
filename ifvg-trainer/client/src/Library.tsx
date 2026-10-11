import { useEffect, useState } from "react";
import { getLibrary, loadWeek, type DayCard, type Library as LibraryData } from "./api";

type Props = {
  onOpen: (symbol: string, day: string, queue: string[]) => void;
};

export function Library({ onOpen }: Props) {
  const [data, setData] = useState<LibraryData | null>(null);
  const [symbol, setSymbol] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh(loader: () => Promise<LibraryData>) {
    setBusy(true);
    setError("");
    try {
      const next = await loader();
      setData(next);
      setSymbol((current) => current || next.symbols[0] || "");
    } catch {
      setError("Cannot load data.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void refresh(getLibrary);
  }, []);

  const days = data && symbol ? data.days[symbol] || [] : [];

  function thisWeek() {
    if (!symbol || !days.length) return;
    const ordered = [...days].sort((a, b) => a.day.localeCompare(b.day));
    const latest = ordered.slice(-5);
    onOpen(symbol, latest[0].day, latest.map((day) => day.day));
  }

  return (
    <main className="library">
      <div className="top">
        <h1>IFVG Trainer</h1>
        <div className="row">
          <button className="yellow" onClick={() => void refresh(loadWeek)} disabled={busy}>
            {busy ? "Loading" : "Load new week"}
          </button>
          <button className="green" onClick={thisWeek} disabled={!days.length}>
            This week
          </button>
        </div>
      </div>

      <div className="legend">
        <span><i className="dot none" /> New</span>
        <span><i className="dot practiced" /> Practiced</span>
        <span><i className="dot passed" /> Passed</span>
      </div>

      {error ? <p className="note">{error}</p> : null}
      {data?.notes.map((note) => (
        <p className="note" key={note}>{note}</p>
      ))}

      {data && data.symbols.length > 1 ? (
        <div className="row symbols">
          {data.symbols.map((item) => (
            <button key={item} className={item === symbol ? "on" : ""} onClick={() => setSymbol(item)}>
              {item}
            </button>
          ))}
        </div>
      ) : null}

      {data && !days.length ? <p>Drop a CSV in data/weekly.</p> : null}

      {days.map((day: DayCard) => (
        <button key={day.day} className="card" onClick={() => onOpen(symbol, day.day, [])}>
          <i className={`dot ${day.status}`} />
          {day.label}
        </button>
      ))}
    </main>
  );
}
