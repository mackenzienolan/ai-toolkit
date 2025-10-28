# Quick Start: Publishing to npm

## One-Time Setup

### 1. Get Your npm Token
```bash
# Login to npm
npm login

# Generate an automation token at https://www.npmjs.com/settings/YOUR_USERNAME/tokens
# Token type: "Automation" (for CI/CD)
```

### 2. Add Token to GitHub
1. Go to your GitHub repo: `https://github.com/YOUR_USERNAME/ai-toolkit`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click **Add secret**

### 3. Update Repository URL
Edit [package.json](package.json) line 22:
```json
"url": "https://github.com/YOUR_ACTUAL_USERNAME/ai-toolkit.git"
```

## Publishing Your First Version

### Option 1: Automated (Recommended)

1. **Make changes and create a changeset:**
   ```bash
   # After making code changes
   pnpm changeset
   ```
   - Select which packages changed (use spacebar)
   - Choose version bump type (patch/minor/major)
   - Write description of changes

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push
   ```

3. **Merge the Release PR:**
   - GitHub Actions will create a PR called "chore: release packages"
   - Review the PR
   - Merge it
   - Packages will automatically publish to npm!

### Option 2: Manual

```bash
# Build everything
pnpm build

# Create and apply versions
pnpm changeset
pnpm version

# Publish
pnpm release
```

## Common Commands

```bash
# Create a changeset
pnpm changeset

# Preview what will be published (dry run)
pnpm -r publish --dry-run

# Check current package versions
pnpm list --depth=0

# Test before publishing
pnpm build && pnpm type-check && pnpm test
```

## After Publishing

Your packages will be available at:
- `npm install @ai-toolkit/core`
- `npm install @ai-toolkit/cache`
- `npm install @ai-toolkit/memory`
- `npm install @ai-toolkit/guardrails`
- `npm install @ai-toolkit/react`

View on npm:
- https://www.npmjs.com/package/@ai-toolkit/core
- https://www.npmjs.com/package/@ai-toolkit/cache
- etc.

## Troubleshooting

**"Package name already taken":**
- Change the scope in package.json names from `@ai-toolkit/` to `@your-username/`

**"Authentication failed":**
- Verify NPM_TOKEN in GitHub secrets
- Make sure token has "Automation" type with publish permissions

**"Version already published":**
- Run `pnpm changeset` to bump the version
- Run `pnpm version` to apply the version bump

## Need More Help?

See the full [PUBLISHING.md](PUBLISHING.md) guide for detailed instructions.
