# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a healthcare analytics dashboard for psychiatric services (PSI Analytics) built with:
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL database)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation

## Available Commands

### Development
- `npm run dev` - Start development server on port 8080
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Package Management
- `npm i` - Install dependencies (Node.js project)

## Architecture

### Directory Structure
- `src/pages/` - Main application pages/routes
  - `Dashboard.tsx` - Main analytics dashboard
  - `Reinternacoes.tsx` - Readmissions analysis
  - `Tendencias.tsx` - Trends analysis
  - `Exportar.tsx` - Data export functionality
  - `SobreServico.tsx` - Service information
- `src/components/` - Reusable components
  - `dashboard/` - Dashboard-specific components (charts, metrics, filters)
  - `ui/` - shadcn/ui component library
- `src/integrations/supabase/` - Database integration
  - `types.ts` - Auto-generated database types
  - `client.ts` - Supabase client configuration
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions

### Key Features
- **Patient Data Management**: Handles psychiatric patient data (`pacientes_planalto` table)
- **Analytics Dashboard**: Visualizes metrics like readmissions, trends, demographics
- **Chart Components**: Line charts, bar charts, pie charts using Recharts
- **Data Export**: Functionality to export analytics data
- **User Authentication**: Supabase auth with role-based access (`profiles`, `user_roles` tables)

### Database Schema
Main tables:
- `pacientes_planalto` - Patient data with fields like CID codes, admission/discharge dates, demographics
- `profiles` - User profiles linked to authentication
- `user_roles` - Role-based access control

### Routing
All routes are wrapped in `DashboardLayout` component:
- `/` - Landing page (Index)
- `/dashboard` - Main dashboard
- `/reinternacoes` - Readmissions analysis
- `/tendencias` - Trends analysis
- `/sobre-servico` - Service information
- `/exportar` - Data export

### Development Notes
- Uses `@` alias for `./src` imports
- Vite development server runs on port 8080
- TypeScript configuration allows some flexibility (noImplicitAny: false, strictNullChecks: false)
