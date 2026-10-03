"""Local-only dashboard fixture; serves real UI source with synthetic API data."""

import argparse
import json
import mimetypes
import subprocess
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlsplit

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--repo", type=Path, required=True, help="Patched Memanto checkout")
parser.add_argument("--before", default="c421ab8", help="Unpatched git revision")
args = parser.parse_args()
REPO = args.repo.resolve()
UI = "memanto/app/ui/static/index.html"
BEFORE = subprocess.check_output(
    ["git", "-C", str(REPO), "show", f"{args.before}:{UI}"]
)
AFTER = (REPO / UI).read_bytes()
NOW = datetime.now(timezone.utc).isoformat()
LABEL = 'x" data-probe="1'
TOOL = "x-data-probe-1"
ACTIVITY = {
    "tools": [{
        "tool": TOOL, "display": LABEL, "live": True, "last_seen": NOW,
        "memories_written": 0, "memories_read": 1,
    }],
    "sessions": [{
        "session_id": "local-regression-fixture", "agent_id": "review-fixture",
        "status": "live", "tools": [{"tool": TOOL, "display": LABEL}],
        "memories_written": 0, "memories_read": 1, "last_seen": NOW,
    }],
}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urlsplit(self.path).path
        if path in ("/before/", "/after/"):
            body = BEFORE if path == "/before/" else AFTER
            content_type = "text/html; charset=utf-8"
        elif path == "/api/ui/sessions":
            body = json.dumps(ACTIVITY).encode()
            content_type = "application/json"
        elif path == "/api/ui/connections":
            body = b'{"connections":[],"cwd":"/local-regression-fixture"}'
            content_type = "application/json"
        elif path == "/api/ui/config":
            body = b'{"active_agent_id":null,"ui_mode":false,"server":{}}'
            content_type = "application/json"
        elif path == "/health":
            body = b'{"status":"ok"}'
            content_type = "application/json"
        elif path.startswith("/api/"):
            body = b'{}'
            content_type = "application/json"
        elif path.startswith("/ui/static/"):
            root = (REPO / "memanto/app/ui/static").resolve()
            asset = (root / path.removeprefix("/ui/static/")).resolve()
            if not asset.is_relative_to(root) or not asset.is_file():
                self.send_error(404)
                return
            body = asset.read_bytes()
            content_type = mimetypes.guess_type(asset.name)[0] or "application/octet-stream"
        else:
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        self.send_error(405, "Read-only fixture")


if __name__ == "__main__":
    print("Local dashboard fixture: http://127.0.0.1:8765/{before,after}/", flush=True)
    HTTPServer(("127.0.0.1", 8765), Handler).serve_forever()
