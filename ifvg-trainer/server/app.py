"""IFVG Trainer server. Scans data/weekly, stores bars in SQLite, serves the app."""

from __future__ import annotations

import csv
import json
import math
import socket
import sqlite3
import threading
from datetime import date, datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
WEEKLY = ROOT / "data" / "weekly"
DB_PATH = ROOT / "data" / "master.sqlite"
DIST = ROOT / "client" / "dist"

NY = ZoneInfo("America/New_York")
UTC = ZoneInfo("UTC")

SPECS = {
    "MNQ": {"dpp": 2, "tick": 0.25, "eq": 1.0, "gap": 2.0},
    "NQ": {"dpp": 20, "tick": 0.25, "eq": 1.0, "gap": 2.0},
    "MGC": {"dpp": 10, "tick": 0.1, "eq": 0.4, "gap": 0.5},
    "GC": {"dpp": 100, "tick": 0.1, "eq": 0.4, "gap": 0.5},
}

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
NEEDED = ("timestamp", "open", "high", "low", "close", "volume")

LOCK = threading.Lock()


def symbol_from_name(name: str) -> str | None:
    upper = name.upper()
    for symbol in ("MNQ", "MGC", "NQ", "GC"):
        if symbol in upper:
            return symbol
    return None


def parse_timestamp(text: str) -> datetime:
    raw = text.strip()
    if raw.endswith("Z"):
        raw = raw[:-1] + "+00:00"
    parsed = datetime.fromisoformat(raw)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=UTC)
    return parsed.astimezone(UTC)


def to_new_york(moment: datetime) -> datetime:
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=UTC)
    return moment.astimezone(NY)


def session_day(moment_ny: datetime) -> str:
    """Futures day: 6:00 PM ET through 5:00 PM ET. After 6 PM belongs to the next date."""
    day = moment_ny.date()
    if moment_ny.hour >= 18:
        day = day + timedelta(days=1)
    return day.isoformat()


def label_day(iso: str) -> str:
    year, month, day = (int(part) for part in iso.split("-"))
    stamped = date(year, month, day)
    return f"{WEEKDAYS[stamped.weekday()]} {MONTHS[month - 1]} {day}"


def table_name(symbol: str) -> str:
    if symbol not in SPECS:
        raise ValueError(symbol)
    return "bars_" + symbol


