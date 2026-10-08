import { mkdirSync, chownSync } from 'node:fs';

// Railway mounts persistent volumes as root; grant only the data directory to node.
if (process.getuid?.() === 0) {
  mkdirSync('/data', { recursive: true });
  chownSync('/data', 1000, 1000);
  process.setgroups([]);
  process.setgid(1000);
  process.setuid(1000);
}
await import('../build/server/index.js');
