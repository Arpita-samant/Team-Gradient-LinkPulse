# LinkPulse — URL Shortener & Analytics Platform

**LinkPulse** is a full-stack, enterprise-grade URL Shortener and Live Analytics Platform designed to convert long URLs into clean, branded short links. It features instant QR code generation, click & scan tracking, campaign organization, role-based access control, advanced security filtering, and an administrative control panel.

---

## 🌟 Architecture Overview

LinkPulse is built using a modern 3-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer (Vercel)                  │
│  React.js (v19) + Vite + Tailwind CSS + Lucide + Recharts   │
│                                                             │
│  • Landing Page (Dark/Light mode, Interactive Hero)         │
│  • Short Link Creator (Base62 + NanoID, Expiry, Password)    │
│  • Custom QR Code Studio (Custom Colors, PNG Download)      │
│  • Link Management Dashboard (Search, Filter, Export)       │
│  • Live Analytics Dashboard (Interactive Recharts Trends)   │
│  • Security Admin Panel (Users, Links, Domain Blocklist)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / REST API / JWT
┌──────────────────────────────▼──────────────────────────────┐
│                  Backend (Node.js + Express)                │
│                                                             │
│  • API Gateway & REST Endpoints (/api/...)                  │
│  • HTTPS & Rate Limiting (express-rate-limit)               │
│  • Authentication Service (bcryptjs + JWT, Role Auth)       │
│  • Security & Validation (MD5 checksums, domain blacklist)  │
│  • URL Shortening Engine (Nano ID + Base62 Encoding)        │
│  • QR Generation Engine (qrcode library)                    │
│  • Redirection & Tracking Service (Device / OS / Browser)   │
│  • Analytics & Audit Log Services                           │
└──────────────────────────────┬──────────────────────────────┘
                               │ Read / Write Operations
┌──────────────────────────────▼──────────────────────────────┐
│                    Database Layer                           │
│  MongoDB Atlas (Mongoose) + Zero-Config Persistent Store    │
│                                                             │
│  • Users Collection (Roles: user, admin)                    │
│  • Links Collection (Original, ShortCode, Hash, Flags)      │
│  • Analytics & ClickLogs (IP, Device, OS, Browser, Clicks)  │
│  • BlockedDomains Collection (Malware / Phishing filters)   │
│  • SystemLogs Collection (Audit trails & Security alerts)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### 1. Landing Page
- Modern, high-converting hero layout with responsive design.
- Dark / Light mode toggle.
- Interactive link preview card with copy button, QR preview, and mini performance metric cards.
- Bottom feature highlight cards: Shorten Links, Track Analytics, Organize Campaigns, and QR Codes.

### 2. URL Shortener Engine
- **NanoID + Base62 Encoding** for short URLs.
- **Custom Branded Aliases**: Choose your own custom short code (with validation against reserved system keywords).
- **Expiry Dates**: Automatically expire links after a set date.
- **Password Protection**: Secure confidential destinations with bcrypt-hashed passwords.
- **Tag Organization**: Categorize links (e.g. `marketing`, `docs`, `education`).
- **Target URL Integrity**: MD5 hash calculated for rapid deduplication and integrity verification.

### 3. QR Code Studio
- Generates high-resolution vector QR codes for any link or custom text.
- Customizable QR code foreground and background colors (Black, Indigo, Mint, Amber, etc.).
- One-click **PNG Download**.
- Web Share API / Copy Link integration.

### 4. Link Management Dashboard
- Table view with columns: Short URL, Original URL, Tags badges, Clicks count, Created Date, Status, and Actions.
- Search by URL, title, or tag.
- Filter by status (`Active`, `Paused`, `Expired`, `Blocked`) and dynamic tag dropdown.
- Single-click status toggling (`Active` ⟷ `Paused`).
- Edit modal for modifying titles, tags, passwords, and expiry dates.
- Export links to **CSV** or **JSON**.

