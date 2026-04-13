# Performance — Autarch

## Focus Areas
1. **Monaco Rendering:** Heavy terminal or chat updates should not re-render Monaco, causing text layout recalculation unnecessarily. Throttle rapid status stream updates at the UI edge (e.g. 60fps limit).
2. **IPC Overhead:** Transferring huge chunks of project code back and forth to Rust is expensive. Use chunks or read on the native thread if doing AI semantic searches where possible. PTY output should be chunked efficiently.
3. **Bundle Size:** Code splitting React Router views ensures the marketing or IDE tabs do not load heavier code (like DND-kit) until accessed.
4. **Memory Leaks:** Watch out for orphaned PTY processes or Tauri shell commands staying alive after the application exit or component unmount. Clean up listeners!
