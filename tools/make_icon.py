"""Render app/logo.svg to app/icon.png and assets/georges_calendar.ico using headless Edge.

Run once (or after changing the logo):  python tools/make_icon.py
"""

import struct
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "app" / "logo.svg"
SIZES = [16, 24, 32, 48, 64, 128, 256]

import importlib.util  # noqa: E402
from importlib.machinery import SourceFileLoader  # noqa: E402

_path = str(ROOT / "georges_calendar.pyw")
_spec = importlib.util.spec_from_file_location("launcher", _path, loader=SourceFileLoader("launcher", _path))
launcher = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(launcher)


def render(edge, size, tmp):
    html = tmp / f"logo{size}.html"
    html.write_text(
        "<!doctype html><html><body style='margin:0;background:transparent'>"
        f"<img src='{LOGO.as_uri()}' width='{size}' height='{size}' style='display:block'>"
        "</body></html>",
        encoding="utf-8",
    )
    out = tmp / f"logo{size}.png"
    subprocess.run([
        str(edge), "--headless", "--disable-gpu", "--hide-scrollbars",
        "--allow-file-access-from-files",
        f"--user-data-dir={tmp / 'profile'}",
        "--default-background-color=00000000",
        f"--window-size={size},{size}",
        f"--screenshot={out}",
        html.as_uri(),
    ], check=True, timeout=60, capture_output=True)
    return out.read_bytes()


def png_size(data):
    return struct.unpack(">II", data[16:24])


def build_ico(pngs):
    header = struct.pack("<HHH", 0, 1, len(pngs))
    entries, blobs = b"", b""
    offset = 6 + 16 * len(pngs)
    for data in pngs:
        w, h = png_size(data)
        entries += struct.pack("<BBBBHHII", w % 256, h % 256, 0, 0, 1, 32, len(data), offset)
        blobs += data
        offset += len(data)
    return header + entries + blobs


def main():
    edge = launcher.find_edge()
    if edge is None:
        sys.exit("Microsoft Edge not found")
    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        pngs = [render(edge, s, tmp) for s in SIZES]
    for s, data in zip(SIZES, pngs):
        if png_size(data) != (s, s):
            sys.exit(f"render at {s}px came out {png_size(data)}")
    (ROOT / "app" / "icon.png").write_bytes(pngs[-1])
    (ROOT / "assets").mkdir(exist_ok=True)
    (ROOT / "assets" / "georges_calendar.ico").write_bytes(build_ico(pngs))
    print("wrote app/icon.png and assets/georges_calendar.ico")


if __name__ == "__main__":
    main()
