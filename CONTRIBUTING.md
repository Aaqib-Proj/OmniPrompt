# Contributing to PromptIt

Thank you for your interest in contributing to **PromptIt**! We are building the open platform for the AI prompt engineering community.

## Code of Conduct
Please be respectful, constructive, and inclusive. We welcome contributors of all skill levels.

## Development Workflow

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/PromptIT.git
   cd PromptIT
   ```
3. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npm run prisma:generate
   npm run db:setup
   npm run dev
   ```
4. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## Guidelines
- Follow TypeScript best practices with strict typing.
- For frontend UI changes, use Tailwind CSS utility classes and ensure dark-mode consistency.
- Always run `npm run build` in both `frontend` and `backend` before opening a pull request.
