# Security Playbook — Autarch

## Focus Areas
1. **API Keys:** Never store API keys in plain text. Always push them through the OS keychain using keyring-rs (AES-256 encrypted).
2. **Path Traversal / Filesystem:** Tauri commands accessing the filesystem must strictly validate paths against the intended workspace scope. Do not allow `../` outside of initialized project directories.
3. **Execution Safety:** Subprocess execution (Hermes, Paperclip, etc.) should strictly sandbox environments and monitor output. Avoid arbitrary shell eval for inputs typed by the user or an LLM, use structured command execution APIs.
4. **Data Isolation:** Multiple companies/projects in Paperclip should properly namespace data so they don't leak context across each other.
