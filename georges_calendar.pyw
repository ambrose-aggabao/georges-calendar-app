"""George's Calendar App - desktop launcher.

Serves the calendar UI from a tiny local web server (127.0.0.1 only) and opens
it in a chromeless Microsoft Edge app window. Events are saved as JSON in
%APPDATA%\\GeorgesCalendar\\events.json. The server shuts itself down shortly
after the calendar window is closed.
"""

import json
import os
import subprocess
import sys
import threading
import time
import urllib.request
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

APP_NAME = "George's Calendar App"
PORT = 47823
URL = f"http://127.0.0.1:{PORT}/"
APP_DIR = Path(__file__).resolve().parent / "app"
DATA_DIR = Path(os.environ.get("APPDATA", Path.home())) / "GeorgesCalendar"
DATA_FILE = DATA_DIR / "events.json"
EDGE_PROFILE = Path(os.environ.get("LOCALAPPDATA", Path.home())) / "GeorgesCalendar" / "EdgeProfile"

STARTUP_GRACE = 90   # seconds to wait for the window's first heartbeat
PING_TIMEOUT = 90    # seconds without a heartbeat before shutting down
BYE_TIMEOUT = 6      # seconds after the window says goodbye (allows reloads)

_lock = threading.Lock()
_last_ping = time.time()
_bye_at = None


def load_events():
    try:
        with open(DATA_FILE, encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except (OSError, ValueError):
        return []


def save_events(events):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp = DATA_FILE.with_suffix(".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(events, f, indent=2)
    os.replace(tmp, DATA_FILE)


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "application/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".ico": "image/x-icon",
        ".json": "application/json",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(APP_DIR), **kwargs)

    def log_message(self, *args):
        pass  # pythonw has no console

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _json(self, obj, status=200):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        global _last_ping, _bye_at
        if self.path == "/api/ping":
            with _lock:
                _last_ping = time.time()
                _bye_at = None
            return self._json({"app": "georges-calendar"})
        if self.path == "/api/events":
            with _lock:
                return self._json(load_events())
        return super().do_GET()

    def do_POST(self):
        global _bye_at
        if self.path == "/api/bye":
            with _lock:
                _bye_at = time.time()
            return self._json({"ok": True})
        # The custom header forces a CORS preflight, so other websites can't write here.
        if self.path == "/api/events" and self.headers.get("X-George") == "1":
            try:
                length = int(self.headers.get("Content-Length", 0))
                events = json.loads(self.rfile.read(length) or b"[]")
                if not isinstance(events, list):
                    raise ValueError("expected a list")
                with _lock:
                    save_events(events)
                return self._json({"ok": True})
            except (ValueError, OSError) as e:
                return self._json({"ok": False, "error": str(e)}, 400)
        self.send_error(404)


def find_edge():
    candidates = [
        Path(os.environ.get("ProgramFiles(x86)", r"C:\Program Files (x86)")) / "Microsoft/Edge/Application/msedge.exe",
        Path(os.environ.get("ProgramFiles", r"C:\Program Files")) / "Microsoft/Edge/Application/msedge.exe",
        Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft/Edge/Application/msedge.exe",
    ]
    return next((p for p in candidates if p.is_file()), None)


def open_window():
    edge = find_edge()
    if edge is None:
        webbrowser.open(URL)
        return
    EDGE_PROFILE.mkdir(parents=True, exist_ok=True)
    subprocess.Popen([
        str(edge),
        f"--app={URL}",
        f"--user-data-dir={EDGE_PROFILE}",
        "--window-size=1320,880",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-sync",
        # keep reminders on time while the window is minimized
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--disable-backgrounding-occluded-windows",
    ], creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))


def already_running():
    try:
        with urllib.request.urlopen(URL + "api/ping", timeout=2) as r:
            return json.load(r).get("app") == "georges-calendar"
    except Exception:
        return False


def watchdog(server):
    started = time.time()
    while True:
        time.sleep(2)
        now = time.time()
        with _lock:
            idle = now - _last_ping
            bye = _bye_at
        if now - started < STARTUP_GRACE and _last_ping <= started:
            continue
        if (bye and now - bye > BYE_TIMEOUT) or idle > PING_TIMEOUT:
            server.shutdown()
            return


def main():
    try:
        server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    except OSError:
        # Port taken: if it's us, just open another window.
        if already_running():
            open_window()
        sys.exit(0)

    global _last_ping
    _last_ping = time.time() - 1
    threading.Thread(target=watchdog, args=(server,), daemon=True).start()
    open_window()
    server.serve_forever()


if __name__ == "__main__":
    main()
