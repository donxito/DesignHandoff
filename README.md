# DesignHandoff

<img width="2053" height="638" alt="Screenshot 2025-07-16 at 15 32 21" src="https://github.com/user-attachments/assets/b4d2af48-ffde-4009-90ca-61a3db6c5353" />

<!-- Add badges -->

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge&logo=vercel)](https://your-deployed-url.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase)](https://supabase.com/)

## 🚀 About

DesignHandoff is a comprehensive collaborative platform that bridges the gap between designers and developers, streamlining the handoff process for digital products. Built with modern technologies and real-time collaboration features, it solves the common pain points in design-to-development workflows.

**🎯 Problem Solved:** Eliminates the tedious back-and-forth between designers and developers by automating specification extraction and enabling real-time collaboration.

## ✨ Key Features

### 🎨 **Design Management**

- 📂 **Project Organization** - Create, manage, and organize design projects
- 🎨 **File Upload & Visualization** - Support for multiple design file formats
- 📁 **Smart File Organization** - Categories, folders, and tagging system
- 🔍 **Advanced Search & Filtering** - Find files and projects quickly

### 🛠️ **Developer Tools**

- 📏 **Automated Spec Extraction** - Color palettes, typography, measurements
- 🖼️ **Asset Extraction** - One-click asset export in multiple formats (PNG, SVG, WebP)
- 📋 **CSS Code Generation** - Automatic CSS properties from design specs
- 📐 **Measurement Tools** - Interactive rulers and spacing guides

### 👥 **Team Collaboration**

- 🔐 **Secure Authentication** - GitHub/Google OAuth integration
- 👨‍👩‍👧‍👦 **Team Management** - Invite members, assign roles, manage permissions
- 💬 **Real-time Comments** - Live collaborative feedback with instant updates
- 📧 **Email Notifications** - Team invitations and project updates
- ⚡ **Live Collaboration** - Real-time updates across all team members

### 🎯 **User Experience**

- 🌓 **Dark/Light Mode** - Professional theme switching
- 📱 **Responsive Design** - Works seamlessly on all devices
- ⚡ **Loading States** - Professional skeleton loading and micro-interactions
- 🎨 **Modern UI** - Built with RetroUI component library

## 🛠️ Tech Stack

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

## 🚀 **Live Demo**

🌟 **[View Live Application](https://your-deployed-url.vercel.app)**

### Demo Features to Explore:

- Create a project and upload design files
- Explore the design spec extraction tools
- Test real-time collaboration features
- Try the asset extraction interface
- Switch between light and dark themes

## 🚦 Getting Started

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

## 🙏 Acknowledgments

- [RetroUI.dev](https://retroui.dev/) for the component library
- [Supabase](https://supabase.com/) for the backend service
- [Next.js](https://nextjs.org/) for the framework

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

## 🏗️ **Architecture Highlights**

### **Real-time Collaboration**

- **WebSocket Subscriptions**: Live updates using Supabase real-time subscriptions
- **Optimistic Updates**: Instant UI feedback with background synchronization
- **Conflict Resolution**: Proper handling of concurrent user actions

### **Security & Performance**

- **Row-Level Security**: Database-level authorization with Supabase RLS policies
- **Protected Routes**: Middleware-based authentication guards
- **Image Optimization**: Next.js Image component with proper sizing
- **Bundle Optimization**: Code splitting and lazy loading for optimal performance

### **Modern React Patterns**

- **Server Components**: Leveraging Next.js App Router for optimal performance
- **TypeScript**: Fully typed throughout with strict type checking
- **Component Architecture**: Three-tier design (Pages → Features → UI)
- **State Management**: Zustand for global state, TanStack Query for server state

## 🎯 **What Makes This Project Special**

### **Unique Problem Domain**

Unlike typical portfolio projects, DesignHandoff addresses a **real pain point** in the design-development workflow that every tech team experiences.

### **Technical Depth**

- **Real-time Features**: WebSocket implementation for live collaboration
- **File Processing**: Design specification extraction and asset management
- **Advanced UI**: Professional loading states, theme system, responsive design
- **Production Architecture**: Scalable patterns with proper error handling

### **Professional Polish**

- **User Experience**: Attention to micro-interactions and loading states
- **Design System**: Consistent RetroUI implementation with dark/light modes
- **Performance**: Optimized for Core Web Vitals and mobile experience
- **Accessibility**: WCAG 2.1 AA compliance throughout

## 📊 **Portfolio Impact**

This project demonstrates:

- ✅ **Full-Stack Development** - Frontend, backend, database, authentication
- ✅ **Modern Tech Stack** - Latest Next.js, React, TypeScript patterns
- ✅ **Real-time Features** - Advanced WebSocket implementation
- ✅ **Team Collaboration** - Multi-user systems and permissions
- ✅ **Professional UX** - Production-quality user experience
- ✅ **Problem Solving** - Addresses real-world workflow challenges

## 🤝 **Contributing**

This is a portfolio project, but feedback and suggestions are welcome! Feel free to:

- Open issues for bugs or feature suggestions
- Submit pull requests for improvements
- Share feedback on the user experience

## 📄 **License**

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 **About the Developer**

Built by [Your Name] as a portfolio project to demonstrate modern full-stack development skills. This project showcases:

- Advanced React and Next.js patterns
- Real-time collaboration features
- Production-ready architecture
- Professional UI/UX design

**Connect with me:**

- 🔗 [LinkedIn](https://linkedin.com/in/your-profile)
- 🐙 [GitHub](https://github.com/your-username)
- 🌐 [Portfolio](https://your-portfolio.com)
- 📧 [Email](mailto:your-email@example.com)