### 5. Live Analytics Dashboard
- Dynamic greeting (`"Good Morning, Arpita!"`) with calendar range indicator.
- 4 Key Metric KPIs with week-over-week trends:
  - **Total Links** (24, +8% vs. last week)
  - **Total Clicks** (1,248, +16% vs. last week)
  - **Total QR Codes** (12, +16% vs. last week)
  - **Total Scans** (384, +14% vs. last week)
- **Click Trends Graph**: Interactive Recharts area chart with 7 Days / 30 Days / Custom views.
- **Top Performing Links**: Real-time rank list with click counts and positive growth percentages.
- **Device & Tech Detection**: Categorized into Desktop, Mobile, and Tablet via `ua-parser-js`, alongside top browsers (Chrome, Safari, Firefox, Edge) and referrers.

### 6. Administrator Security Panel
- High-level platform KPIs: Total Users, Total Links, Total QR Codes, and Suspicious Links.
- Tabbed management views: Users, Links, QR Codes, Suspicious Links, and Security Settings.
- User management: view statuses, edit roles, or delete users.
- Flag or unflag suspicious destinations with automatic redirection blocking.
- Add / remove custom blocked domains from the security blocklist.
- View real-time security audit trails and system activity logs.

### 7. Redirection & Visitor Flow
- Visitors opening `http://localhost:5000/:shortCode` are evaluated:
  - If blocked: redirected to security warning view (`/link-status?type=blocked`).
  - If paused: redirected to paused campaign view (`/link-status?type=paused`).
  - If expired: marked expired and redirected (`/link-status?type=expired`).
  - If password protected: redirected to password prompt screen (`/p/:shortCode`).
  - If valid: Device, OS, Browser, IP, and Referrer are logged, click counters increment, and HTTP 302 redirection executes to destination.

---

## 🔑 Demo Accounts for Testing

LinkPulse is pre-seeded with realistic demonstration accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **User (Arpita)** | `arpita@example.com` | `password123` | Link creation, QR studio, Link Management, Analytics |
| **System Admin** | `admin@linkpulse.com` | `admin123` | Complete Admin Panel, Blocklist, User Control, System Logs |

> **Tip:** You can switch between Arpita (User) and Admin with one click via the role switcher in the top navigation bar or on the login page!

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Recharts, React Router v7
- **Backend**: Node.js, Express.js (ES Modules)
- **Shortening Algorithm**: NanoID + Base62 Encoding
- **Security & Validation**: MD5 checksums, Regex URL parser, Express Rate Limiter, bcryptjs
- **QR Engine**: QRCode library
- **Device & Client Detection**: `ua-parser-js`
- **Database**: MongoDB Atlas (Mongoose) with fallback persistent store (`backend/data/store.json`)

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18 or newer)
- npm (v9 or newer)

### 1. Clone & Enter Directory
```bash
cd "c:\Users\HP\OneDrive\Desktop\Hackathon-Project"
```

### 2. Run Backend
```bash
cd backend
npm install
npm start
```
*Backend runs on: `http://localhost:5000`*

### 3. Run Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

### 4. Optional MongoDB Atlas Configuration
In `backend/.env`, set your connection string:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/linkpulse?retryWrites=true&w=majority
```
*(If omitted, LinkPulse automatically operates on its persistent store with zero setup required.)*

---

## 🛡️ Security Features

1. **Protocol Validation**: Only valid `http://` and `https://` destinations are allowed.
2. **Loopback Protection**: Blocks private network destinations (`127.0.0.1`, `localhost`, `192.168.*`, `10.*`).
3. **Malicious Domain Blacklist**: Blocks known phishing networks, malware distributors, and custom administrator-blocked domains.
4. **Phishing Keyword Heuristics**: Detects suspicious strings in destination URLs.
5. **Rate Limiting**: Protects against brute-force password attempts and spam URL creation.
6. **Password Hashing**: Protects user credentials and protected links using salted bcrypt hashes.
7. **JWT Authentication**: Role-based access tokens with strict expiration.
