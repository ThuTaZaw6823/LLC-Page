#!/bin/zsh
cd -- "${0:A:h}" || exit 1
if ! command -v npm >/dev/null 2>&1; then
  echo 'Node.js >=22.13.0 and npm are required. Install Node.js, then reopen this terminal.'
  exit 1
fi
npm run dev -- --hostname 127.0.0.1 --port 5173
