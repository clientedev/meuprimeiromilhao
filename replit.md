# Estoque Vivo - Inventory Management System

## Overview

Estoque Vivo is a Brazilian inventory management and point-of-sale (PDV) application designed for food service businesses like pizzerias. The system tracks raw ingredients, manages product recipes with ingredient compositions, and automatically deducts stock when sales are processed. Built as a full-stack TypeScript application with React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for dashboard visualizations

The frontend follows a page-based structure with shared components. Key pages include Dashboard (overview), Inventory (ingredient management), Products (recipe management), and Sales (point-of-sale interface).

### Backend Architecture
- **Framework**: Express 5 running on Node.js
- **API Design**: RESTful endpoints defined in a shared routes contract (`shared/routes.ts`)
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas shared between frontend and backend via `drizzle-zod`

The backend uses a storage abstraction layer (`server/storage.ts`) that implements the `IStorage` interface, making it possible to swap database implementations if needed.

### Data Model
Three main entities with relationships:
1. **Ingredients**: Raw materials with stock tracking (quantity, unit, package info, minimum stock levels)
2. **Products**: Items for sale with pricing and descriptions
3. **ProductIngredients**: Junction table linking products to their ingredient requirements with quantities

### Build System
- **Development**: Vite for hot module replacement and fast builds
- **Production**: esbuild bundles the server, Vite builds the client
- **Database Migrations**: Drizzle Kit for schema push operations

### API Contract Pattern
The application uses a shared API contract in `shared/routes.ts` that defines:
- HTTP methods and paths for each endpoint
- Input validation schemas using Zod
- Response type schemas

This enables type-safe API calls on the frontend and consistent validation on the backend.

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connected via `DATABASE_URL` environment variable
- **Drizzle ORM**: Database toolkit with type-safe queries and schema management
- **connect-pg-simple**: PostgreSQL session store (available but not currently used)

### UI Framework
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-styled components using Radix + Tailwind
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Development server with HMR
- **Replit plugins**: Runtime error overlay, cartographer, dev banner for Replit environment
- **TypeScript**: Full type coverage across client, server, and shared code

### Key NPM Packages
- `@tanstack/react-query`: Async state management
- `react-hook-form`: Form state management
- `zod`: Runtime type validation
- `drizzle-zod`: Generate Zod schemas from Drizzle tables
- `wouter`: Lightweight React router
- `recharts`: Dashboard charting library