---
title: Snipcast Showcase
fps: 60
chars_per_second: 150
width: 1920
height: 1080
font: "Maple Mono"
theme: "rose-pine"
switch_file_pause_ms: 2000
---

```css filename=_theme.css
/* Rose Pine Moon inspired theme */
:root {
  --base: #232136;
  --surface: #2a273f;
  --overlay: #393552;
  --muted: #6e6a86;
  --subtle: #908caa;
  --text: #e0def4;
  --love: #eb6f92;
  --gold: #f6c177;
  --rose: #ea9a97;
  --pine: #3e8fb0;
  --foam: #9ccfd8;
  --iris: #c4a7e7;
  --highlight-low: #2a283e;
  --highlight-med: #44415a;
  --highlight-high: #56526e;
}

.cc-container {
  background: radial-gradient(circle at center, var(--surface) 0%, var(--base) 100%) !important;
}

.cc-card {
  background: var(--surface) !important;
  border: 1px solid var(--overlay) !important;
  border-radius: 24px !important;
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05) !important;
  overflow: hidden;
}

.cc-header {
  background: var(--overlay) !important;
  border-bottom: 1px solid var(--highlight-med) !important;
  padding: 14px 20px !important;
}

.cc-tab-bar {
  background: rgba(0, 0, 0, 0.2) !important;
  padding: 10px !important;
  gap: 8px !important;
  border-radius: 0 !important;
  margin-bottom: 0 !important;
  border: none !important;
  border-bottom: 1px solid var(--overlay) !important;
}

.cc-tab {
  color: var(--muted) !important;
  background: transparent !important;
  border: 1px solid transparent !important;
  font-weight: 500 !important;
  padding: 6px 14px !important;
  border-radius: 6px !important;
}

.cc-tab-active {
  color: var(--rose) !important;
  background: var(--highlight-med) !important;
  border-color: var(--rose) !important;
}

.cc-highlight-line {
  background: var(--highlight-med) !important;
  border-left: 3px solid var(--iris) !important;
}

/* Shiki overrides for a better match */
.cc-code-area {
  background: var(--surface) !important;
}
```

```typescript filename=auth.ts
export interface User {
  id: string;
  name: string;
}

export function login(user: User) {
  console.log(`User ${user.name} logged in`);
}
```

```python filename=api.py
# highlight={2}
def get_status():
    return {"status": "online", "version": "1.0.0"}
```

```bash filename=deploy.sh
# Let's deploy the app
echo "Deploying to production..."
bun run build
echo "Done!"
```

```typescript filename=auth.ts
// Add a session handler
export function logout() {
  localStorage.removeItem("session");
}
```
