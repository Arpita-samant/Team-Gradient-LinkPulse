## 📌 Problem Statement

**Long URLs:** Difficult to share, manage, and read across communication channels.

**Lack of Tracking:** Manual tracking of link performance is cumbersome and inefficient.

**Usability Gaps:** Users need a simple, centralized way to monitor clicks, device stats, and link status.

**Advanced Controls:** Certain links require custom aliases, password protection, expiration dates, or click limits for better security.



## 💡 Solution Overview

**LinkPulse** is a comprehensive URL Shortener and Real-Time Analytics Platform designed to bridge the gap between simple link redirection and deep performance tracking. It converts long URLs into concise, manageable short links while offering QR code generation, click metrics, device detection, robust security features, and a dedicated admin panel in one unified interface.



### Core Workflows

**Create Short Link:** Input an original URL $\rightarrow$ generate a unique short code (via Nano ID / Base62) or custom alias $\rightarrow$ apply rules (expiry, password, tags) $\rightarrow$ save securely.

**Redirection & Tracking:** Visitors click the short link $\rightarrow$ Express backend validates active status, expiry, and password $\rightarrow$ records analytics metrics $\rightarrow$ redirects seamlessly.

**Analytics & Management:** Centralized dashboard visualizes live click trends, total scans, and top-performing links using dynamic charting tools.



## ✨ Features

**Landing Page:** Modern UI supporting dark/light mode toggle, smooth page routing, and authentication (Login/Signup).

**Link Creation & Rules:** Generate short URLs, custom aliases, set expiry dates, add password protection, and organize links using tags.

**QR Code Generation:** Generate custom QR codes for any link, download as PNG, or share instantly.

**Link Management Dashboard:** Filter and search saved links by tags, view total clicks, creation dates, and statuses.

**Advanced Analytics Dashboard:** Track total links, clicks, QR codes, scan metrics, and view real-time click trend graphs powered by Recharts alongside device detection breakdown.

**Admin Panel:** Monitor platform activity, total users, total links, total QR codes, and review/disable suspicious links.

**Security:** Strict URL validation, block unsafe websites, HTTPS enforcement, rate limiting, and bcrypt password hashing.



## 🛠️ Tech Stack

### Frontend

**Core:** React.js, Vite (Fast dev server & builds)

**Styling:** Tailwind CSS

**Routing:** React Router

**Visualizations:** Recharts (Click trends & analytics)

### Backend

**Server:** Node.js, Express.js (REST API architecture)

**Authentication:** bcrypt (Password hashing), JSON Web Tokens (JWT)

**URL Engine:** Nano ID & Base62 Encoding

**QR Code:** QR Code generation library

### Database & Storage

**Database:** MongoDB Atlas (Collections for Users, Links, and Analytics/Logs)

### Deployment & Version Control

**Hosting:** Vercel (Frontend & Serverless deployment)

**Version Control:** Git & GitHub



## 🚀 Setup Instructions

Follow these steps to run LinkPulse locally on your machine:

### Prerequisites

Node.js installed on your system

MongoDB Atlas account or local MongoDB instance

### 1. Clone the Repository
```text-plain
git clone https://github.com/your-username/linkpulse.git
cd linkpulse
