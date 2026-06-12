# DeployCrane Dashboard

A React + TypeScript web dashboard for interacting with the DeployCrane backend system.

---

## Overview

DeployCrane Dashboard is a frontend application built with React and TypeScript. It provides a user interface for communicating with the DeployCrane backend API.

---

## Features

- Deploy applications via backend API
- Real-time deployment status updates
- Live streaming of deployment logs (SSE)
- View and track deployment lifecycle

---

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Zustand (state management)
- Axios (HTTP client)
- TailwindCSS (styling)
- Framer Motion (animations)

---

## Backend Integration

This frontend communicates with the DeployCrane backend via HTTP API requests.

Backend repository:
https://github.com/ParsaSafavi05/deploycrane

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8080
```

---

## Getting Started

Install dependencies:

```bash
npm install
```

Run development server

```bash
npm run dev
```