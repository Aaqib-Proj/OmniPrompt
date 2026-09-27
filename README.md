# OmniPrompt — GitHub × Hugging Face for AI Prompts & Output Artifacts

> **Enterprise-grade, open-source web platform where creators, developers, and AI engineers share, discover, version-control, and remix AI prompts and their generated outputs.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node: >=20](https://img.shields.io/badge/Node->=20-green.svg)](https://nodejs.org)
[![Vite: React](https://img.shields.io/badge/Vite-React%20%2B%20TS-646CFF.svg)](https://vitejs.dev)
[![Prisma: ORM](https://img.shields.io/badge/Prisma-ORM-2D3748.svg)](https://www.prisma.io)

---

## 🌟 Vision & Key Concepts

Code repositories manage code; **PromptIt** manages the next paradigm of software and creative engineering: **AI Prompts and their generated artifacts**.

- **Prompt Cards**: The atomic unit (analogous to a GitHub repo or HF model card). Contains prompt templates with `{variables}`, curated AI model badges, parameters (aspect ratio, temperature, seed), license, version history, and interactive output galleries.
- **Remix & Fork Lineage**: GitHub-style one-click fork with an interactive visual lineage graph tracing remixes back to the original author.
- **Suggest an Edit (PR Flow)**: Propose prompt improvements with side-by-side diffing; the author can review and merge into `v2.0` with a single click.
- **Model Hub**: Hugging Face-style model catalog tracking prompts across OpenAI (GPT-4o/Sora), Anthropic (Claude 3.7 Sonnet), Google (Gemini 2.5 Flash), Midjourney, Flux.1, Suno, Runway, and more.
- **Live App Sandbox**: Instant in-browser interactive preview for UI/UX and code-generated web applications.
- **Prompt Packs**: Curated, exportable JSON packs (e.g., "50 Cinematic Video Prompts", "Fintech UI Design System Prompts").
- **Higgsfield AI Studio**: Built-in creation studio powered by Open-Higgsfield with 38 image and video generation models (Soul 2, Kling 3, Seedance 2.5, Wan 3, Flux), live progress polling, masonry gallery, and 1-click publishing to PromptIt.
- **Developer API**: REST API with API key authentication for programmatic access to prompt templates.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Framer Motion, TanStack Query, Zustand.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, JWT authentication with refresh tokens, Zod validation.
- **Databases Supported**:
  - **SQLite**: Zero-configuration default for instant local setup.
  - **MySQL 8.0**: Dedicated schema for high-throughput production deployments.
- **DevOps**: Docker Compose for orchestrating MySQL 8.0, Backend, and Frontend.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### 1. Backend Setup
```bash
cd backend
npm install
npm run prisma:generate
npm run db:setup     # Applies schema and seeds demo users, models and text/UI/app/audio prompts
npm run import:open-data  # Imports the image and video prompts (plus UI sites) from open datasets (see below)
npm run dev          # Starts API on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev          # Starts Vite on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser!

### 3. Demo Credentials
The seeder provisions demo accounts:
- **Username:** `alexchen` | **Password:** `promptit123` (AI Engineer & Staff Creator)
- **Username:** `sarah_connor` | **Password:** `promptit123` (Generative Video Artist)
- **Username:** `elena_v` | **Password:** `promptit123` (UI/UX System Architect)

### 4. Google Sign-In (Optional)
To enable 1-click Google authentication:
1. Create a free OAuth 2.0 Web Client ID in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Set **Authorized JavaScript origin** to `http://localhost:5173`.
3. Add your Client ID to:
   - `backend/.env` → `GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"`
   - `frontend/.env` → `VITE_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"`

---

## 📚 Open Dataset Content

`npm run import:open-data` (in `backend/`) imports a curated sample of prompts together with the outputs they produced, from openly licensed datasets. Media is downloaded to `backend/media/` (git-ignored) and served at `/media`. Every imported prompt stores its source, license and credit line, which the UI shows on the prompt page.

| Source | License | What's imported |
|---|---|---|
| [Open Image Preferences v1](https://huggingface.co/datasets/data-is-better-together/open-image-preferences-v1) | Apache 2.0 | 200 prompts with FLUX.1 [dev] / SD 3.5 Large images |
| [DiffusionDB](https://huggingface.co/datasets/poloclub/diffusiondb) | CC0 1.0 | 100 Stable Diffusion v1 prompts with seed, steps, CFG and sampler |
| [WebSight v0.2](https://huggingface.co/datasets/HuggingFaceM4/WebSight) | CC BY 4.0 | 60 website ideas with Tailwind HTML (Live preview) and screenshots |
| [DeepAction v1](https://huggingface.co/datasets/faridlab/deepaction_v1) | CC BY 4.0 | 60 text-to-video clips from Veo, Runway, CogVideoX, VideoPoet and others |

The script is safe to re-run; rows that were already imported are skipped. Re-running `db:setup` wipes the database, so run the import again afterwards.

---

## 🐳 Docker Deployment

To launch PromptIt with MySQL 8:
```bash
docker compose -f docker/docker-compose.yml up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- MySQL 8: `localhost:3307`

---

## 📜 License & Community

Released under the [MIT License](LICENSE). Contributions are warmly welcomed! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting pull requests.
