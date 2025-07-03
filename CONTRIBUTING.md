# Contributing to Dify UI Chat

Thank you for your interest in contributing to Dify UI Chat! We welcome contributions from the community and are grateful for your support.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:
1. Check if the issue already exists in our [issue tracker](https://github.com/yourusername/dify-ui-chat/issues)
2. Use the issue templates when available
3. Provide as much detail as possible, including:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots or videos if applicable
   - Environment details (OS, browser, Node.js version)

### Suggesting Features

We love feature suggestions! Please:
1. Check existing feature requests first
2. Open a new issue with the "feature request" label
3. Describe the feature and its use case
4. Explain why it would be valuable to other users

### Code Contributions

#### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/dify-ui-chat.git
   cd dify-ui-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   cp .apps.json.example .apps.json
   # Edit .env with your API keys for testing
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Guidelines

**Code Style**
- Use TypeScript for all new code
- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add comments for complex logic

**Component Guidelines**
- Use functional components with hooks
- Keep components small and focused
- Use proper TypeScript types
- Follow the existing file structure

**Testing**
- Write tests for new features
- Ensure existing tests pass: `npm test`
- Test in multiple browsers if UI changes are involved
- Test with different API providers when applicable

#### Pull Request Process

1. **Before submitting:**
   - Ensure your code follows the style guidelines
   - Run tests: `npm test`
   - Run linting: `npm run lint`
   - Test your changes thoroughly

2. **Create the PR:**
   - Use a clear, descriptive title
   - Fill out the PR template completely
   - Link related issues using keywords (e.g., "Fixes #123")
   - Add screenshots for UI changes

3. **After submission:**
   - Respond to review feedback promptly
   - Make requested changes in new commits
   - Keep the PR updated with the main branch if needed

## 🏗 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/          # Chat API endpoints
│   │   ├── chat-dify/     # Dify-specific endpoints
│   │   └── settings/      # Settings management
│   ├── chat.tsx           # Main chat interface
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   ├── chat-history.tsx  # Chat message components
│   ├── settings-dialog.tsx # Settings management
│   ├── app-selector.tsx  # App selection dropdown
│   └── ...
├── contexts/             # React contexts (auth, language)
├── hooks/               # Custom React hooks
├── lib/                # Utility functions
├── tests/              # Playwright test files
└── types/              # TypeScript type definitions
```

## 🧪 Testing

We use Playwright for end-to-end testing:

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run specific test file
npx playwright test tests/chat-app-selector.spec.js
```

### Writing Tests

- Test files should be in the `tests/` directory
- Use descriptive test names
- Test both happy paths and error cases
- Mock external API calls when appropriate

## 🎨 UI/UX Guidelines

- Follow the existing design patterns
- Ensure accessibility (ARIA labels, keyboard navigation)
- Test on mobile devices
- Maintain consistency with the current theme system
- Use the existing component library (Radix UI + Tailwind)

## 📝 Documentation

When contributing:
- Update README.md if you add new features
- Add JSDoc comments for complex functions
- Update type definitions as needed
- Include examples in your documentation

## 🐛 Debugging

Common debugging steps:
1. Check browser console for errors
2. Verify API keys are correctly configured
3. Check network tab for failed requests
4. Use React Developer Tools for component debugging

## 🔄 Release Process

Releases are handled by maintainers:
1. Version bumping follows semantic versioning
2. Changelog is updated for each release
3. Tags are created for stable releases

## 📞 Getting Help

If you need help:
- Check existing issues and discussions
- Join our community discussions
- Reach out to maintainers

## 🙏 Recognition

Contributors will be:
- Listed in the project's contributors section
- Mentioned in release notes for significant contributions
- Invited to join the maintainer team for consistent contributors

## 📋 Checklist for Contributors

Before submitting a PR, ensure:
- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] New features include tests
- [ ] Documentation is updated
- [ ] PR description is clear and complete
- [ ] Related issues are linked

Thank you for contributing to Dify UI Chat! 🚀
