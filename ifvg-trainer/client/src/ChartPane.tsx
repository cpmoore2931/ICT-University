import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  LineStyle,
  createChart,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type MouseEventParams,
  type UTCTimestamp,
  type AutoscaleInfo,
} from "lightweight-charts";
import { type Bar, type Fvg, type Level, type StepMark, type TradeMark } from "./lib/market";

type Marks = { entry?: number; stop?: number; target?: number };

type Props = {
  bars: Bar[];
  levels: Level[];
  fvgs: Fvg[];
  marks: Marks;
  steps: StepMark[];
  trades: TradeMark[];
  onPrice: (price: number) => void;
};

const STEP_COLOR: Record<number, string> = {
  1: "#FFE600",
  2: "#FF2D2D",
  3: "#00E676",
  4: "#FFE600",
  5: "#00E676",
};

export function ChartPane({ bars, levels, fvgs, marks, steps, trades, onPrice }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const linesRef = useRef<IPriceLine[]>([]);
  const onPriceRef = useRef(onPrice);
  const scalePrices = useRef<number[]>([]);
  onPriceRef.current = onPrice;
  scalePrices.current = [
    ...levels.map((level) => level.price),
    ...trades.map((mark) => mark.price),
    ...(marks.entry == null ? [] : [marks.entry]),
    ...(marks.stop == null ? [] : [marks.stop]),
    ...(marks.target == null ? [] : [marks.target]),
  ];

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#000000",
        fontSize: 16,
        fontFamily: "Lexend, sans-serif",
      },
      grid: {
        vertLines: { color: "#dddddd" },
        horzLines: { color: "#dddddd" },
      },
      crosshair: {
        vertLine: { labelVisible: false },
      },
      rightPriceScale: { borderColor: "#000000" },
      timeScale: {
        borderColor: "#000000",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 6,
        tickMarkFormatter: (time: unknown) => (typeof time === "number" ? formatAxis(time) : ""),
      },
      localization: {
        timeFormatter: (time: unknown) => (typeof time === "number" ? formatAxis(time) : ""),
      },
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#00E676",
      downColor: "#FF2D2D",
      wickUpColor: "#00E676",
      wickDownColor: "#FF2D2D",
      borderVisible: false,
    });
    chartRef.current = chart;
    seriesRef.current = series;
    const onClick = (param: MouseEventParams) => {
      if (!param.point) return;
      const price = series.coordinateToPrice(param.point.y);
      if (price != null) onPriceRef.current(price);
    };
    chart.subscribeClick(onClick);
    const resize = () => chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      linesRef.current = [];
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!series || !chart) return;
    series.setData(
      bars.map((bar) => ({
        time: bar.t as UTCTimestamp,
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
      })),
    );
    chart.timeScale().scrollToPosition(6, false);
  }, [bars]);

  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!series || !chart) return;
    series.applyOptions({
      autoscaleInfoProvider: (original: () => AutoscaleInfo | null) => {
        const res = original();
        if (!res?.priceRange) return res;
        for (const price of scalePrices.current) {
          res.priceRange.minValue = Math.min(res.priceRange.minValue, price);
          res.priceRange.maxValue = Math.max(res.priceRange.maxValue, price);
        }
        return res;
      },
    });
    const paint = () => drawOverlay(chart, series, canvasRef.current, fvgs, bars, steps, trades);
    paint();
    chart.timeScale().subscribeVisibleLogicalRangeChange(paint);
    return () => chart.timeScale().unsubscribeVisibleLogicalRangeChange(paint);
  }, [bars, fvgs, steps, trades]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    for (const line of linesRef.current) series.removePriceLine(line);
    const next: IPriceLine[] = [];
    for (const level of levels) {
      next.push(
        series.createPriceLine({
          price: level.price,
          color: level.color,
          lineWidth: 2,
          lineStyle: level.dashed ? LineStyle.Dashed : LineStyle.Solid,
          axisLabelVisible: true,
          title: level.name,
        }),
      );
    }
    const extras: { price?: number; title: string; color: string }[] = [
      { price: marks.entry, title: "Entry", color: "#00E676" },
      { price: marks.stop, title: "Stop", color: "#FF2D2D" },
      { price: marks.target, title: "Target", color: "#FFE600" },
    ];
    for (const extra of extras) {
      if (extra.price == null) continue;
      next.push(
        series.createPriceLine({
          price: extra.price,
          color: extra.color,
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: extra.title,
        }),
      );
    }
    linesRef.current = next;
  }, [levels, marks]);

  return (
    <div className="chart-wrap">
      <div className="chart-host" ref={wrapRef} />
      <canvas className="fvg" ref={canvasRef} />
    </div>
  );
}

function formatAxis(unix: number): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(unix * 1000));
}

function drawOverlay(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  canvas: HTMLCanvasElement | null,
  fvgs: Fvg[],
  bars: Bar[],
  steps: StepMark[],
  trades: TradeMark[],
) {
  if (!canvas) return;
  const parent = canvas.parentElement;
  if (!parent) return;
  const width = parent.clientWidth;
  const height = parent.clientHeight;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const right = bars.length ? bars[bars.length - 1].t : null;
  for (const gap of fvgs) {
    const x1 = chart.timeScale().timeToCoordinate(gap.left as UTCTimestamp);
    const x2 = right == null ? null : chart.timeScale().timeToCoordinate(right as UTCTimestamp);
    const yTop = series.priceToCoordinate(gap.top);
    const yBot = series.priceToCoordinate(gap.bottom);
    if (x1 == null || x2 == null || yTop == null || yBot == null) continue;
    ctx.fillStyle = gap.inverted
      ? "rgba(255, 230, 0, 0.35)"
      : gap.dir === "bull"
        ? "rgba(0, 230, 118, 0.28)"
        : "rgba(255, 45, 45, 0.28)";
    const left = Math.min(x1, x2);
    const top = Math.min(yTop, yBot);
    ctx.fillRect(left, top, Math.max(8, Math.abs(x2 - x1)), Math.max(4, Math.abs(yBot - yTop)));
  }
  drawSteps(ctx, chart, series, steps, bars, width, height);
  drawTrades(ctx, chart, series, trades, bars, width, height);
}

