# Build and Publish Guide

This document explains how to build, test, and publish the React Infinite Windowed Loader package.

## 📁 Package Structure

```
react-infinite-windowed-loader/
├── src/
│   ├── InfiniteLoader.tsx    # Main component
│   ├── InfiniteLoader.css    # Component styles
│   └── index.ts              # Package exports
├── lib/                      # Built output (generated)
├── package.json              # Package configuration
├── tsconfig.json            # TypeScript configuration
├── rollup.config.js         # Build configuration
├── README.md                # Package documentation
├── LICENSE                  # MIT license
├── example.tsx              # Usage example
└── BUILD.md                 # This file
```

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Package

```bash
# Clean build
npm run build

# Watch mode for development
npm run build:watch
```

### 3. Type Checking

```bash
npm run typecheck
```

### 4. Lint Code

```bash
npm run lint
```

## 🚀 Publishing to NPM

### 1. Update Package Version

```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)  
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major
```

### 2. Build Package

```bash
npm run build
```

### 3. Test Local Package

You can test the package locally before publishing:

```bash
# Create a tarball
npm pack

# This creates react-infinite-windowed-loader-1.0.0.tgz
# You can install this in another project:
# npm install /path/to/react-infinite-windowed-loader-1.0.0.tgz
```

### 4. Publish to NPM

```bash
# Login to NPM (if not already logged in)
npm login

# Publish the package
npm publish

# For scoped packages:
# npm publish --access public
```

## 🔧 Build Configuration

### Rollup Configuration

The package uses Rollup to create optimized bundles:

- **CommonJS** (`lib/cjs/`) - For Node.js environments
- **ES Modules** (`lib/esm/`) - For modern bundlers
- **TypeScript Definitions** (`lib/index.d.ts`) - Type declarations

### Output Structure

After building, the `lib/` directory contains:

```
lib/
├── cjs/
│   ├── index.js
│   └── index.js.map
├── esm/
│   ├── index.js
│   └── index.js.map
└── index.d.ts
```

## 📝 Package.json Fields

Key fields for npm publication:

```json
{
  "main": "lib/cjs/index.js",          // CommonJS entry
  "module": "lib/esm/index.js",        // ES modules entry
  "types": "lib/index.d.ts",           // TypeScript definitions
  "files": ["lib/**/*", "README.md"],  // Files to include
  "sideEffects": false                  // Safe for tree shaking
}
```

## ✅ Pre-publish Checklist

Before publishing, ensure:

- [ ] All tests pass
- [ ] TypeScript compiles without errors
- [ ] Package builds successfully (`npm run build`)
- [ ] README is up to date
- [ ] Version number is updated
- [ ] All files are included in `package.json` files array
- [ ] License is included
- [ ] Repository URL is correct

## 🔍 Testing the Package

### Local Testing

1. Build the package: `npm run build`
2. Create a test React project
3. Install the local package: `npm install /path/to/react-infinite-windowed-loader`
4. Import and test the component

### Example Usage Test

```tsx
import { InfiniteLoader } from 'react-infinite-windowed-loader';

function TestApp() {
  const generateItem = (index: number) => ({
    id: index,
    content: <div>Test Item {index + 1}</div>
  });

  return (
    <InfiniteLoader
      generateItem={generateItem}
      height={400}
      showDebug={true}
    />
  );
}
```

## 📊 Bundle Analysis

To analyze the bundle size:

```bash
# Install bundle analyzer
npm install -g bundlephobia

# Check bundle size
bundlephobia react-infinite-windowed-loader@latest
```

## 🔄 Update Process

To update the package:

1. Make changes to source files
2. Update version in `package.json`
3. Update `README.md` if needed
4. Run `npm run build`
5. Run `npm publish`

## 🆘 Troubleshooting

### Build Errors

- **TypeScript errors**: Check `tsconfig.json` and fix type issues
- **Import errors**: Ensure all imports use correct paths
- **CSS not found**: Verify CSS import paths in the component

### Publish Errors

- **Authentication**: Run `npm login` and verify credentials
- **Permissions**: Ensure you have publish rights to the package name
- **Version conflicts**: Package version must be higher than published version

### Peer Dependency Issues

The package uses peer dependencies for React:

```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
```

Users need to install these separately in their projects.

## 📈 Version Strategy

Follow semantic versioning (SemVer):

- **Patch** (1.0.x): Bug fixes, no breaking changes
- **Minor** (1.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes

## 🎯 Next Steps

After successful publication:

1. Test installation in different React projects
2. Gather user feedback
3. Add unit tests
4. Set up CI/CD pipeline
5. Add Storybook for component documentation
6. Consider adding more features based on feedback
