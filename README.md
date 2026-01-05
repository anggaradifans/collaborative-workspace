# Radifan Workspace 🚀

A robust, scalable, real-time collaborative workspace platform built for seamless team interaction.

## ✨ Features

- **🎨 Collaborative Whiteboard**: Real-time drawing and shape manipulation with Yjs-backed shared state.
- **📋 Collaborative Kanban Board**: High-performance drag-and-drop task management.
- **👥 Real-time Presence**: Interactive user avatars showing exactly who is online in the workspace.
- **📝 Enhanced Task Details**: Rich task cards with descriptions, status tracking, and live assignee selection.
- **⚡ Conflict Resolution**: Powered by Yjs CRDTs for seamless, lag-free multi-user editing.
- **🏗️ Scalable Architecture**: Redis-backed horizontal scaling for WebSockets and NestJS.

## 🛠 Tech Stack

- **Monorepo**: NPM Workspaces
- **Frontend**: Next.js 14+, TailwindCSS, React Konva, Lucide React
- **Backend**: NestJS, Socket.IO, TypeORM
- **Persistence**: PostgreSQL
- **Scaling**: Redis
- **Synchronization**: Yjs (Conflict-free Replicated Data Types)

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **Docker**: For running PostgreSQL and Redis services

### Installation

1. **Clone the repository**:
   ```bash
   git clone git@github.com:anggaradifans/collaborative-workspace.git
   cd collaborative-workspace
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   ```bash
   cp .env.example .env
   ```
   *Check the `.env` file to ensure the configuration matches your local environment.*

4. **Start Infrastructure**:
   ```bash
   docker-compose up -d
   ```

### Running Locally

You can start both the frontend and backend with a single command:

```bash
npm run dev
```

- **Frontend (Next.js)**: [http://localhost:3000](http://localhost:3000)
- **API (NestJS)**: [http://localhost:3001](http://localhost:3001)

## 📂 Project Structure

```text
├── apps/
│   ├── web/      # Next.js Frontend
│   └── api/      # NestJS Backend
├── .env          # Environment variables (gitignored)
├── .gitignore    # Global git ignore rules
└── docker-compose.yml # Infrastructure services
```

## 🔐 Security & Persistence

- **Environment Isolation**: Sensitive credentials are managed via `.env` files.
- **Auto-Persistence**: Yjs states are automatically binary-merged and persisted into PostgreSQL for data durability.

## 📝 License

This project is licensed under the MIT License.
