#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
PROJECT_ID="${QA_PROJECT_ID:-4dae49de-1f02-44c7-b3ec-7ef162f732d1}"
QA_EMAIL="${QA_EMAIL:-demo@example.com}"
PORT="${PORT:-3010}"
BASE_URL="http://localhost:${PORT}"
SEARCH_SCREENSHOT="${SEARCH_SCREENSHOT:-/tmp/docs-search-polished.png}"
ASK_SCREENSHOT="${ASK_SCREENSHOT:-/tmp/docs-ask-wiki-history.png}"
SERVER_LOG="/tmp/codebase-wiki-docs-qa-server.log"

cleanup() {
  agent-browser close >/dev/null 2>&1 || true
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

if [[ -f "${ROOT_DIR}/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${ROOT_DIR}/.env.local"
  set +a
fi

cd "${ROOT_DIR}"
PORT="${PORT}" NEXTAUTH_URL="${BASE_URL}" NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-dev-secret}" npm run dev --workspace=apps/web >"${SERVER_LOG}" 2>&1 &
SERVER_PID=$!
sleep 6

agent-browser set viewport 1920 1080
agent-browser open "${BASE_URL}/auth/sign-in"
agent-browser wait --load networkidle
agent-browser find label "Email address" fill "${QA_EMAIL}"
agent-browser find label "Password" fill "password"
agent-browser find role button click --name "Sign in"
agent-browser wait --text "Mock auth connected"

agent-browser open "${BASE_URL}/docs/${PROJECT_ID}"
agent-browser wait --load networkidle
agent-browser wait --text "Overview"
agent-browser wait --text "API Reference"

agent-browser find role button click --name "Search docs...."
agent-browser wait 1000
agent-browser find placeholder "Search generated docs..." fill "health endpoint"
agent-browser press Enter
agent-browser wait --text "GET /health"
agent-browser wait --text "Generated docs"
agent-browser screenshot "${SEARCH_SCREENSHOT}" --annotate
agent-browser find role link click --name "API Reference Generated docs"
agent-browser wait --url "**/api-reference"

agent-browser find role button click --name "New chat"
agent-browser find placeholder "Ask about this codebase..." fill "What endpoints does this project expose?"
agent-browser find role button click --name "Send"
agent-browser wait --text "GET /health"
agent-browser wait --text "Sources"
agent-browser reload
agent-browser wait --load networkidle
agent-browser wait --text "GET /health"
agent-browser screenshot "${ASK_SCREENSHOT}" --annotate

printf 'Search screenshot: %s\n' "${SEARCH_SCREENSHOT}"
printf 'Ask Wiki screenshot: %s\n' "${ASK_SCREENSHOT}"
