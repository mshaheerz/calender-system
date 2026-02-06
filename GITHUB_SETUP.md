# GitHub Setup Guide

This guide will help you set up this project as an open-source repository on GitHub.

## Initial Setup

### 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `gantt-timeline`
3. Choose to add a README (optional, we already have one)
4. Choose a license (MIT is recommended)

### 2. Configure Local Repository

```bash
# Initialize git if not already done
git init

# Add GitHub remote
git remote add origin https://github.com/yourusername/gantt-timeline.git

# Create and switch to main branch
git branch -M main

# Stage all files
git add .

# Create initial commit
git commit -m "Initial commit: Gantt timeline component library"

# Push to GitHub
git push -u origin main
```

## Repository Structure

```
gantt-timeline/
├── components/gantt/          # React components
├── lib/gantt/                 # Core utilities and types
├── app/
│   ├── page.tsx              # Landing page
│   ├── playground/           # Interactive demo
│   ├── docs/                 # Documentation
│   └── examples/             # Code examples
├── README.md                 # Project overview
├── CONTRIBUTING.md           # Contribution guidelines
├── CHANGELOG.md              # Version history
└── package.json              # Dependencies
```

## Configuration Files to Add

### .gitignore
```
node_modules/
.env.local
.env.*.local
.next/
dist/
build/
.DS_Store
*.log
```

### .github/CONTRIBUTING.md
```markdown
# Contributing

We love your input! We want to make contributing to Gantt Timeline as easy and transparent as possible.

## Development Process

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Pull Request Process

1. Update the README.md with details of changes
2. Update the version numbers following [SemVer](https://semver.org/)
3. Add a summary of your changes to CHANGELOG.md
4. Request review from maintainers

## Code of Conduct

Be respectful and inclusive. We're all here to build something great together.
```

## GitHub Actions (CI/CD)

Create `.github/workflows/tests.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - run: npm ci
    - run: npm run build
    - run: npm run lint
```

## Publishing to npm

### 1. Create npm Account

- Go to [npm](https://www.npmjs.com/signup)
- Create an account and verify your email

### 2. Prepare Package

Update `package.json`:

```json
{
  "name": "@yourusername/gantt-timeline",
  "version": "1.0.0",
  "description": "Interactive Gantt timeline component library",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "components",
    "lib",
    "dist"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/gantt-timeline.git"
  },
  "keywords": [
    "gantt",
    "timeline",
    "scheduling",
    "react",
    "components",
    "drag-and-drop"
  ],
  "author": "Your Name",
  "license": "MIT"
}
```

### 3. Build and Publish

```bash
# Build the package
npm run build

# Login to npm
npm login

# Publish to npm
npm publish
```

## Repository Topics

Add these topics to your GitHub repository for better discoverability:

- `react`
- `typescript`
- `gantt-chart`
- `timeline`
- `scheduling`
- `drag-and-drop`
- `component-library`
- `tailwindcss`

## README Badge Examples

Add these badges to your README.md:

```markdown
[![npm version](https://img.shields.io/npm/v/@yourusername/gantt-timeline.svg)](https://www.npmjs.com/package/@yourusername/gantt-timeline)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://github.com/yourusername/gantt-timeline/workflows/tests/badge.svg)](https://github.com/yourusername/gantt-timeline/actions)
```

## License File

Create a `LICENSE` file with MIT license text:

```
MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

## Release Process

### Creating a Release

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit changes: `git commit -m "Release v1.0.0"`
4. Tag release: `git tag v1.0.0`
5. Push: `git push origin main && git push origin --tags`
6. Create GitHub Release with release notes
7. Publish to npm: `npm publish`

## Community

### Discussions

Enable GitHub Discussions:
1. Go to repository Settings
2. Enable "Discussions"
3. Create discussion categories:
   - Announcements
   - General
   - Q&A
   - Show and tell

### Issue Templates

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
# Bug Report

## Description
Brief description of the bug

## Steps to Reproduce
1. Step one
2. Step two

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- React version: 
- Component library version:
- Browser/OS:
```

## Useful Links

- [GitHub Guides](https://guides.github.com/)
- [npm Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [MIT License](https://opensource.org/licenses/MIT)

## Support

For questions about GitHub setup, refer to:
- [GitHub Help](https://help.github.com)
- [npm Help](https://docs.npmjs.com/)
- Community discussions in the repository
