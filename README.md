<div align="center">

# 🚀 PsiAtiva — Landing Page

**A specialized Healthcare patient acquisition system built with Astro, React & Tailwind CSS.**

[![Astro](https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://greensock.com/gsap/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge)](LICENSE)

</div>

---

A production-ready Astro landing page designed for **healthcare providers, psychology clinics, and medical specialists**. Configure it via `src/config/site.config.ts` to deploy a fully branded clinical platform in minutes.

### Key Features

- ⚡ **Lightning-fast** — Static-first Astro architecture for near-instant load times
- 🤖 **Healthcare AI focused** — Pre-configured content for medical triages, chatbots, and automation
- 🎨 **Single-file customization** — Brand, colors, fonts, contact — all in `site.config.ts`
- 🌍 **Multilingual** — Built-in PT/EN toggle with no page reloads
- 🌗 **Dark/Light mode** — Automatic theme toggle with smooth transitions
- 📬 **Contact form** — Web3Forms delivery + hCaptcha bot protection
- 📱 **Fully responsive** — Mobile-first design with Tailwind CSS v4
- 🧩 **Section toggles** — Show/hide any section from the config
- 📊 **Data-driven** — Services, testimonials, process steps all editable via JSON
- 🗂️ **MDX support** — Legal pages with Markdown + JSX via `@astrojs/mdx`
- 🎭 **Optional 3D** — Three.js components available in `components/optional/`

---

## ⚡ Quick Start

```bash
# 1. Clone the project
git clone https://github.com/locuz-com-br/psiativa.git
cd psiativa

# 2. Install dependencies
npm install

# 3. Customize the site
#    Open src/config/site.config.ts and fill in your brand details

# 4. Start developing
npm run dev
```

Open `http://localhost:4321` to see your site.

---

## 🎨 Customization Guide

### 1. Brand & Identity (`src/config/site.config.ts`)

This is the **single source of truth** for the entire site. Edit this file to change:

| Property | What it controls |
|---|---|
| `name` | Brand name in title, meta tags, footer copyright |
| `colors.primary` | Main brand color (buttons, gradients, accents) |
| `colors.accent` | Secondary color (badges, icons, section labels) |
| `colors.highlight` | CTA highlight color (urgent buttons, stars) |
| `fonts.*` | Display, subtitle, and body font families |
| `contact.*` | Email, phone,  WhatsApp, meeting URL |
| `socials.*` | Social media links (empty = hidden) |
| `logos.*` | Logo file paths for navbar/footer (light/dark) |
| `sections.*` | Toggle sections on/off (`true`/`false`) |
| `analytics.*` | Web3Forms, hCaptcha, GA, and Clarity IDs |
| `formbricks.*` | Formbricks host, workspace/environment, survey, and trigger |

### 2. Content (`src/data/`)

All section content is driven by JSON data files:

| File | Controls |
|---|---|
| `translations.json` | All UI text for PT and EN |
| `capabilities.json` | Tools/platforms in the logo bar marquee |
| `services.json` | Service tier cards |
| `process.json` | Process timeline steps |
| `results.json` | Stats/metrics cards |
| `why-us.json` | Value proposition cards |
| `testimonials.json` | Client testimonial cards |

### 3. Logos (`public/images/logo/`)

Replace the placeholder SVGs with your client's logos:

- `logo-light.svg` — Navbar, light theme
- `logo-dark.svg` — Navbar, dark theme
- `logo-footer-light.svg` — Footer, light theme
- `logo-footer-dark.svg` — Footer, dark theme

### 4. Legal Pages (`src/content/pages/`)

Review the public legal copy before each production release:
- `termos.mdx` — Terms of Use
- `privacidade.mdx` — Privacy Policy
- `cookies.mdx` — Cookie Policy

### 5. Environment Variables

```bash
cp .env.example .env
# Configure Web3Forms, GA4, Clarity, Formbricks, and capture webhooks.
```

---

## ❔ How to Use for a New Client

```
// 1. Open src/config/site.config.ts
// 2. Change these values:

export const SITE_CONFIG = {
  name: "ClientCo",
  colors: {
    primary: "#2563EB",   // Client's brand blue
    accent: "#10B981",    // Client's secondary green
    highlight: "#F59E0B", // CTA orange
  },
  contact: {
    email: "hello@clientco.com",
    whatsappNumber: "5511999999999",
    // ...
  },
  // ... rest of config
}

// 3. Replace placeholder logos in public/images/logo/
// 4. Edit translations.json for client-specific copy
// 5. npm run build → deploy
```

---

## 📁 Project Structure

```
psiativa/
├── public/
│   ├── fonts/              # Local fonts (New York, Lora)
│   ├── images/logo/        # Brand logos (light/dark, navbar/footer)
│   └── .htaccess           # Apache rewrite rules
├── src/
│   ├── components/
│   │   ├── sections/       # Page sections (Hero, Services, Contact, etc.)
│   │   ├── optional/       # Optional components (Three.js 3D scenes)
│   │   └── ui/             # Reusable UI primitives (Badge, Button)
│   ├── config/
│   │   └── site.config.ts  # ⭐ MAIN CONFIG FILE
│   ├── constants/
│   │   └── links.ts        # Derived link constants (auto-generated from config)
│   ├── content/pages/      # MDX legal pages (terms, privacy, cookies)
│   ├── data/               # JSON data for all sections
│   ├── layouts/            # Page layout (BaseLayout.astro)
│   ├── lib/                # Utilities (CMS SDK placeholder, helpers)
│   ├── pages/              # File-based routing
│   ├── scripts/            # Client-side scripts (i18n engine)
│   └── styles/             # Global CSS design system
├── .env.example            # Environment variable template
├── astro.config.mjs        # Astro configuration
├── tailwind.config.mjs     # Tailwind CSS configuration
└── package.json
```

---

## 🧩 Available Commands

| Command | Action |
|---|---|
| `npm run dev` | 🔥 Start local dev server at `http://localhost:4321` |
| `npm run build` | 📦 Build production site to `./dist/` |
| `npm run preview` | 👀 Preview production build locally |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| 🏗️ **Framework** | [Astro](https://astro.build/) v5+ |
| ⚛️ **UI Components** | [React](https://reactjs.org/) 19 |
| 🎨 **Styling** | [Tailwind CSS](https://tailwindcss.com/) v4 (Vite plugin) |
| 🌐 **Animation** | [GSAP](https://greensock.com/gsap/) (scroll-driven) |
| 📝 **Content** | MDX via `@astrojs/mdx` |
| 📬 **Forms** | [Web3Forms](https://web3forms.com/) + [hCaptcha](https://www.hcaptcha.com/) |
| 📞 **Phone Input** | `react-phone-number-input` |
| 🔤 **Language** | TypeScript |

---

## 🌐 Internationalization

The site supports **Portuguese (PT)** and **English (EN)** via a client-side i18n engine:

- Language is **auto-detected** from the browser and **persisted** in `localStorage`
- Toggle in the navbar — switching is instant, **no page reload** required
- All text is centralized in `src/data/translations.json`

---

## 📄 License

This project is distributed under the **Apache License 2.0**.
See [**LICENSE**](LICENSE) for the full terms and conditions.

---

<div align="center">

Built with ❤️ as a specialized template for health-tech and clinics

</div>
