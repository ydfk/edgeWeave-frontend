# EdgeWeave Frontend

Modern web interface for EdgeWeave node/subscription management, built with React 19 and Vite 8.

_[中文文档](README_zh.md)_

## Features

- 📊 **Dashboard**: Overview of your nodes, subscriptions, and system status.
- 🔗 **Node Management**: Full CRUD operations for nodes, including batch import and file upload.
- 🔄 **Subscription Management**: Manage subscription sources with real-time sync and history tracking.
- 🛠️ **Output Generation**: Create Mihomo (Clash) compatible configurations with preview, render, and versioning.
- 📏 **Rule Management**: Support for rule templates (ACL4SSR) and custom rule sets.
- 🔐 **Authentication**: Secure JWT-based login and user profile management.
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS and Radix UI Slot primitives.
- 🚀 **Performance**: Powered by Vite 8 beta and React 19 for an ultra-fast development and user experience.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8 (Beta)](https://vite.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [Alova](https://alova.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Components**: [Radix UI Slot](https://www.radix-ui.com/docs/primitives/components/slot)
- **Package Manager**: [pnpm](https://pnpm.io/)

## Project Structure

```
edgeweave-frontend/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images and fonts
│   ├── components/      # Reusable UI components
│   │   ├── auth/        # Auth guards
│   │   ├── layout/      # Sidebar, Header, etc.
│   │   └── ui/          # Low-level UI primitives (Radix)
│   ├── lib/
│   │   ├── api/         # Alova API instances and methods
│   │   └── utils.ts     # Utility functions
│   ├── pages/           # Application views/routes
│   ├── store/           # Zustand stores
│   ├── styles/          # Global CSS and Tailwind config
│   ├── App.tsx          # Root component and routing
│   └── main.tsx         # Application entry point
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind configuration
└── vite.config.ts       # Vite configuration
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Version 22 or higher recommended)
- [pnpm](https://pnpm.io/installation) (Version 10 or higher)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

### Configuration

Create a `.env` file (or copy from `.env.development`) and configure your backend API host:

```env
VITE_PROXY_HOST=http://localhost:25610
VITE_USE_MOCK=false
```

### Development

Run the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173` (or the port specified in your `.env`).

### Build

Build the project for production:

```bash
pnpm build
```

The built files will be in the `dist/` directory.

### Linting & Formatting

```bash
# Linting
pnpm lint

# Formatting
pnpm format
```

## License

This project is licensed under the MIT License.

Copyright © 2025 ydfk.
