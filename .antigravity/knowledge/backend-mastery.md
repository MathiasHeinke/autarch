# Backend Mastery — Autarch

## Tech Stack
- **Rust / Tauri 2:** Desktop app lifecycle, system integration, file system watching.
- **PTY (portable-pty):** Shell execution, terminal streams integrations. Must flawlessly connect xterm.js in the frontend to standard OS shells.
- **git2-rs:** Embedded Git client operations without invoking standard CLI.
- **tokio:** Rust async runtime for handling long-running background tasks.
- **Hermes Agent Subprocess:** Spawns via `tauri-plugin-shell` (or directly via `std::process`) and connects via stdio to the UI.

## Focus Areas
1. **Zero-Latency Bridging:** IPC between Rust and web UI must carry minimum overhead.
2. **Error Handling:** Rust `Result<T,E>` mapped meticulously to Tauri Error messages (`invoke` rejection) with descriptive errors.
3. **Subprocess Management:** Clean zombie processes out. The Hermes subprocess and pseudo-terminals must shutdown gracefully when Tauri signals exit.
4. **Security:** OS capability access (e.g. fs access) should be limited by Tauri scopes where applicable.
