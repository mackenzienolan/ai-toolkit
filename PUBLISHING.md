# Publishing Guide

This guide covers how to publish packages from this monorepo to npm.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com)
2. **npm Access Token**: Generate a token with publish permissions
3. **GitHub Secrets**: Add `NPM_TOKEN` to your repository secrets

## Initial Setup

### 1. Update Repository URL

Update the repository URL in the root [package.json](package.json):

```json
"repository": {
  "type": "git",
  "url": "https://github.com/YOUR_USERNAME/ai-toolkit.git"
}
```

### 2. Set Up npm Organization (Optional)

If you want to publish under an npm organization (e.g., `@your-org/package-name`):

1. Create an organization on npm
2. Update each package.json name:
   ```json
   "name": "@your-org/core"
   ```

### 3. Add NPM_TOKEN to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Your npm access token (from npmjs.com → Access Tokens)

## Publishing Workflow

### Automated Publishing (Recommended)

This repo uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

#### Step 1: Create a Changeset

When you make changes that should be published:

```bash
pnpm changeset
```

This will prompt you to:
1. Select which packages changed
2. Choose the semver bump type (major, minor, patch)
3. Write a summary of changes

This creates a changeset file in `.changeset/`.

#### Step 2: Commit and Push

```bash
git add .
git commit -m "feat: add new feature"
git push
```

#### Step 3: Merge the Release PR

The GitHub Action will automatically:
1. Create a "Release" pull request that bumps versions
2. Update CHANGELOGs
3. When you merge this PR, it will automatically publish to npm

### Manual Publishing

If you need to publish manually:

#### 1. Login to npm

```bash
npm login
# or
pnpm login
```

#### 2. Version Packages

```bash
# Consume all changesets and update versions
pnpm version
```

#### 3. Build and Publish

```bash
# Build, test, and publish all packages
pnpm release
```

Or publish individually:

```bash
cd packages/core
pnpm build
pnpm publish --access public
```

## Version Management

### Semantic Versioning

- **Major (1.0.0)**: Breaking changes
- **Minor (0.1.0)**: New features, backwards compatible
- **Patch (0.0.1)**: Bug fixes

### Pre-release Versions

For beta releases:

```bash
pnpm changeset pre enter beta
pnpm changeset
pnpm version
pnpm release
pnpm changeset pre exit
```

## Package Configuration

Each package should have proper configuration in its `package.json`:

```json
{
  "name": "@ai-toolkit/core",
  "version": "0.1.0",
  "description": "Core agent orchestration",
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "publishConfig": {
    "access": "public"
  }
}
```

## CI/CD Workflow

### Continuous Integration ([.github/workflows/ci.yml](.github/workflows/ci.yml))

Runs on every push and PR:
- Installs dependencies
- Builds packages
- Runs type checking
- Runs tests
- Runs linting

### Publish Workflow ([.github/workflows/publish.yml](.github/workflows/publish.yml))

Runs on push to main:
- Checks for changesets
- Creates/updates release PR
- Publishes to npm when release PR is merged

## Troubleshooting

### "Package already exists"

If you get an error that the package already exists:
1. Check if someone else has published a package with that name
2. Change your package name or use an npm organization scope

### "Authentication failed"

1. Verify your `NPM_TOKEN` is correct
2. Ensure the token has publish permissions
3. Check that the token hasn't expired

### "No permission to publish"

1. For scoped packages (`@org/name`), ensure your npm organization allows your account to publish
2. Add `"publishConfig": { "access": "public" }` to package.json

### Version Not Incrementing

1. Make sure you've created a changeset: `pnpm changeset`
2. Commit the changeset file
3. Run `pnpm version` to consume changesets

## Best Practices

1. **Always create changesets** for changes that should trigger a release
2. **Test locally** before publishing: `pnpm build && pnpm test`
3. **Use semantic versioning** appropriately
4. **Document breaking changes** clearly in changeset descriptions
5. **Keep CHANGELOGs** up to date (automated with changesets)
6. **Test in a real project** before publishing major versions

## Quick Reference

```bash
# Create a changeset
pnpm changeset

# Check what will be published (dry run)
pnpm -r publish --dry-run

# Publish manually (after building)
pnpm release

# Publish a specific package
cd packages/core
pnpm publish --access public

# View current versions
pnpm list --depth=0
```

## Package URLs

After publishing, your packages will be available at:
- npm: `https://www.npmjs.com/package/@ai-toolkit/core`
- Install: `npm install @ai-toolkit/core`

## Support

For issues with publishing:
- [Changesets Documentation](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)
- [pnpm Publishing](https://pnpm.io/cli/publish)
- [npm Documentation](https://docs.npmjs.com/cli/v9/commands/npm-publish)
