# DesignHandoff

<img width="2053" height="638" alt="Screenshot 2025-07-16 at 15 32 21" src="https://github.com/user-attachments/assets/b4d2af48-ffde-4009-90ca-61a3db6c5353" />

[![Live Demo]](https://designhandoff.vercel.app/)

## About

DesignHandoff is a comprehensive collaborative platform that bridges the gap between designers and developers, streamlining the handoff process for digital products. Built with modern technologies and real-time collaboration features, it solves the common pain points in design-to-development workflows.

**Problem Solved:** Eliminates the tedious back-and-forth between designers and developers by automating specification extraction and enabling real-time collaboration.

## Key Features

### **Design Management**

- **Project Organization** - Create, manage, and organize design projects
- **File Upload & Visualization** - Support for multiple design file formats
- **Smart File Organization** - Categories, folders, and tagging system
- **Advanced Search & Filtering** - Find files and projects quickly

### **Developer Tools**

- **Automated Spec Extraction** - Color palettes, typography, measurements
- **Asset Extraction** - One-click asset export in multiple formats (PNG, SVG, WebP)
- **CSS Code Generation** - Automatic CSS properties from design specs
- **Measurement Tools** - Interactive rulers and spacing guides

### **Team Collaboration**

- **Secure Authentication** - GitHub/Google OAuth integration
- **Team Management** - Invite members, assign roles, manage permissions
- **Real-time Comments** - Live collaborative feedback with instant updates
- **Email Notifications** - Team invitations and project updates
- **Live Collaboration** - Real-time updates across all team members

### **User Experience**

- **Dark/Light Mode** - Professional theme switching
- **Responsive Design** - Works seamlessly on all devices
- **Loading States** - Professional skeleton loading and micro-interactions
- **Modern UI** - Built with RetroUI component library

## Tech Stack

### **Frontend**

- **Framework**: [Next.js 15.3.2](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [RetroUI.dev](https://retroui.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)

### **Backend & Database**

- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Real-time + Auth + Storage)
- **Authentication**: OAuth (GitHub, Google) + Email/Password
- **Real-time**: WebSocket subscriptions for live collaboration
- **Storage**: Supabase Storage for file management
- **Security**: Row Level Security (RLS) policies

### **Development & Deployment**

- **Package Manager**: [pnpm](https://pnpm.io/)
- **Linting**: [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Performance**: [Vercel Speed Insights](https://vercel.com/docs/speed-insights)

## **Live Demo**

**[View Live Application](https://designhandoff.vercel.app)**

### Demo Features to Explore:

- Create a project and upload design files
- Explore the design spec extraction tools
- Test real-time collaboration features
- Try the asset extraction interface
- Switch between light and dark themes

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/designhandoff.git
cd designhandoff
```

2. Install dependencies

```bash
pnpm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your Supabase credentials.

4. Run the development server

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project is configured for easy deployment on Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fdesignhandoff)

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site URL for OAuth callbacks
# For local development: http://localhost:3000
# For production: https://yourdomain.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## OAuth Provider Setup

For OAuth authentication to work correctly:

1. **GitHub OAuth App**:

   - Authorization callback URL: `your_domain/auth/callback`
   - For local: `http://localhost:3000/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`

2. **Google OAuth App**:
   - Authorized redirect URIs: `your_domain/auth/callback`
   - For local: `http://localhost:3000/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`

## Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

When deploying to production:

1. Update `NEXT_PUBLIC_SITE_URL` in your production environment variables
2. Update OAuth callback URLs in your GitHub and Google OAuth apps
3. Deploy your application

The auth system will automatically use the correct callback URLs based on the environment.


## **Screenshots**

<img width="2053" height="1093" alt="Screenshot 2025-07-16 at 15 17 44" src="https://github.com/user-attachments/assets/e11896c2-2096-4af8-aee2-abc1fa6d27a8" />
<img width="2053" height="1093" alt="Screenshot 2025-07-16 at 15 15 43" src="https://github.com/user-attachments/assets/85a1fb07-22a2-4614-b97d-b57a79f822d1" />
<img width="2053" height="1093" alt="Screenshot 2025-07-16 at 15 25 21" src="https://github.com/user-attachments/assets/f1609b69-60a2-4665-928f-e5a0bc714d5f" />
<img width="2053" height="1093" alt="Screenshot 2025-07-16 at 15 18 11" src="https://github.com/user-attachments/assets/caf15f32-d601-4840-a617-edd4658da207" />
<img width="2053" height="1093" alt="Screenshot 2025-07-16 at 15 17 58" src="https://github.com/user-attachments/assets/7464819b-a698-4321-a787-4c0ae6556c39" />
<img width="2053" height="1093" alt="Screenshot 2025-07-16 at 15 15 22" src="https://github.com/user-attachments/assets/b5310a83-9571-45da-9a06-f8a2b3ca4b07" />
<img width="2053" height="1093" alt="Screenshot 2025-07-16 at 15 15 15" src="https://github.com/user-attachments/assets/ca3a3012-e083-4fa0-9e92-f6032a60b233" />

