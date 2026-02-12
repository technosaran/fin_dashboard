# Contributing to FINCORE

Thank you for your interest in contributing to FINCORE! This guide will help you get started.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/fin_dashboard.git
   cd fin_dashboard
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Set up** environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials in `.env.local`.

5. **Run** the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Run linting and tests:
   ```bash
   npm run lint
   npm test
   ```
4. Commit your changes with a descriptive message
5. Push to your fork and open a Pull Request

## Code Standards

- **TypeScript**: All code must be strictly typed. Avoid `any`.
- **ESLint**: All code must pass `npm run lint` with zero errors.
- **Formatting**: Use Prettier for consistent formatting (`npm run format`).
- **Components**: Place reusable components in `app/components/`.
- **Utilities**: Place shared logic in `lib/utils/`, hooks in `lib/hooks/`, services in `lib/services/`.
- **Types**: Define shared types in `lib/types/index.ts`.

## Project Structure

```
app/                  # Next.js App Router pages and components
├── components/       # Shared React components
├── api/              # API route handlers
├── [feature]/        # Feature-specific pages
lib/                  # Shared libraries
├── config/           # Environment and app configuration
├── hooks/            # Custom React hooks
├── services/         # External service integrations
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── validators/       # Input validation
```

## Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Include steps to reproduce for bugs
- Include screenshots for UI issues

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
