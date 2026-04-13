# Code Audit — Autarch

## General Strategy
1. **Sherlock-first approach:** Do not propose wide-sweeping refactors unless isolated in a specific feature branch.
2. **TypeScript:** Strict type checking must pass prior to any commit. No `any` casting allowed.
3. **Desktop Native APIs:** Avoid relying heavily on HTTP loops when a native event could suffice or be piped over IPC.
4. **Rust Side:** Always check for unwrap() abuses. Prefer explicit Error handling (`Result<T, E>`) and log any potential crashes gracefully.
