# 🤱 MomAlert — AI Maternal Health Companion

> **Claude Builder Hackathon 2026 · University of Ghana · Track 1: Biology & Physical Health**

*"Because every mother deserves to know when danger is near."*

---

## The Problem

Ghana has one of the highest maternal mortality rates in West Africa — **308 deaths per 100,000 live births** (WHO, 2023). Most are preventable. The warning signs of preeclampsia, hemorrhage, and sepsis are present days before the crisis — but 3 in 4 women deliver far from a clinic, and nobody recognizes them in time.

MomAlert changes that.

---

## What It Does

MomAlert is an AI triage companion that lets pregnant women and new mothers describe their symptoms in **plain English or Twi (Akan)** and receive:

- Warm, human-language guidance
- A 4-level risk classification: **LOW · MEDIUM · HIGH · CRITICAL**
- Clear "go to clinic NOW" vs "this is normal" guidance
- Real-time community health worker dashboard with flagged session alerts

---

## Features

| Feature | Description |
|---|---|
| 💬 Streaming chat | Real-time AI responses via SSE — no waiting for full round-trips |
| 🚨 Live risk badge | Updates as Claude responds — CRITICAL pulses red |
| 🌍 English + Twi | Full bilingual support with 12 pre-built symptom chips |
| 🏥 CHW Dashboard | Health worker portal with risk filters and 30s auto-refresh |
| 🔒 Privacy-first | Anonymous sessions — no PII collected |
| 🤖 Local AI | Supports Ollama models (mistral:7b, llama3.2:3b) for offline use |

---

## Tech Stack

- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS v4
- **AI:** Ollama (mistral:7b / llama3.2:3b) · Claude API compatible
- **Database:** Prisma v7 + SQLite
- **State:** Zustand
- **Deploy:** Vercel

---

## Quick Start

### Prerequisites
- Node.js 18+
- [Ollama](https://ollama.ai) installed and running

```bash
# Install and start Ollama
brew install ollama
ollama serve
ollama pull mistral:7b
```

### Run locally

```bash
git clone https://github.com/ProCodler/MomAlert.git
cd MomAlert/momalert

npm install
cp .env.example .env.local   # edit with your config

npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment variables

```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=mistral:7b
DATABASE_URL="file:./dev.db"
# Optional: Claude API fallback
ANTHROPIC_API_KEY=your_key_here
```

---

## Risk Classification

| Level | Color | Examples | Action |
|---|---|---|---|
| LOW | 🟢 Green | Mild fatigue, nausea, round ligament pain | Reassure + educate |
| MEDIUM | 🟡 Amber | Mild swelling, moderate headache, mild fever | Monitor + follow up |
| HIGH | 🟠 Orange | Severe headache + vision changes, fever >38.5°C | Seek care today |
| CRITICAL | 🔴 Red (pulse) | Heavy bleeding, seizures, baby not moving | Emergency NOW |

---

## Ethics

MomAlert **never diagnoses**. It triages and refers. Every response ends with a reminder that it does not replace professional medical care. The system is calibrated to escalate conservatively — anything ambiguous goes *up* the risk scale, never down.

> MomAlert is a flashlight, not a verdict.

---

## License

MIT — build on this, deploy it, save lives.

