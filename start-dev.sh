#!/usr/bin/env bash
# start-dev.sh - Start both backend and frontend for local development

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Backend ──
echo "=== Starting CLIProxyAPI backend ==="
cd "$SCRIPT_DIR"
if pgrep -f "cli-proxy-api.*config.yaml" > /dev/null 2>&1; then
    echo "Backend already running"
else
    nohup ./cli-proxy-api --config "$SCRIPT_DIR/config.yaml" > "$SCRIPT_DIR/backend.log" 2>&1 &
    echo "Backend started (PID $!)"
    echo "  → http://127.0.0.1:8317"
    sleep 2
    echo "  → Config file: $SCRIPT_DIR/config.yaml"
    echo "  → Log file: $SCRIPT_DIR/backend.log"
fi

# ── Frontend ──
echo ""
echo "=== Starting Web UI dev server ==="
cd "$SCRIPT_DIR/webview/Cli-Proxy-API-Management-Center"

# Check if dev server already running
if curl -s http://localhost:5173/ > /dev/null 2>&1; then
    echo "Frontend dev server already running at http://localhost:5173"
else
    echo "Starting Vite dev server..."
    echo "  → http://localhost:5173"
    echo "  → Network: http://$(hostname -I | awk '{print $1}' 2>/dev/null || hostname):5173"
    echo ""
    echo "NOTE: This will occupy the terminal."
    echo "Press Ctrl+C twice to stop both services."
    echo ""
    sleep 1
    
    # Start frontend in foreground (this blocks)
    bun run dev --host 0.0.0.0
fi