def connect(path: Path | None = None) -> sqlite3.Connection:
    db_path = path or DB_PATH
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")
    for symbol in SPECS:
        name = table_name(symbol)
        conn.execute(
            f"""
            CREATE TABLE IF NOT EXISTS {name} (
                ts INTEGER PRIMARY KEY,
                open REAL NOT NULL,
                high REAL NOT NULL,
                low REAL NOT NULL,
                close REAL NOT NULL,
                volume REAL NOT NULL,
                day TEXT NOT NULL
            )
            """
        )
        conn.execute(f"CREATE INDEX IF NOT EXISTS idx_{name}_day ON {name}(day)")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS practice (
            symbol TEXT NOT NULL,
            day TEXT NOT NULL,
            status TEXT NOT NULL,
            PRIMARY KEY (symbol, day)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY,
            text TEXT NOT NULL
        )
        """
    )
    conn.commit()
    return conn


def _finite(text: str) -> float:
    value = float(text)
    if not math.isfinite(value):
        raise ValueError("not a number")
    return value


def _row_values(row: dict[str, str | None]) -> tuple[int, float, float, float, float, float, str] | None:
    stamp = parse_timestamp(row["timestamp"] or "")
    opened = _finite(row["open"] or "")
    high = _finite(row["high"] or "")
    low = _finite(row["low"] or "")
    closed = _finite(row["close"] or "")
    volume = _finite(row["volume"] or "")
    if high < low or high < opened or high < closed or low > opened or low > closed:
        raise ValueError("bad candle")
    if volume < 0:
        raise ValueError("bad volume")
    local = to_new_york(stamp)
    return (int(stamp.timestamp()), opened, high, low, closed, volume, session_day(local))


def import_file(conn: sqlite3.Connection, path: Path) -> tuple[int, int, list[str]]:
    """Insert one CSV. Returns (added, skipped, notes). Never raises for bad rows."""
    notes: list[str] = []
    symbol = symbol_from_name(path.name)
    if symbol is None:
        return 0, 0, [f"{path.name} needs MNQ, NQ, MGC, or GC in the name."]
    try:
        handle = path.open(newline="", encoding="utf-8-sig")
    except OSError:
        return 0, 0, [f"Could not read {path.name}."]
    added = 0
    skipped = 0
    pending: list[tuple[int, float, float, float, float, float, str]] = []
    try:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            return 0, 0, [f"{path.name} has no header."]
        fields = {name.strip().lower(): name for name in reader.fieldnames if name}
        if any(need not in fields for need in NEEDED):
            return 0, 0, [f"{path.name} needs timestamp, open, high, low, close, volume."]
        for raw in reader:
            if raw is None:
                continue
            cleaned = {need: (raw.get(fields[need]) or "").strip() for need in NEEDED}
            if not any(cleaned.values()):
                continue
            try:
                pending.append(_row_values(cleaned))  # type: ignore[arg-type]
            except (TypeError, ValueError):
                skipped += 1
    except csv.Error:
        handle.close()
        return 0, skipped, [f"{path.name} could not be read."]
    finally:
        handle.close()
    name = table_name(symbol)
    before = conn.execute(f"SELECT COUNT(*) AS n FROM {name}").fetchone()["n"]
    conn.executemany(
        f"INSERT OR IGNORE INTO {name} (ts, open, high, low, close, volume, day) VALUES (?, ?, ?, ?, ?, ?, ?)",
        pending,
    )
    after = conn.execute(f"SELECT COUNT(*) AS n FROM {name}").fetchone()["n"]
    added = after - before
    if skipped:
        word = "row" if skipped == 1 else "rows"
        notes.append(f"{path.name}: skipped {skipped} bad {word}.")
    return added, skipped, notes


def missing_minute_notes(conn: sqlite3.Connection) -> list[str]:
    notes: list[str] = []
    for symbol in SPECS:
        name = table_name(symbol)
        rows = conn.execute(f"SELECT ts, day FROM {name} ORDER BY ts").fetchall()
        grouped: dict[str, list[int]] = {}
        for row in rows:
            grouped.setdefault(row["day"], []).append(int(row["ts"]))
        for day, stamps in grouped.items():
            missing = 0
            for left, right in zip(stamps, stamps[1:]):
                gap = right - left
                if gap > 60:
                    missing += int(gap // 60) - 1
            if missing > 0:
                unit = "minute" if missing == 1 else "minutes"
                notes.append(f"{label_day(day)} {symbol} is missing {missing} {unit}.")
    return notes


def import_folder(conn: sqlite3.Connection, folder: Path | None = None) -> list[str]:
    target = folder or WEEKLY
    notes: list[str] = []
    target.mkdir(parents=True, exist_ok=True)
    files = sorted(path for path in target.glob("*.csv") if path.is_file())
    if not files:
        notes.append("No CSV in data/weekly yet.")
    for path in files:
        try:
            _added, _skipped, file_notes = import_file(conn, path)
            notes.extend(file_notes)
        except Exception:
            notes.append(f"Could not read {path.name}.")
    try:
        notes.extend(missing_minute_notes(conn))
    except Exception:
        notes.append("Could not check for missing minutes.")
    conn.execute("DELETE FROM notes")
    if notes:
        conn.executemany("INSERT INTO notes (text) VALUES (?)", [(note,) for note in notes])
    conn.commit()
    return notes


def _symbols_with_data(conn: sqlite3.Connection) -> list[str]:
    found = []
    for symbol in SPECS:
        count = conn.execute(f"SELECT COUNT(*) AS n FROM {table_name(symbol)}").fetchone()["n"]
        if count:
            found.append(symbol)
    return found


def _days(conn: sqlite3.Connection, symbol: str) -> list[dict[str, object]]:
    name = table_name(symbol)
    rows = conn.execute(
        f"SELECT day, COUNT(*) AS n FROM {name} GROUP BY day ORDER BY day ASC"
    ).fetchall()
    practice = {
        row["day"]: row["status"]
        for row in conn.execute("SELECT day, status FROM practice WHERE symbol = ?", (symbol,))
    }
    return [
        {
            "day": row["day"],
            "label": label_day(row["day"]),
            "bars": row["n"],
            "status": practice.get(row["day"], "none"),
        }
        for row in rows
    ]


def library(conn: sqlite3.Connection) -> dict[str, object]:
    symbols = _symbols_with_data(conn)
    notes = [row["text"] for row in conn.execute("SELECT text FROM notes ORDER BY id")]
    days = {symbol: _days(conn, symbol) for symbol in symbols}
    return {"symbols": symbols, "notes": notes, "days": days}


def _replay_start(conn: sqlite3.Connection, symbol: str, day: str) -> int | None:
    name = table_name(symbol)
    rows = conn.execute(f"SELECT ts FROM {name} WHERE day = ? ORDER BY ts", (day,)).fetchall()
    for row in rows:
        local = datetime.fromtimestamp(int(row["ts"]), NY)
        if 4 <= local.hour < 18:
            return int(row["ts"])
    return None


def session_payload(conn: sqlite3.Connection, symbol: str, day: str) -> dict[str, object] | None:
    if symbol not in SPECS:
        return None
    name = table_name(symbol)
    rows = conn.execute(
        f"SELECT ts, open, high, low, close, volume FROM {name} WHERE day = ? ORDER BY ts",
        (day,),
    ).fetchall()
    if not rows:
        return None
    previous = conn.execute(
        f"SELECT day FROM {name} WHERE day < ? GROUP BY day ORDER BY day DESC LIMIT 1",
        (day,),
    ).fetchone()
    pdh = None
    pdl = None
    if previous is not None:
        stats = conn.execute(
            f"SELECT MAX(high) AS hi, MIN(low) AS lo FROM {name} WHERE day = ?",
            (previous["day"],),
        ).fetchone()
        pdh = stats["hi"]
        pdl = stats["lo"]
    spec = SPECS[symbol]
    return {
        "symbol": symbol,
        "day": day,
        "label": label_day(day),
        "dpp": spec["dpp"],
        "tick": spec["tick"],
        "eq": spec["eq"],
        "gap": spec["gap"],
        "pdh": pdh,
        "pdl": pdl,
        "start": _replay_start(conn, symbol, day),
        "bars": [
            {
                "t": int(row["ts"]),
                "o": row["open"],
                "h": row["high"],
                "l": row["low"],
                "c": row["close"],
                "v": row["volume"],
            }
            for row in rows
        ],
    }


def set_practice(conn: sqlite3.Connection, symbol: str, day: str, status: str) -> None:
    if symbol not in SPECS or status not in ("practiced", "passed"):
        raise ValueError("bad practice")
    if len(day) != 10:
        raise ValueError("bad day")
    current = conn.execute(
        "SELECT status FROM practice WHERE symbol = ? AND day = ?",
        (symbol, day),
    ).fetchone()
    if current is not None and current["status"] == "passed":
        return
    conn.execute(
        """
        INSERT INTO practice (symbol, day, status) VALUES (?, ?, ?)
        ON CONFLICT(symbol, day) DO UPDATE SET status = excluded.status
        """,
        (symbol, day, status),
    )
    conn.commit()


def _extra_headers(handler: BaseHTTPRequestHandler) -> None:
    handler.send_header("Connection", "close")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.send_header("Cache-Control", "no-store")


def _send(handler: BaseHTTPRequestHandler, code: int, payload: object) -> None:
    body = json.dumps(payload).encode()
    handler.close_connection = True
    handler.send_response(code)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(body)))
    _extra_headers(handler)
    handler.end_headers()
    if handler.command != "HEAD":
        handler.wfile.write(body)


def _read_json(handler: BaseHTTPRequestHandler) -> dict[str, object]:
    length = int(handler.headers.get("Content-Length", "0"))
    if length > 1_000_000:
        raise ValueError("too big")
    raw = handler.rfile.read(length) if length else b"{}"
    data = json.loads(raw.decode() or "{}")
    if not isinstance(data, dict):
        raise ValueError("bad json")
    return data


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server: "TrainerServer"

    def log_message(self, fmt: str, *args: object) -> None:
        return

    def do_OPTIONS(self) -> None:
        self.close_connection = True
        self.send_response(204)
        self.send_header("Content-Length", "0")
        _extra_headers(self)
        self.end_headers()

    def do_HEAD(self) -> None:
        self.do_GET()

    def do_GET(self) -> None:
        try:
            parsed = urlparse(self.path)
            if parsed.path == "/api/health":
                _send(self, 200, {"ok": True})
                return
            if parsed.path == "/api/library":
                with LOCK:
                    payload = library(self.server.conn)
                _send(self, 200, payload)
                return
            if parsed.path == "/api/session":
                query = parse_qs(parsed.query)
                symbol = (query.get("symbol") or [""])[0]
                day = (query.get("day") or [""])[0]
                with LOCK:
                    payload = session_payload(self.server.conn, symbol, day)
                if payload is None:
                    _send(self, 404, {"error": "No day."})
                    return
                _send(self, 200, payload)
                return
            self._static(parsed.path)
        except Exception:
            import traceback
            traceback.print_exc()
            _send(self, 500, {"error": "Something went wrong."})

    def do_POST(self) -> None:
        try:
            parsed = urlparse(self.path)
            if parsed.path == "/api/import":
                with LOCK:
                    notes = import_folder(self.server.conn, self.server.weekly)
                    payload = library(self.server.conn)
                payload["notes"] = notes
                _send(self, 200, payload)
                return
            if parsed.path == "/api/practice":
                body = _read_json(self)
                with LOCK:
                    set_practice(
                        self.server.conn,
                        str(body.get("symbol", "")),
                        str(body.get("day", "")),
                        str(body.get("status", "")),
                    )
                _send(self, 200, {"ok": True})
                return
            _send(self, 404, {"error": "Missing."})
        except Exception:
            _send(self, 400, {"error": "Could not save that."})

    def _static(self, path: str) -> None:
        root = DIST.resolve()
        rel = path.lstrip("/") or "index.html"
        file = (root / rel).resolve()
        if not str(file).startswith(str(root)) or not file.is_file():
            file = root / "index.html"
        if not file.is_file():
            body = b"Build the app first. Run npm start."
            self.send_response(503)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        kind = "application/octet-stream"
        if file.suffix == ".html":
            kind = "text/html; charset=utf-8"
        elif file.suffix == ".js":
            kind = "text/javascript; charset=utf-8"
        elif file.suffix == ".css":
            kind = "text/css; charset=utf-8"
        elif file.suffix == ".svg":
            kind = "image/svg+xml"
        elif file.suffix == ".woff2":
            kind = "font/woff2"
        data = file.read_bytes()
        if file.name == "index.html":
            try:
                with LOCK:
                    payload = json.dumps(library(self.server.conn))
                snippet = f"<script>window.__DATA__={payload.replace('<', '\\u003c')}</script>".encode()
                data = data.replace(b"</head>", snippet + b"</head>", 1)
            except Exception:
                import traceback
                traceback.print_exc()
        self.close_connection = True
        self.send_response(200)
        self.send_header("Content-Type", kind)
        self.send_header("Content-Length", str(len(data)))
        _extra_headers(self)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)


class TrainerServer(ThreadingHTTPServer):
    allow_reuse_address = True

    def __init__(self, address: tuple[str, int], conn: sqlite3.Connection, weekly: Path) -> None:
        super().__init__(address, Handler)
        self.conn = conn
        self.weekly = weekly


class V6Server(TrainerServer):
    address_family = socket.AF_INET6

    def server_bind(self) -> None:
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 1)
        super().server_bind()


def main() -> None:
    WEEKLY.mkdir(parents=True, exist_ok=True)
    conn = connect(DB_PATH)
    with LOCK:
        import_folder(conn, WEEKLY)
    port = int(__import__("os").environ.get("PORT", "8787"))
    server = TrainerServer(("0.0.0.0", port), conn, WEEKLY)
    v6 = V6Server(("::", port), conn, WEEKLY)
    threading.Thread(target=v6.serve_forever, name="ifvg-v6", daemon=True).start()
    print(f"IFVG Trainer  http://127.0.0.1:{port}", flush=True)
    print("Listening on all interfaces.", flush=True)
    print(f"Drop CSV files in  {WEEKLY}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
