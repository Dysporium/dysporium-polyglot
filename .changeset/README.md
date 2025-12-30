# Changesets

This project uses [Changesets](https://github.com/changesets/changesets) for version management and releases.

## Release Workflow

### 1. Create a Changeset (after making changes)

```bash
pnpm changeset
```

- Select the package(s) affected
- Choose version bump type:
  - `patch` - Bug fixes (0.0.X)
  - `minor` - New features (0.X.0)
  - `major` - Breaking changes (X.0.0)
- Write a summary of changes

### 2. Bump Versions (when ready to release)

```bash
pnpm version
```

This will:
- Consume all pending changesets
- Update `package.json` versions
- Generate/update `CHANGELOG.md`

### 3. Publish to npm

```bash
pnpm release
```

This will:
- Build all packages
- Publish to npm registry

## Quick Commands

| Command | Description |
|---------|-------------|
| `pnpm changeset` | Create a new changeset |
| `pnpm changeset status` | Check pending changesets |
| `pnpm version` | Bump versions from changesets |
| `pnpm release` | Build and publish |

## Tips

- Create one changeset per logical change
- Multiple changesets can be combined in one release
- Changesets are stored in `.changeset/` as markdown files
- Delete a changeset file to remove it before versioning
