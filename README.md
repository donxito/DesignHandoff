# DesignHandoff

A modern platform that bridges the gap between designers and developers, streamlining the handoff process for digital products.

<!-- ![DesignHandoff Banner](https://placehold.co/1200x300/e5e7eb/a3a3a3?text=DesignHandoff+Platform) -->

STILL WORK IN PROGRESS

## 🚀 About

DesignHandoff is a collaborative platform that streamlines the transition from design to development. It enables designers to upload and manage design files, while providing developers with detailed specifications, assets, and code snippets.

## ✨ Features

- 🔐 Secure authentication system
- 📂 Project organization and management
- 🎨 Design file upload and visualization
- 📏 Spec inspection for developers
- 🖼️ Asset extraction and download
- 🌓 Light/Dark mode support
- 📱 Responsive design

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **UI Components**: [RetroUI.dev](https://retroui.dev/)
- **Theme Switching**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Performance**: [Vercel Speed Insights](https://vercel.com/docs/speed-insights)

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
