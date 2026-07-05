# Practical Simulator — A/L ICT Interactive Learning Platform

**Practical Simulator** is a application designed for Sri Lankan G.C.E. Advanced Level (A/L) ICT & Physics students. It transforms abstract curriculum topics into hands-on, visual, interactive labs — no backend, use next js I have already created in this folder frameworks, Use GSAP and tailwindcss dependencies.

Built by **Keshan Ransilu** (2026).

---

## What It Does

Practical Simulator replaces static textbook diagrams with live simulations across 7 learning views, covering the full A/L ICT and A/L Physcis Pactrical syllabus from binary logic to subnetting, signal encoding, and networking and all of the physics.

| View | Purpose |
|------|---------|
| **Home** | Landing dashboard with XP stats, streak tracker, and feature cards |
| **Guided Course** | 13 structured lessons (binary to full adders) with quizzes, feedback, and XP rewards |
| **Gate Explorer** | Click any gate to see its truth table, transistor schematic, boolean expression, and universality proof |
| **Sandbox Builder** | Full drag-and-drop circuit lab with 30+ component types, wire drawing, IC creation, templates, and electricity simulation |
| **Subnetting Master** | CIDR visualizer with binary breakdown, IP calculator, cheat table, and a 5-question mental trainer |
| **Signal Encoding Lab** | Analog (ASK/FSK/PSK) and digital (NRZ, Manchester, AMI, etc.) waveform generators with live bit toggling |
| **Network Devices Lab** | Topology lab with PCs, switches, routers, hubs + OSI 7-layer simulator + RSA encryption demo |
| **Settings** | Profile, tri-lingual toggle (EN/SI/TA), theme modes, data export/import |

---

## Key Features

- **Pure client-side** — all logic runs in the browser. No server needed.
- **Tri-lingual** — full English / Sinhala / Tamil support via `data-i18n` attributes
- **3 interface modes** — Classic (gamified), Professional (academic), Kids (Duolingo-style playful)
- **Electricity simulation** — 19 component types with live Ohm's law calculations, wire glow animation, and logic-electricity bridge (gate outputs can drive electrical switches)
- **Custom modal system** — styled alert, confirm, and toast replacing all browser dialogs
- **Gamification** — XP points, streak tracking, lesson completion, and progress persistence
- **Local-first storage** — all progress saved to localStorage; export/import via base64 sync code for cross-device transfer
- **Sandbox templates** — pre-built circuits (half/full adder, SR latch, Ohms law, voltage divider, LDR sensor, op-amp comparator, and more)
- **No framework lock-in** — pure vanilla JS (ES Modules), SVG, Canvas, and CSS

---

## Technology Stack

| Layer | Tech |
|-------|------|
| Language | Vanilla JavaScript (ES Modules) |
| Bundler | Vite 5 |
| Graphics | SVG (inline), Canvas API |
| Styling | CSS |
| Persistence | localStorage |
| Dependencies | Zero runtime deps |

---
## License

Private — all rights reserved.