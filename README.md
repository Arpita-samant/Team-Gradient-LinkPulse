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

**Link Management Dashboard:** Filter and search saved links by tags, view total clicks, creation dates, expiry date, status and actions.

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


<<<<<<< HEAD

=======
## 🚀 Setup Instructions

Follow these steps to run LinkPulse locally on your machine.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- [Git](https://git-scm.com/)
- MongoDB Atlas account (optional if using the project's fallback storage)

### 1. Clone the Repository

```bash
git clone https://github.com/Arpita-samant/Team-Gradient-LinkPulse.git
cd Team-Gradient-LinkPulse
```

### 2. Install Dependencies

Install the root dependencies:

```bash
npm install
```

Install the backend dependencies:

```bash
cd backend
npm install
```

Install the frontend dependencies in a separate terminal:

```bash
cd frontend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory and configure the required environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Replace the placeholder values with your actual MongoDB connection string and a secure JWT secret.

If your application supports fallback storage, MongoDB configuration may be optional for local testing. Data persistence depends on the storage implementation.

**Security:** Never commit your `.env` file or expose your database credentials and secret keys publicly.

### 4. Start the Backend

Open a terminal in VS Code and run:

```bash
cd backend
npm run dev
```

The backend runs on port `5000` by default.

Keep this terminal running while using the application.

### 5. Start the Frontend

Open a second terminal in VS Code and run:

```bash
cd frontend
npm run dev
```

Open the local URL displayed in the terminal, usually:

```text
http://localhost:5173
```

### 6. Access LinkPulse

Once both the backend and frontend are running, open the frontend URL in your browser to use LinkPulse.

- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:5000`

### Troubleshooting

- **Port 5000 already in use:** Stop the existing backend process before restarting the server.
- **Dependencies missing:** Run `npm install` inside the relevant project directory.
- **MongoDB connection issue:** Verify your `MONGO_URI` in the backend `.env` file.
- **Frontend cannot connect to backend:** Check that the backend is running and the frontend API configuration uses the correct backend URL.

## 🌐 Live Link

**Live Application:** https://link-pulse-tawny.vercel.app/


## 🎥 Project Demo

https://github.com/user-attachments/assets/ff94aabe-64a8-4b5a-96bf-aca8bb0aa2b2






