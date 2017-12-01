# Changelog

## 0.0.4

"File mode" is no longer supported. `kvikk-fix` now exclusively runs in project
mode, which is its entire reason to exist. Use the official `prettier` CLI tool
for a file-mode-like experience.

A new mode called "check mode" is introduced. It behaves like `--list-different`
in the official CLI tool.