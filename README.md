<div align="center">
  <img src="./ui/src/assets/cover.png" alt="Sheikhna Cover" width="100%" style="border-radius: 12px; margin-bottom: 20px;" />

# 🕌 شيخنا (Sheikhna)

### _Your Intelligent Islamic Companion_

[![Version](https://img.shields.io/badge/version-1.0.0-gold.svg?style=flat-square)](https://github.com/Amar-Dev1/Sheikhna)
[![React](https://img.shields.io/badge/React-19-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg?style=flat-square&logo=vite)](https://vite.dev/)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat-square&logo=bun&logoColor=white)](https://bun.sh/)
![Hono](https://img.shields.io/badge/hono-%23E36002.svg?style=for-the-badge&logo=hono&logoColor=white)   
![LangChain](https://img.shields.io/badge/LangChain-1c3c3c.svg?logo=langchain&logoColor=white)

---

**شيخنا (Sheikhna)** is a premium, responsive, and highly interactive Islamic RAG (Retrieval-Augmented Generation) assistant. Powered by advanced LLMs and grounded in authentic Islamic knowledge from the Quran and Sunnah, it provides users with precise answers to their religious questions.

</div>

## ✨ Features

- **📖 Grounded RAG Chain**: Answers are retrieved and augmented using a specialized knowledge corpus to ensure alignment with authentic sources.
- **✨ Premium UI/UX**: Designed with a sleek dark-mode, gold-themed glassmorphism elements, custom animations, and a responsive layout.
- **⚡ Smart Quota Management**: Built-in daily usage limits (5 queries per day, resetting daily) with a persistent, dynamic lightning badge indicator.
- **📝 Markdown Rich-Text Rendering**: Full parsing of headers, lists, blockquotes, bold highlights, and code blocks for neat, structured responses.
- **💡 Smart Suggestion Chips**: Quick-start prompts to help guide the user to common queries.
- **🌍 Dynamic RTL Support**: Auto-direction (`dir="auto"`) detection for flawless Arabic and English rendering.

---

## 📁 Project Structure

```text
├── api/                 # Express backend running with Bun
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── rag/         # RAG chain implementation & prompt templates
│   │   ├── services/    # Business logic (quota, data, etc.)
│   │   ├── utils/       # Utility helpers
│   │   └── index.ts     # App entry point
│   └── package.json
│
└── ui/                  # React + Vite + TypeScript frontend
    ├── src/
    │   ├── assets/      # Media & cover images
    │   ├── App.tsx      # Main React UI component
    │   └── index.css    # Typography, global variables, and styles
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- [Bun](https://bun.sh/) (for API runtime)
- npm or bun (for UI package management)

### Setup & Installation

#### 1. Backend API (`/api`)

1. Navigate to the `api` workspace:
   ```bash
   cd api
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Configure environment variables (create a `.env` file):
   ```env
   Credentials you need to add: 
    - Groq API Key
    - Supabase API Key & url
    - HuggingFace API Key
    - 
   ```
4. Run the development server:
   ```bash
   bun run dev
   ```

#### 2. Frontend UI (`/ui`)

1. Navigate to the `ui` workspace:
   ```bash
   cd ui
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Run the development server (proxies request to localhost:3000):
   ```bash
   bun run dev
   ```

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19, TypeScript, Vite 8, Vanilla CSS
- **Markdown Rendering**: `react-markdown`
- **Assets & Icons**: Custom SVG icons & Sheikhna custom graphics

### Backend

- **Runtime**: Bun (high-performance JavaScript runtime)
- **Framework**: Hono (v4.x)
- **RAG & AI**: LangChain Ecosystem, Google Gen AI SDK, Groq, Hugging Face
- **Database / Vector Store**: Supabase Client Integration
