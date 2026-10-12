import { useState } from "react";
import { Library } from "./Library";
import { Replay } from "./Replay";

type Route =
  | { name: "library" }
  | { name: "replay"; symbol: string; day: string; queue: string[] };

export function App() {
  const [route, setRoute] = useState<Route>({ name: "library" });

  if (route.name === "replay") {
    return (
      <Replay
        key={`${route.symbol}-${route.day}`}
        symbol={route.symbol}
        day={route.day}
        queue={route.queue}
        onBack={() => setRoute({ name: "library" })}
        onNext={(day) => setRoute({ ...route, day })}
      />
    );
  }

  return (
    <Library
      onOpen={(symbol, day, queue) => setRoute({ name: "replay", symbol, day, queue })}
    />
  );
}
