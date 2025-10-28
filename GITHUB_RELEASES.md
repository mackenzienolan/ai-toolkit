# GitHub Releases Setup

Your repository is configured to automatically create GitHub Releases when packages are published.

## Two Workflows for Releases

### 1. Changesets Automatic Releases (Enabled)

The [publish.yml](.github/workflows/publish.yml) workflow includes `createGithubReleases: true`, which means:

- ✅ When you merge a release PR, GitHub Releases are **automatically created**
- ✅ One release per package that was published
- ✅ Release notes include the changeset descriptions
- ✅ Tagged with the package version (e.g., `@ai-toolkit/core@1.0.0`)

**No extra work needed!** This happens automatically when you publish via changesets.

### 2. Enhanced Release Workflow (Optional)

The [release.yml](.github/workflows/release.yml) workflow provides more detailed releases:

- Triggered when you create git tags manually
- Includes installation instructions
- Links to npm package page
- Can be customized with additional release assets

**Usage:**
```bash
# Create a tag for a specific package version
git tag @ai-toolkit/core@1.0.0
git push origin @ai-toolkit/core@1.0.0
```

## What Gets Created

When a package is published, you'll see:

### In GitHub Releases:
- **Tag**: `@ai-toolkit/core@1.0.0`
- **Title**: `@ai-toolkit/core@1.0.0`
- **Release Notes**: Changes from the changeset
- **Assets**: None by default (can be added)

### Example Release:

```markdown
# @ai-toolkit/core@1.0.0

## Changes
- Add support for async tools
- Fix handoff context passing
- Update type definitions

## Installation
npm install @ai-toolkit/core@1.0.0

## npm Package
https://www.npmjs.com/package/@ai-toolkit/core/v/1.0.0
```

## Viewing Releases

After publishing, view your releases at:
- `https://github.com/YOUR_USERNAME/ai-toolkit/releases`

## Customizing Releases

### Add Release Assets

Edit [publish.yml](.github/workflows/publish.yml) to include build artifacts:

```yaml
- name: Create Release Pull Request or Publish
  id: changesets
  uses: changesets/action@v1
  with:
    publish: pnpm release
    createGithubReleases: true

# Add after the changesets step:
- name: Upload Release Assets
  if: steps.changesets.outputs.published == 'true'
  run: |
    # Your custom asset upload logic here
```

### Customize Release Notes

The release notes come from your changeset descriptions. To improve them:

1. Write detailed changeset descriptions:
   ```bash
   pnpm changeset
   # When prompted, write a good summary:
   # "Add support for streaming responses with proper error handling"
   ```

2. Release notes will include these descriptions automatically

### Pre-release Versions

For beta/alpha releases, the workflow automatically marks them as pre-releases:

```bash
# This will be marked as a pre-release
pnpm changeset pre enter beta
pnpm changeset
pnpm version
# Push and merge PR
```

## Monorepo Release Strategy

Since this is a monorepo with multiple packages, you'll get:

- **Separate releases** for each package
- **Independent versioning** per package
- **Individual changelogs** per package

Example after publishing 3 packages:
- `@ai-toolkit/core@1.2.0`
- `@ai-toolkit/cache@1.1.0`
- `@ai-toolkit/guardrails@1.0.1`

Each gets its own GitHub Release!

## Troubleshooting

### Releases Not Created

1. **Check permissions**: Workflow has `contents: write` permission ✅
2. **Verify GITHUB_TOKEN**: Should be automatically provided ✅
3. **Check tags**: Releases are created when tags are pushed

### Missing Release Notes

- Release notes come from changeset descriptions
- Make sure you write good descriptions when creating changesets
- To update: Edit the changeset file in `.changeset/` before merging

### Tag Format

Tags follow this format:
- `@ai-toolkit/PACKAGE@VERSION`
- Example: `@ai-toolkit/core@1.0.0`

This allows multiple packages to have independent versions.

## Best Practices

1. **Write good changeset descriptions** - They become your release notes
2. **Use semantic versioning** - major.minor.patch
3. **Keep changelogs updated** - Changesets does this automatically
4. **Test before releasing** - CI runs tests before publishing
5. **Review release PRs** - Double-check versions before merging

## Comparison: npm vs GitHub Releases

| Feature | npm Registry | GitHub Releases |
|---------|--------------|-----------------|
| Package downloads | ✅ Yes | ❌ No |
| Installation | ✅ `npm install` | ❌ N/A |
| Version history | ✅ Yes | ✅ Yes |
| Release notes | ⚠️ README only | ✅ Full notes |
| Source code | ⚠️ Packaged | ✅ Full repo |
| Downloads count | ✅ Yes | ⚠️ Limited |
| Community standard | ✅ Primary | ⚠️ Secondary |

**Both are created automatically!** Users get:
- npm for easy installation
- GitHub Releases for readable notes and source

## Next Steps

Your setup is complete! When you publish:

1. Merge the release PR created by changesets
2. Packages publish to npm ✅
3. GitHub Releases are created automatically ✅
4. Users can view releases at your GitHub repo
5. Users can install from npm

No additional configuration needed! 🎉
