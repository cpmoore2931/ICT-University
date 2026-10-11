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
} from "lightweight-charts";
import { type Bar, type Fvg, type Level } from "./lib/market";

type Marks = { entry?: number; stop?: number; target?: number };

type Props = {
  bars: Bar[];
  levels: Level[];
  fvgs: Fvg[];
  marks: Marks;
  onPrice: (price: number) => void;
};

export function ChartPane({ bars, levels, fvgs, marks, onPrice }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const linesRef = useRef<IPriceLine[]>([]);
  const onPriceRef = useRef(onPrice);
  onPriceRef.current = onPrice;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: "#000000" },
        textColor: "#ffffff",
        fontSize: 16,
        fontFamily: "Lexend, sans-serif",
      },
      grid: {
        vertLines: { color: "#222222" },
        horzLines: { color: "#222222" },
      },
      crosshair: {
        vertLine: { labelVisible: false },
      },
      rightPriceScale: { borderColor: "#ffffff" },
      timeScale: {
        borderColor: "#ffffff",
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
    drawGaps(chart, series, canvasRef.current, fvgs, bars);
    const onRange = () => drawGaps(chart, series, canvasRef.current, fvgs, bars);
    chart.timeScale().subscribeVisibleLogicalRangeChange(onRange);
    return () => chart.timeScale().unsubscribeVisibleLogicalRangeChange(onRange);
  }, [bars, fvgs]);

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

function drawGaps(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  canvas: HTMLCanvasElement | null,
  fvgs: Fvg[],
  bars: Bar[],
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
}
