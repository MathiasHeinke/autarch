import { invoke } from '@tauri-apps/api/core';

export async function checkPty() {
  try {
    const res = await invoke('plugin:pty|spawn', { file: 'zsh', args: [], termName: 'xterm-256color' });
    console.warn("PTY SPAWN SUCCESS:", res);
    return `SUCCESS: ${JSON.stringify(res)}`;
  } catch (err) {
    console.error("PTY SPAWN FAIL:", err);
    return `FAIL: ${JSON.stringify(err)}`;
  }
}
