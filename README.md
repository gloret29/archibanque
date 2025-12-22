# ArchiModeler - Enterprise Architecture Platform 🏗️

ArchiModeler is a production-grade Enterprise Architecture platform built with **Next.js 15**, **React 19**, and **PostgreSQL**. It provides comprehensive ArchiMate 3.2 modeling capabilities with a modern, intuitive interface.

## ✨ Features

### Core Modeling
- **Full ArchiMate 3.2 Support**: All 7 layers (Strategy, Business, Application, Technology, Physical, Motivation, Implementation)
- **React Flow Canvas**: Infinite canvas with zoom, pan, minimap, and snap-to-grid
- **Smart Relationships**: Automatic validation of ArchiMate relationship rules
- **Derived Relations**: Automatic inference of transitive relationships

### Repository Management
- **Model Browser**: Hierarchical navigation with unlimited folder depth
- **Drag & Drop Organization**: Reorganize folders, views, and elements
- **Visual Selection**: Focus highlight on selected items
- **Keyboard Shortcuts**: F2 for rename, Delete for removal

### Collaboration
- **Check-in/Check-out**: Lock mechanism to prevent concurrent editing
- **Project Sandboxing**: Isolated branches for "To-Be" scenarios
- **Auto-save**: Automatic persistence every 2 seconds

### Extensibility
- **DataBlocks**: Custom attribute system for extending ArchiMate objects
- **Configurable Visibility**: Enable/disable element types per project

### Enterprise Features
- **Read-only Portal Mode**: Stakeholder access without edit permissions
- **Export Engine**: PNG, SVG, and PDF exports
- **Onion Diagram Layout**: Concentric circle visualizations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database connection

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── admin/        # Administration module
│   ├── modeler/      # Expert modeling interface
│   └── portal/       # Read-only portal
├── components/       # React components
│   ├── Modeling/     # Canvas, nodes, edges
│   └── UI/           # Shared UI components
├── store/            # Zustand state management
├── lib/              # Utilities and metamodel
└── actions/          # Server actions
```

## 📚 Documentation

- **[ROADMAP.md](ROADMAP.md)** - Detailed feature roadmap
- **[MANUEL_UTILISATEUR.md](MANUEL_UTILISATEUR.md)** - User manual (French)
- **[BizzDesign_features.md](BizzDesign_features.md)** - Feature comparison

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + React Flow |
| State | Zustand |
| Database | PostgreSQL + Prisma |
| Styling | Tailwind CSS + CSS Modules |
| Auth | Authelia (SSO) |

## 📄 License

Proprietary - All rights reserved.

---

*ArchiModeler - Enterprise Architecture Platform*  
*Version 1.0 - December 2024*
