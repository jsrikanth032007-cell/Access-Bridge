# AccessBridge – AI for Accessibility & Inclusion

> **Transforming complex digital content into accessible, plain-language, audio, and visual formats for people with disabilities and language barriers.**

AccessBridge is an inclusive full-stack web application designed to empower individuals with **visual impairment, dyslexia, cognitive & learning disabilities (ADHD), hearing loss, motor difficulties, and language barriers**. Using Google Gemini AI, Web Speech APIs, and WCAG 2.1 AA compliant design, AccessBridge converts complex notices, legal clauses, medical records, web pages, diagrams, and educational lectures into formats anyone can independently understand and interact with.

---

## Table of Contents
1. [Problem Statement](#problem-statement)
2. [Solution Overview](#solution-overview)
3. [Key Features](#key-features)
4. [System Architecture](#system-architecture)
5. [Tech Stack](#tech-stack)
6. [Accessibility Compliance (WCAG 2.1 AA)](#accessibility-compliance-wcag-21-aa)
7. [Getting Started & Local Setup](#getting-started--local-setup)
8. [Environment Variables](#environment-variables)
9. [Pre-Seeded Demo Account & Sample Data](#pre-seeded-demo-account--sample-data)
10. [API Documentation](#api-documentation)
11. [Deployment Guide](#deployment-guide)
12. [License](#license)

---

## Problem Statement

Millions of people face severe digital exclusion daily:
- **Visual Impairment & Low Vision:** Digital charts, transit maps, and documents lack meaningful alt text or readable descriptions.
- **Dyslexia & Reading Strain:** Cramped typography, dense prose, and lack of formatting lead to cognitive fatigue and misinterpretation.
- **Cognitive & ADHD Support:** Legal, governmental, and medical notices use convoluted jargon without clear action items or deadlines.
- **Deaf & Hard-of-Hearing (HoH):** Recorded audio and spoken classroom lectures lack structured summaries, key terms, and comprehension checks.
- **Language & Translation Barriers:** Critical services are frequently only available in technical English, excluding non-native speakers.
- **Motor Impairments:** Complex multi-step navigation requires mouse dexterity instead of fluid speech and keyboard control.

---

## Solution Overview

**AccessBridge** creates an individualized bridge between the user and any digital content:
1. **Content Simplification:** Converts text, uploaded PDFs/TXT files, or websites into 3 reading levels (*Very Simple*, *Simple*, *Original*), extracts 3 critical key points, generates an interactive "What should I do next?" checklist, defines difficult terminology, and translates into 6 regional languages.
2. **Assistive Vision & OCR:** Uploads graphics, diagrams, or photos to generate concise screen-reader alt-text, in-depth spatial scene descriptions for blind users, and transcribes all visible text with automatic audio narration.
3. **Voice Assistant:** Enables hands-free natural speech interaction (Web Speech API STT) to ask clarifying questions about documents ("What is the deadline?", "Explain paragraph 2 again") with answers spoken back (SpeechSynthesis TTS).
4. **Accessible Lecture & Audio Notes:** Converts lecture transcripts into structured visual summaries, key definitions, and interactive 3-question quizzes with instant scoring.
5. **Persistent Accessibility Profile:** Automatically applies dyslexia fonts (*Lexend*), text scaling, high-contrast dark theme, reduced motion, and auto-read-aloud across the entire experience.

---

## Key Features

| Feature | Description | Assistive Benefit |
| :--- | :--- | :--- |
| **Content Simplifier** | Paste text, upload PDF/TXT, or enter a web URL | Converts jargon into plain language + 3 key points + action checklist + glossary |
| **Image Describer** | Upload image files (PNG, JPG, WebP) | Generates screen-reader alt text + blind-user scene description + OCR text |
| **Voice Assistant** | Speech-to-text mic input with spoken TTS answer | Hands-free Q&A about simplified documents or general access questions |
| **Lecture & Audio Notes**| Turn spoken transcripts into summaries & quizzes | Visual study structure and self-assessment comprehension checks |
| **Accessibility Profile**| Saves disability types, language, font, contrast | Synchronized across sessions and automatically applied to all tools |
| **Persistent History** | Save, view, and delete past results | Quick re-reading and offline reference |
| **Accessibility Toolbar**| Instant adjustments on every page | -A/A/A+ scaling, Dyslexia Font toggle, High-contrast, Auto read-aloud |

---

## System Architecture

### Architectural Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT (Vite + React)                            |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  | AccessibilityToolbar|  | Semantic Navigation  |  | SkipToContent Link        |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  | Web Speech API STT |  | SpeechSynthesis TTS  |  | Contexts (Auth, A11y)     |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  | Assistive Pages:                                                            |  |
|  | - Content Simplifier  - Image Describer  - Voice Assistant  - Lecture Notes |  |
|  | - Accessibility Profile  - History Hub   - Dashboard        - Auth Pages    |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------|-----------------------------------------+
                                          | Axios Interceptors (JWT Bearer)
                                          v
+-----------------------------------------------------------------------------------+
|                                 BACKEND (Node.js + Express)                       |
|                                                                                   |
|  +------------------+  +-------------------+  +--------------------------------+  |
|  | Helmet & CORS    |  | Express Rate Limit|  | Multer (PDF, TXT, Image Upload)|  |
|  +------------------+  +-------------------+  +--------------------------------+  |
|  | JWT & Bcrypt Auth|  | Zod Input Validate|  | Centralized Error Handler      |  |
|  +------------------+  +-------------------+  +--------------------------------+  |
|  | Controllers:                                                                |  |
|  | - Auth (register, login, me)           - Profile (get, update)              |  |
|  | - AI (simplify, describe-image, ask, lecture-notes) - History (CRUD)        |  |
|  +---------------------------|--------------------------------|----------------+  |
+------------------------------|--------------------------------|-------------------+
                               |                                |
                               v                                v
               +-------------------------------+   +-----------------------------+
               |   Google Gemini AI Models     |   |   Database Layer            |
               |   (gemini-1.5-flash / vision) |   |   - MongoDB (Mongoose)      |
               |   *Called ONLY from Backend*  |   |   - Resilient Fallback Store|
               +-------------------------------+   +-----------------------------+
```

---

## Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS with custom WCAG high-contrast tokens and Lexend dyslexia fonts
- **Icons:** Lucide React
- **HTTP Client:** Axios (configured with request & response interceptors)
- **Browser APIs:** Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) and `SpeechSynthesis`

### Backend
- **Runtime:** Node.js (v18+) with Express.js
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs hashing
- **Validation:** Zod schema validation for inputs and Gemini JSON outputs
- **AI Service:** Google Generative AI (`@google/generative-ai`) calling `gemini-1.5-flash` strictly server-side
- **File & Document Processing:** Multer, `pdf-parse` (PDF extraction), and `cheerio` (web scraping)
- **Security & Reliability:** Helmet HTTP headers, CORS, Express-Rate-Limit, centralized error handling

### Database
- **Primary:** MongoDB with Mongoose schemas (`User`, `Profile`, `History`)
- **Resilient Fallback Mode:** Automatic zero-config local persistence if MongoDB is not running locally, guaranteeing smooth evaluation and demo runs.

---

## Accessibility Compliance (WCAG 2.1 AA)

- **Semantic HTML5:** `<header>`, `<nav>`, `<main id="main-content">`, `<section>`, `<aside>`, `<footer>`, `<fieldset>`, `<legend>`.
- **Keyboard Navigation:** Full focus ring visibility (`:focus-visible`), Tab order preservation, and skip-to-content bypass.
- **ARIA Live Regions:** `aria-live="polite"` on all dynamic AI generation views and `role="alert"` on errors.
- **Color Contrast:** Exceeds 4.5:1 ratio for regular text and 3:1 for large text. High-contrast mode delivers > 18:1 contrast.
- **Dyslexia Support:** Integrated Google Font *Lexend* with widened letter spacing and enhanced line height.
- **Vestibular & Motion:** CSS `reduced-motion` classes to eliminate animations for sensitive users.
- **Multilingual TTS:** Support for English, Tamil (தமிழ்), Hindi (हिन्दी), Telugu (తెలుగు), Malayalam (മലയാളം), and Kannada (ಕನ್ನಡ).

---

## Getting Started & Local Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- *(Optional)* Local MongoDB or MongoDB Atlas connection string.
- *(Optional)* Google Gemini API Key ([Get free key here](https://aistudio.google.com/app/apikey)).

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd disability

# Install root, backend, and frontend dependencies in one command:
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root and in `/server`:
```bash
# Windows PowerShell:
Copy-Item .env.example .env
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Add your Google Gemini API key to `server/.env`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Seed Demo Account and Sample Data
```bash
npm run seed
```
This populates:
- Demo User: `demo@accessbridge.org` / `Password123!`
- Sample simplified medical discharge record
- Sample transit visual scene description
- Sample clean energy lecture notes and quiz

### 4. Run the Full Application
```bash
# Starts both Backend (Port 5000) and Frontend (Port 5173) concurrently:
npm run dev
```

Access the application in your browser:
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `CLIENT_URL` | Allowed origin for CORS | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection string (Atlas or Local) | `mongodb://127.0.0.1:27017/accessbridge` |
| `JWT_SECRET` | Secret key for signing JWT tokens | *(secure string)* |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `GEMINI_API_KEY` | Google Gemini API key (kept strictly backend-side) | *(your key)* |
| `GEMINI_MODEL` | Gemini model name | `gemini-1.5-flash` |
| `MAX_FILE_SIZE_BYTES` | Maximum allowed file upload size | `10485760` (10MB) |

---

## Pre-Seeded Demo Account & Sample Data

For quick evaluation and demo video recording:
- **Email:** `demo@accessbridge.org`
- **Password:** `Password123!`
- **Pre-loaded Profile:** Dyslexia font enabled, large text scaling, English preferred.
- **Pre-loaded History:**
  1. *Medical Discharge & Prescription Advisory* (Simplified medical notice with key points and action checklist)
  2. *City Metro Station Accessibility Map* (Scene description & OCR text readout)
  3. *Clean Energy & Solar Photovoltaic Systems* (Lecture summary, key terms, and 3-question quiz)

---

## API Documentation

All protected endpoints require the header: `Authorization: Bearer <JWT_TOKEN>`.

### Authentication Endpoints
- `POST /api/auth/register` – Create user account & default profile.
- `POST /api/auth/login` – Authenticate with email and password.
- `GET /api/auth/me` – Retrieve current authenticated user and profile.

### Accessibility Profile Endpoints
- `GET /api/profile` – Fetch current user's accessibility preferences.
- `PUT /api/profile` – Update disability types, reading level, language, font, and contrast preferences.

### AI Assistive Endpoints
- `POST /api/ai/simplify` – Simplifies text, uploaded PDF/TXT, or URL into plain language, 3 key points, action steps, glossary, and regional translation.
- `POST /api/ai/describe-image` – Multi-part upload for image alt-text, detailed scene description, and OCR detection.
- `POST /api/ai/ask` – Q&A endpoint for voice assistant queries based on optional document context.
- `POST /api/ai/lecture-notes` – Turns transcript into structured summary, key concepts, and multiple-choice quiz.

### History Endpoints
- `GET /api/history` – List all saved transformations for the user.
- `GET /api/history/:id` – Fetch specific transformation record.
- `DELETE /api/history/:id` – Delete specific transformation from history.

---

## Deployment Guide

### 1. Backend Deployment (Render or Railway)
1. Push the code to a GitHub repository.
2. In **Render** or **Railway**, create a new **Web Service**.
3. Set the Root Directory to `server`.
4. Build Command: `npm install`
5. Start Command: `node src/index.js`
6. Add Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `CLIENT_URL=https://your-frontend-app.vercel.app`
   - `MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/accessbridge?retryWrites=true&w=majority`
   - `JWT_SECRET=your_production_secure_jwt_secret`
   - `GEMINI_API_KEY=your_gemini_api_key`
   - `GEMINI_MODEL=gemini-1.5-flash`

### 2. Frontend Deployment (Vercel or Netlify)
1. In **Vercel** or **Netlify**, import the repository.
2. Set Root Directory to `client`.
3. Framework Preset: `Vite`.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_API_URL=https://your-backend-api.onrender.com/api`
7. Click **Deploy**.

### 3. Database Setup (MongoDB Atlas)
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a Database User and whitelist `0.0.0.0/0` (or your backend provider IP).
3. Copy the connection string and paste it as `MONGO_URI` in your backend configuration.

---

## License

This project is licensed under the MIT License – built to ensure universal digital equity and inclusion.
