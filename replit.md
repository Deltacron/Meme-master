# Overview

This is a multiplayer meme card game web application called "Meme Masters" built with a modern full-stack architecture. Players create or join rooms to play a Cards Against Humanity-style game where they submit funny caption cards to match photo cards selected by a rotating judge. The game supports 3+ players and includes real-time multiplayer functionality with WebSocket communication.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built as a single-page React application using:
- **React 18** with TypeScript for component-based UI development
- **Wouter** for client-side routing instead of React Router
- **TanStack Query** for server state management and caching
- **Tailwind CSS** with **shadcn/ui** component library for consistent styling
- **Radix UI** primitives for accessible UI components
- **Vite** as the build tool and development server

The frontend follows a page-component architecture with dedicated pages for home, lobby, and game states. Custom hooks manage WebSocket connections (`use-socket.ts`) and game state (`use-game-state.ts`).

## Backend Architecture
The server uses a Node.js Express application with:
- **Express.js** for HTTP API endpoints and middleware
- **WebSocket Server (ws)** for real-time multiplayer communication
- **TypeScript** for type safety across the entire stack
- **In-memory storage** implementation for game data (MemStorage class)

The backend implements a WebSocket-first architecture where most game interactions happen through WebSocket messages rather than HTTP requests. The server manages room creation, player joining, game state synchronization, and turn-based gameplay flow.

## Data Management
The application uses a shared schema approach:
- **Drizzle ORM** configured for PostgreSQL with schema definitions
- **Zod** for runtime type validation and schema validation
- Shared TypeScript types between client and server in `/shared/schema.ts`
- In-memory storage implementation for development/demo purposes

The data layer includes entities for users, rooms, players, cards, and game decks with proper relationships and game state management.

## Game State Management
Game flow is managed through a finite state machine with states:
- **waiting**: Room created, waiting for minimum players
- **selecting_judge**: Players reveal number cards to determine first judge
- **playing**: Active gameplay with rounds of photo/caption card selection
- **finished**: Game completed with winner determination

Real-time synchronization ensures all players see consistent game state through WebSocket broadcasts.

## Development Setup
The project uses a monorepo structure with:
- Client code in `/client` directory
- Server code in `/server` directory  
- Shared types and schemas in `/shared` directory
- Integrated build pipeline with Vite for frontend and esbuild for backend

# External Dependencies

## UI and Styling
- **shadcn/ui**: Pre-built accessible React components with Tailwind CSS
- **Radix UI**: Headless UI primitives for complex components (dialogs, dropdowns, etc.)
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

## State Management and Data Fetching
- **TanStack React Query**: Server state management, caching, and synchronization
- **React Hook Form** with **@hookform/resolvers**: Form handling and validation

## Database and Validation
- **Drizzle ORM**: Type-safe ORM for PostgreSQL database operations
- **@neondatabase/serverless**: Serverless PostgreSQL connection for Neon database
- **Zod**: Schema validation library for runtime type checking
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation

## Real-time Communication
- **ws**: WebSocket library for real-time multiplayer functionality
- Custom WebSocket manager class for connection handling and reconnection logic

## Development Tools
- **Vite**: Fast build tool and development server for frontend
- **esbuild**: Fast JavaScript bundler for backend builds
- **TypeScript**: Type system for both frontend and backend
- **@replit/vite-plugin**: Replit-specific development enhancements

## External Services
The application is configured to use:
- **Neon Database**: Serverless PostgreSQL database (configured via DATABASE_URL)
- **Replit**: Cloud development environment with integrated hosting