#!/bin/bash
# 等 Claude Code 跑完（沒有 Stop／沒有「N agent」連續兩次），每 60 秒截一張；參數：前綴、最多秒數
cd "$(dirname "$0")"
PFX=${1:-cc11v4}; MAX=${2:-3000}; t=0; idle=0; q=0
echo "start $(date +%T)"
while [ $t -lt $MAX ]; do
  sleep 10; t=$((t+10))
  R=$(node send.mjs @c-hasq.json 30 2>/dev/null | tail -1)
  if echo "$R" | grep -q 'Q '; then q=$((q+1)); echo "$t QUESTION"; node send.mjs "{\"a\":\"shot\",\"name\":\"${PFX}-question\"}" 60 >/dev/null; [ $q -ge 2 ] && break; else q=0; fi
  if [ $((t % 60)) -eq 0 ]; then node send.mjs "{\"a\":\"shot\",\"name\":\"${PFX}-t$(printf %04d $t)\"}" 60 >/dev/null; echo "$t $R"; fi
  if echo "$R" | grep -q idle; then idle=$((idle+1)); if [ $idle -ge 2 ]; then echo "$t IDLE"; break; fi; else idle=0; fi
done
echo "end $(date +%T) t=$t"