function drawSteps(
  ctx: CanvasRenderingContext2D,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  steps: StepMark[],
  bars: Bar[],
  width: number,
  height: number,
) {
  const placed: { x: number; y: number }[] = [];
  const rightTime = bars[bars.length - 1]?.t;
  const oneCount = steps.filter((mark) => mark.n === 1).length;
  for (const mark of steps) {
    const time = mark.n === 1 && rightTime ? rightTime : mark.t;
    const rawX = chart.timeScale().timeToCoordinate(time as UTCTimestamp);
    const rawY = series.priceToCoordinate(mark.price);
    if (rawY == null) continue;
    let x = rawX == null ? 28 : Number(rawX);
    const yPrice = Number(rawY);
    if (yPrice < 8 || yPrice > height - 8) continue;
    if (mark.n === 1) x -= 120;
    if (x < 24) x = 28;
    if (x > width - 24) x = width - 24;
    const above = mark.n === 3 || mark.n === 4;
    const below = mark.n === 2 || mark.n === 5;
    let y = yPrice + (above ? -30 : below ? 30 : 0);
    y = Math.max(28, Math.min(height - 28, y));
    for (let guard = 0; guard < 8; guard += 1) {
      const hit = placed.some((spot) => Math.abs(spot.x - x) < 48 && Math.abs(spot.y - y) < 40);
      if (!hit) break;
      y -= 40;
      y = Math.max(28, Math.min(height - 28, y));
    }
    placed.push({ x, y });
    const color = STEP_COLOR[mark.n] ?? "#FFFFFF";
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000000";
    ctx.stroke();
    ctx.fillStyle = "#000000";
    ctx.font = "700 22px Lexend, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(mark.n), x, y + 1);
    const showName = mark.n !== 1 || oneCount === 1;
    if (!showName) continue;
    ctx.font = "700 18px Lexend, sans-serif";
    const textW = ctx.measureText(mark.name).width;
    let textX = x + 26;
    ctx.textAlign = "left";
    if (mark.n === 1 || textX + textW > width - 8) textX = Math.max(8, x - 26 - textW);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.strokeText(mark.name, textX, y);
    ctx.fillStyle = color;
    ctx.fillText(mark.name, textX, y);
  }
}

const TRADE_COLOR: Record<TradeMark["kind"], string> = {
  entry: "#00E676",
  stop: "#FF2D2D",
  target: "#FFE600",
  exit: "#000000",
};

function drawTrades(
  ctx: CanvasRenderingContext2D,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  trades: TradeMark[],
  bars: Bar[],
  width: number,
  height: number,
) {
  const placed: { x: number; y: number }[] = [];
  const rightTime = bars[bars.length - 1]?.t;
  for (const mark of trades) {
    const time = mark.kind === "target" && rightTime ? rightTime : mark.t;
    const rawX = chart.timeScale().timeToCoordinate(time as UTCTimestamp);
    const rawY = series.priceToCoordinate(mark.price);
    if (rawY == null) continue;
    let x = rawX == null ? 36 : Number(rawX);
    const yPrice = Number(rawY);
    if (yPrice < 8 || yPrice > height - 8) continue;
    if (mark.kind === "target") x -= 280;
    if (mark.kind === "entry") x += 84;
    if (x < 24) x = 36;
    if (x > width - 24) x = width - 160;
    const below = mark.kind === "stop" || mark.why === "Low broke";
    let y = yPrice + (mark.kind === "target" ? 34 : below ? 46 : -46);
    y = Math.max(36, Math.min(height - 36, y));
    for (let guard = 0; guard < 8; guard += 1) {
      const hit = placed.some((spot) => Math.abs(spot.x - x) < 150 && Math.abs(spot.y - y) < 52);
      if (!hit) break;
      y += below ? 52 : -52;
      y = Math.max(36, Math.min(height - 36, y));
    }
    placed.push({ x, y });
    const color = mark.why === "DOL hit" ? "#00E676" : mark.why === "Low broke" ? "#FF2D2D" : TRADE_COLOR[mark.kind];
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 18, yPrice);
    ctx.lineTo(x + 18, yPrice);
    ctx.stroke();

    ctx.font = "700 18px Lexend, sans-serif";
    const nameW = ctx.measureText(mark.name).width;
    ctx.font = "700 16px Lexend, sans-serif";
    const whyW = ctx.measureText(mark.why).width;
    const boxW = Math.max(nameW, whyW) + 16;
    const boxH = 46;
    let left = x - boxW / 2;
    if (left < 8) left = 8;
    if (left + boxW > width - 8) left = width - 8 - boxW;
    const top = y - boxH / 2;
    ctx.fillStyle = "#000000";
    ctx.fillRect(left, top, boxW, boxH);
    ctx.strokeRect(left, top, boxW, boxH);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 18px Lexend, sans-serif";
    ctx.fillStyle = color;
    ctx.fillText(mark.name, left + boxW / 2, top + 15);
    ctx.font = "700 16px Lexend, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(mark.why, left + boxW / 2, top + 33);
  }
}
