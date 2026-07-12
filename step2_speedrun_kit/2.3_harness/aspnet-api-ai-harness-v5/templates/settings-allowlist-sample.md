# 權限 Allowlist 範例（.claude/settings.local.json）

減少權限確認次數、同時維持安全的做法（來自內部專案實務）：

- **最小授權、逐次累積**：只放行常用且低風險的指令，精確到參數，不一次 `Bash(*)` 全開。
- **破壞性指令綁定範圍**：commit / push 綁定特定訊息格式或 repo 路徑與分支。
- **typecheck 用 `--no-install`**：避免臨時安裝套件。
- 不確定的不放行，讓它照常跳權限確認。

```json
{
  "permissions": {
    "allow": [
      "Bash(dotnet build:*)",
      "Bash(dotnet test:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git status:*)",
      "Bash(git add:*)",
      "Bash(git commit -m ':*)",
      "Bash(npx --no-install vue-tsc --noEmit)",
      "Bash(npx --no-install nuxi typecheck)"
    ]
  }
}
```

放進專案 `.claude/settings.local.json`（個人、不進版控）或 `.claude/settings.json`（團隊共用）。
