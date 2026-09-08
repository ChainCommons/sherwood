#!/bin/sh
# Fail if any commit in RANGE has an AI/tool trailer or provider name.
# Usage: scripts/check-commit-messages.sh [git-rev-range]
set -e
RANGE="${1:-}"
if [ -z "$RANGE" ]; then
  if [ -n "${GITHUB_BASE_REF:-}" ]; then
    git fetch --quiet origin "$GITHUB_BASE_REF"
    RANGE="origin/${GITHUB_BASE_REF}..HEAD"
  elif git rev-parse --verify --quiet HEAD~15 >/dev/null; then
    RANGE="HEAD~15..HEAD"
  else
    RANGE="$(git rev-list --max-parents=0 HEAD)..HEAD"
  fi
fi

bad=0
for c in $(git rev-list "$RANGE"); do
  body=$(git log -1 --format='%B' "$c")
  if printf '%s\n' "$body" | grep -qiE \
    'co-authored-by:.*(claude|cursor|anthropic|openai|codex|copilot)|claude-session:|generated (by|with).*(claude|cursor|codex|copilot|gpt|anthropic)|cursoragent@|noreply@anthropic'
  then
    echo "forbidden trailer in $c:" >&2
    git log -1 --oneline "$c" >&2
    bad=1
  fi
  if printf '%s\n' "$body" | grep -qiE \
    '(^|[[:space:]])(claude|cursor|codex|anthropic|openai|copilot|chatgpt|gemini)([[:space:]]|:)'
  then
    echo "forbidden provider name in $c:" >&2
    git log -1 --oneline "$c" >&2
    bad=1
  fi
done

if [ "$bad" -ne 0 ]; then
  echo "scripts/check-commit-messages.sh: rewrite those commits without AI/tool names." >&2
  exit 1
fi
exit 0
