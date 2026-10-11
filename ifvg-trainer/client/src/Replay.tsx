import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSession, savePractice, type Session } from "./api";
import { ChartPane } from "./ChartPane";
import {
  aggregate,
  buildLevels,
  dolChoices,
  findFvgs,
  formatClock,
  roundTick,
  sliceTo,
  stepBack,
  stepForward,
} from "./lib/market";

const STEPS = [
  { id: "sweep", name: "Sweep" },
  { id: "vshape", name: "V-shape" },
  { id: "inversion", name: "Inversion" },
  { id: "retest", name: "Retest" },
] as const;

type Props = {
  symbol: string;
  day: string;
  queue: string[];
  onBack: () => void;
  onNext: (day: string) => void;
};

export function Replay({ symbol, day, queue, onBack, onNext }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const [cursor, setCursor] = useState(0);
  const [tf, setTf] = useState<1 | 5 | 15>(1);
  const [speed, setSpeed] = useState<1 | 5 | 20>(1);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const [dol, setDol] = useState("");
  const [arm, setArm] = useState<"entry" | "stop" | "target" | null>(null);
  const [entry, setEntry] = useState<number | null>(null);
  const [stop, setStop] = useState<number | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [warn, setWarn] = useState("");
  const [passed, setPassed] = useState(false);
  const practiced = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    let live = true;
    setError("");
    getSession(symbol, day)
      .then((next) => {
        if (!live) return;
        setSession(next);
        setCursor(next.start ?? next.bars[0]?.t ?? 0);
      })
      .catch(() => {
        if (live) setError("No data for this day.");
      });
    return () => {
      live = false;
    };
  }, [symbol, day]);

  const seen = useMemo(() => (session ? sliceTo(session.bars, cursor) : []), [session, cursor]);
  const view = useMemo(() => aggregate(seen, tf), [seen, tf]);
  const levels = useMemo(
    () => (session ? buildLevels(seen, view, session.pdh, session.pdl, session.eq) : []),
    [session, seen, view],
  );
  const gaps = useMemo(() => (session ? findFvgs(view, session.gap) : []), [session, view]);
  const draws = useMemo(() => dolChoices(levels, seen[seen.length - 1]?.c ?? 0), [levels, seen]);

  const markPracticed = useCallback(() => {
    if (practiced.current || passed) return;
    practiced.current = true;
    void savePractice(symbol, day, "practiced");
  }, [symbol, day, passed]);

  function go(next: number) {
    if (!session || next === cursor) return;
    setCursor(next);
    markPracticed();
  }

  useEffect(() => {
    if (!playing || !session) return;
    const ms = speed === 1 ? 1000 : speed === 5 ? 200 : 50;
    const id = window.setInterval(() => {
      setCursor((current) => {
        const next = stepForward(session.bars, current, tf);
        if (next === current) setPlaying(false);
        else if (session.start != null && next > session.start) markPracticed();
        return next;
      });
    }, ms);
    return () => window.clearInterval(id);
  }, [playing, speed, session, tf, markPracticed]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") go(stepForward(session?.bars || [], cursor, tf));
      if (event.key === "ArrowLeft" && session?.start) {
        go(stepBack(session.bars, cursor, tf, session.start));
      }
      if (event.key === " ") {
        event.preventDefault();
        setPlaying((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function tick(id: string) {
    if (done.includes(id)) return;
    const next = STEPS.find((step) => !done.includes(step.id));
    if (!dol || next?.id !== id) return;
    setDone((current) => [...current, id]);
    setWarn("");
  }

  function pickDol(id: string) {
    setDol(id);
    setWarn("");
  }

  const onPrice = useCallback((price: number) => {
    if (!session || !arm) return;
    const rounded = roundTick(price, session.tick);
    if (arm === "entry") setEntry(rounded);
    if (arm === "stop") setStop(rounded);
    if (arm === "target") setTarget(rounded);
    setWarn("");
  }, [arm, session]);

  function enter() {
    const stepsDone = Boolean(dol) && STEPS.every((step) => done.includes(step.id));
    if (!stepsDone) {
      setWarn("NOT A SETUP");
      return;
    }
    if (entry == null || stop == null || target == null) {
      setWarn("Set entry, stop, and target.");
      return;
    }
    setPassed(true);
    setWarn("");
    void savePractice(symbol, day, "passed");
  }

  const queueIndex = queue.indexOf(day);
  const later = queueIndex >= 0 ? queue[queueIndex + 1] : undefined;

  if (error) {
    return (
      <main className="replay">
        <button onClick={onBack}>Back</button>
        <p className="note">{error}</p>
      </main>
    );
  }

  if (!session) return <main className="replay"><h1>Loading</h1></main>;

  const priceText = (value: number | null) => (value == null ? "—" : value.toFixed(2));

  return (
    <main className="replay">
      <div className="replay-head">
        <button onClick={onBack}>Back</button>
        <h1>{session.label}</h1>
        {queueIndex >= 0 ? <strong>{queueIndex + 1} of {queue.length}</strong> : null}
        <div className="clock">{cursor ? formatClock(cursor) : ""}</div>
      </div>

      {warn === "NOT A SETUP" ? <div className="banner">NOT A SETUP</div> : null}
      {warn && warn !== "NOT A SETUP" ? <p className="note">{warn}</p> : null}
      {passed ? <div className="passed">Passed</div> : null}

      <div className="replay-body">
        <ChartPane
          bars={view}
          levels={levels}
          fvgs={gaps}
          marks={{ entry: entry ?? undefined, stop: stop ?? undefined, target: target ?? undefined }}
          onPrice={onPrice}
        />
        <aside className="side">
          <div className="side-scroll">
            <div className={dol ? "step done" : "step"}>1. DOL</div>
            {!dol
              ? draws.map((level) => (
                  <button key={level.id} className="choice" onClick={() => pickDol(level.id)}>
                    {level.name} {level.price.toFixed(2)}
                  </button>
                ))
              : null}
            {STEPS.map((step, index) => {
              const ready = Boolean(dol) && done.length === index;
              const complete = done.includes(step.id);
              return (
                <button
                  key={step.id}
                  className={complete ? "done" : ready ? "yellow" : "locked"}
                  onClick={() => tick(step.id)}
                >
                  {index + 2}. {step.name}
                </button>
              );
            })}
            <div className="prices">
              <button className={arm === "entry" ? "on" : ""} onClick={() => setArm("entry")}>
                Entry {priceText(entry)}
              </button>
              <button className={arm === "stop" ? "on" : ""} onClick={() => setArm("stop")}>
                Stop {priceText(stop)}
              </button>
              <button className={arm === "target" ? "on" : ""} onClick={() => setArm("target")}>
                Target {priceText(target)}
              </button>
            </div>
          </div>
          <button className="red" onClick={enter}>6. Enter</button>
          {later ? <button className="green" onClick={() => onNext(later)}>Next day</button> : null}
        </aside>
      </div>

      <div className="controls">
        <button onClick={() => session.start && go(stepBack(session.bars, cursor, tf, session.start))}>Back 1</button>
        <button className="yellow" onClick={() => go(stepForward(session.bars, cursor, tf))}>Step</button>
        <button className={playing ? "on" : ""} onClick={() => setPlaying((value) => !value)}>
          {playing ? "Pause" : "Play"}
        </button>
        {([1, 5, 20] as const).map((value) => (
          <button key={value} className={speed === value ? "on" : ""} onClick={() => setSpeed(value)}>
            {value}x
          </button>
        ))}
        {([1, 5, 15] as const).map((value) => (
          <button key={value} className={tf === value ? "on" : ""} onClick={() => setTf(value)}>
            {value}m
          </button>
        ))}
      </div>
      <div className="key">
        <span><i className="swatch" style={{ background: "#FFE600" }} /> Asia / Equal</span>
        <span><i className="swatch" style={{ background: "#00E676" }} /> London</span>
        <span><i className="swatch" style={{ background: "#FF2D2D" }} /> Pre</span>
        <span><i className="swatch" style={{ background: "#FFFFFF" }} /> Day</span>
      </div>
    </main>
  );
}
