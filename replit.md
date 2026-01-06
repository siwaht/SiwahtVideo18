# Overview

Siwaht is a comprehensive web application for AI-powered video and audio content creation. The platform offers AI video ad creation, realistic avatar generation, voice ads (multilingual), professional video editing, and podcast production capabilities. Built as a full-stack TypeScript application with React frontend and Express backend, it provides a responsive landing page with detailed service showcases and a contact form for lead generation. The project's vision is to position Siwaht as a professional AI video and audio creation agency, emphasizing partnership and custom service delivery over self-service tools.

## Recent Updates (October 2025)
- **Platform Agnostic Improvements**: Made codebase fully platform agnostic for deployment on any server (AWS, Azure, Heroku, etc.)
  - Replit-specific Vite plugins now conditionally load only on Replit (checks for REPL_ID env var)
  - Database configuration uses DATABASE_URL environment variable (works on any platform)
  - All file paths are relative and configurable
  - Build and production scripts are platform independent
- **Bug Fixes**: Fixed all console errors and warnings
  - Created `public/media-config.json` file with proper structure (videoAds, avatars, voiceSamples, editedVideos, podcasts)
  - Removed console.log error statements from video components (avatars.tsx, video-editing.tsx)
  - Eliminated "Could not load media-config.json" warnings from server logs
- **Migration Complete**: Successfully migrated from Replit Agent to Replit environment with full functionality

## Previous Updates (January 2025)
- Comprehensive SEO optimization: Added structured data (JSON-LD), meta tags, Open Graph tags, sitemap.xml, and robots.txt
- LLM optimization: Enhanced semantic HTML structure, proper ARIA labels, and descriptive alt text for media
- Mobile responsiveness: Improved touch targets (44x44px minimum), better text readability, and optimized media containers
- Rebranded "Voice Synthesis" to "Voice Ads" throughout the site
- Added Siwaht logo integration in navigation and footer
- Reverted video optimization: Removed lazy loading functionality and restored original VideoPlayer component
- Code cleanup: Removed unused components (LazyVideoPlayer, Breadcrumb, SEO structured data, mobile hook, SEO utils)
- Platform portability: Made codebase deployable on multiple platforms (Bolt.new, Vercel, Netlify)
- Removed orphan files: Cleaned up unused components, hooks, and assets
- Added deployment documentation and environment configuration examples

# User Preferences

Preferred communication style: Simple, everyday language.
Brand name: "Siwaht" (not "SiwahtAI")
Business model: Professional AI agency providing custom video, avatar, and audio services (not a self-service tool)

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development.
- **Styling**: Tailwind CSS with shadcn/ui component library built on Radix UI primitives. Consistent color schemes, typography, and spacing are maintained.
- **State Management**: TanStack React Query for server state and React Hook Form for form management.
- **Routing**: Wouter for lightweight client-side routing.
- **UI/UX Decisions**: Mobile-first responsive design targeting standard breakpoints (320px, 768px, 1024px, 1440px), interactive service previews, smooth scrolling, and optimized touch interactions. Semantic HTML structure and ARIA accessibility are prioritized.

## Backend Architecture
- **Runtime**: Node.js with Express.js framework.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful endpoints with JSON communication.
- **Request Handling**: Express middleware for JSON parsing and URL encoding.
- **Error Handling**: Centralized error handling middleware provides structured error responses.

## Data Storage Solutions
- **Development Storage**: In-memory storage for development and testing.
- **Production Storage**: Neon serverless PostgreSQL (used for session storage in previous iterations, currently focused on static in-memory data for public-facing content).
- **Media Management**: A JSON-based configuration system (`public/media-config.json`) allows for centralized management and dynamic loading of media assets. All media is web-optimized (H.264 for video, MP3 for audio) with automated conversion scripts and stored in `/optimized/` directories.

## Authentication and Authorization
- **Current State**: No authentication or authorization system is currently implemented as the focus is on public-facing content.

## API Structure
- **Contact Form**: POST `/api/contact` for form submissions with Zod validation.
- **Validation**: Zod schemas are used for request/response validation.
- **Response Format**: Consistent JSON responses indicate success or error status.

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form with Zod resolvers.
- **Backend**: Express.js.
- **Build Tools**: Vite.

## UI and Design System
- **Component Library**: Radix UI primitives via shadcn/ui.
- **Styling**: Tailwind CSS.
- **Icons**: Lucide React.

## Utility Libraries
- **Validation**: Zod for runtime type validation.
- **Query Management**: TanStack React Query.
- **AI Integration**: ElevenLabs ConvAI widget for interactive voice chat.
- **Webhook Integration**: Make.com for contact form submissions.
## Logo Integration (January 2025)
- Added custom Siwaht branding logo to navigation bar and footer
- Replaced generic Zap icons with the official Siwaht logo (purple gradient design)
- Logo stored at /public/logo.png for easy future replacement
- Logo displays at appropriate sizes: 40x40px in navigation, 48x48px in footer
