# AI Toolkit - Deployment & Publishing Setup

This repository is now fully configured for publishing to npm with automated CI/CD workflows.

## 📦 Packages Ready to Publish

- `@ai-toolkit/core` - Core agent orchestration
- `@ai-toolkit/cache` - Universal caching for AI tools
- `@ai-toolkit/memory` - Persistent memory for agents
- `@ai-toolkit/guardrails` - Safety checks and guardrails
- `@ai-toolkit/react` - React hooks and components

## ✅ Setup Complete

### What's Been Configured:

1. **GitHub Actions Workflows**
   - [.github/workflows/ci.yml](.github/workflows/ci.yml) - Continuous Integration
   - [.github/workflows/publish.yml](.github/workflows/publish.yml) - Automated Publishing

2. **Changesets for Version Management**
   - Installed `@changesets/cli`
   - Configuration in [.changeset/config.json](.changeset/config.json)
   - Scripts added to root package.json

3. **Package Configuration**
   - All packages have `publishConfig: { access: "public" }`
   - Proper exports, main, and types fields
   - Build system configured with tsup

4. **Build System Fixed**
   - All TypeScript errors resolved
   - All packages build successfully
   - Type declarations generated correctly

## 🚀 Quick Start Publishing

### First Time Setup

1. **Update Repository URL** (IMPORTANT!)

   Edit `package.json` line 22:
   ```json
   "url": "https://github.com/YOUR_USERNAME/ai-toolkit.git"
   ```

2. **Get npm Token**
   ```bash
   # Login to npm
   npm login

   # Or create automation token at:
   # https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   ```

3. **Add NPM_TOKEN to GitHub Secrets**
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Create new secret: `NPM_TOKEN`
   - Paste your npm automation token

### Publishing Workflow

#### Automated (Recommended)

```bash
# 1. Make changes to code

# 2. Create a changeset
pnpm changeset

# 3. Commit and push
git add .
git commit -m "feat: your feature"
git push

# 4. GitHub Actions will create a Release PR
# 5. Merge the Release PR → Packages automatically publish!
```

#### Manual

```bash
# Build and test
pnpm build
pnpm type-check
pnpm test

# Create changeset and version
pnpm changeset
pnpm version

# Publish
pnpm release
```

## 📚 Documentation

- **Quick Start**: [QUICK_START_PUBLISHING.md](QUICK_START_PUBLISHING.md)
- **Full Guide**: [PUBLISHING.md](PUBLISHING.md)

## 🔧 Available Scripts

```bash
pnpm build              # Build all packages
pnpm type-check         # Type check all packages
pnpm test               # Run tests
pnpm changeset          # Create a changeset
pnpm version            # Apply changesets and bump versions
pnpm release            # Build and publish to npm
```

## 📋 Pre-Publish Checklist

Before your first publish:

- [ ] Update repository URL in package.json
- [ ] Add NPM_TOKEN to GitHub Secrets
- [ ] Verify package names are available on npm (or use your own scope)
- [ ] Run `pnpm build` successfully
- [ ] Run `pnpm type-check` successfully
- [ ] Update README files in each package
- [ ] Add license file if needed

## 🎯 Package Names

Current package names use the `@ai-toolkit` scope. Options:

1. **Keep @ai-toolkit scope** (if available on npm)
2. **Use your own scope**: Change to `@your-username/` in all package.json files
3. **Unscoped packages**: Remove `@ai-toolkit/` prefix (e.g., `ai-toolkit-core`)

## 🔗 After Publishing

Your packages will be available at:

```bash
npm install @ai-toolkit/core
npm install @ai-toolkit/cache
npm install @ai-toolkit/memory
npm install @ai-toolkit/guardrails
npm install @ai-toolkit/react
```

View on npm: `https://www.npmjs.com/package/@ai-toolkit/PACKAGE_NAME`

## 🐛 Troubleshooting

**Package name already exists:**
- Change scope in package names or use unscoped names

**Authentication failed:**
- Verify NPM_TOKEN in GitHub Secrets
- Ensure token has publish permissions

**Build fails:**
- Run `pnpm build` locally to debug
- Check TypeScript errors with `pnpm type-check`

## 🎉 Success!

Your monorepo is ready to publish. The automated workflow will:

1. ✅ Run tests and type checks on every PR
2. ✅ Create release PRs when changesets exist
3. ✅ Automatically publish to npm when release PRs merge
4. ✅ Update CHANGELOGs automatically
5. ✅ Handle version bumps correctly

Happy publishing! 🚀
