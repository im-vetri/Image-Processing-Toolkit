# Contributing to Image Processing Toolkit

Thank you for your interest in contributing to the Image Processing Toolkit! We appreciate your help in making this project better. Please follow these guidelines to ensure a smooth contribution process.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Welcome diverse perspectives
- Keep discussions professional

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

### Fork and Clone

1. **Fork the repository**
   - Go to [Image-Processing-Toolkit](https://github.com/Vetri-78640/Image-Processing-Toolkit)
   - Click the "Fork" button in the top right

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/Image-Processing-Toolkit.git
   cd Image-Processing-Toolkit
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Vetri-78640/Image-Processing-Toolkit.git
   ```

### Setup Development Environment

```bash
# Install dependencies
npm install

# Verify setup
npm test
npm run lint
```

## How to Contribute

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/add-new-filter` - For new features
- `fix/bug-description` - For bug fixes
- `docs/update-readme` - For documentation
- `refactor/improve-performance` - For code improvements
- `test/add-tests` - For test improvements

### 2. Make Your Changes

- Write clean, readable code following the existing style
- Add JSDoc comments for all functions
- Include error handling
- Test your changes thoroughly

**Code Style Guide:**

```javascript
/**
 * Applies a filter to an image
 * @param {Uint8ClampedArray} pixels - Image pixel data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Uint8ClampedArray} Filtered pixel data
 * @throws {Error} If parameters are invalid
 */
export function applyFilter(pixels, width, height) {
  if (!pixels || width <= 0 || height <= 0) {
    throw new Error('Invalid parameters');
  }
  // Implementation
}
```

### 3. Run Tests

Before committing, make sure all tests pass:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm test -- --watch
```

**Coverage Requirements:**
- Minimum 85% code coverage
- All new features must have comprehensive tests
- Include edge cases and error scenarios

### 4. Lint and Format

Ensure your code meets the style standards:

```bash
# Check for linting issues
npm run lint

# Automatically fix most issues
npm run lint:fix

# Format with Prettier
npm run format
```

### 5. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add gaussian blur filter with configurable radius"
```

**Commit message format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test additions or changes

**Example:**
```
feat: add image comparison metric using SSIM algorithm

Implemented Structural Similarity Index (SSIM) for comparing two images.
Includes window-based calculation with default window size of 11x11.
Added comprehensive test suite with edge cases.

Closes #42
```

### 6. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Go to GitHub and create a Pull Request
```

## Pull Request Guidelines

### Before Submitting

1. **Sync with upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Verify all tests pass**
   ```bash
   npm test
   npm run lint
   ```

3. **Update documentation if needed**
   - Update README.md for new features
   - Update API documentation comments
   - Add usage examples

### PR Title and Description

**Title Format:**
```
[TYPE] Short description of changes
```

Examples:
- `[FEATURE] Add CLAHE histogram equalization`
- `[FIX] Fix edge detection threshold calculation`
- `[DOCS] Update contributing guidelines`

**Description Template:**
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Performance improvement

## Changes Made
- List specific changes
- With clear bullet points

## Testing
- How was this tested?
- Include test results

## Screenshots/Examples (if applicable)
Include before/after or usage examples

## Checklist
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Comments added for complex logic
- [ ] No breaking changes
```

### Hacktoberfest Guidelines

If contributing for Hacktoberfest:

1. **Look for issues labeled `hacktoberfest`**
2. **Keep PRs focused and well-defined**
3. **Ensure quality contributions**
   - Avoid spam or low-effort PRs
   - Follow all guidelines
   - Include proper documentation
4. **Update changelog if applicable**
5. **Test thoroughly before submitting**

## Types of Contributions Welcome

### New Features
- Additional image filters
- New color space conversions
- Advanced image algorithms
- Performance optimizations

### Bug Fixes
- Fix any reported issues
- Improve error handling
- Optimize existing algorithms

### Documentation
- Improve README
- Add code examples
- Update API documentation
- Create tutorials

### Tests
- Increase test coverage
- Add edge case tests
- Add performance tests
- Add integration tests

## File Structure

When adding new features, follow this structure:

```
src/
├── core/              # Core functionality
│   └── yourFeature.js
├── filters/           # Image filters
│   └── yourFilter.js
└── index.js          # Export your module

tests/
└── yourFeature.test.js  # Corresponding tests
```

## Naming Conventions

- **Functions:** camelCase (e.g., `calculateMetric`, `applyFilter`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_ITERATIONS`, `DEFAULT_RADIUS`)
- **Classes:** PascalCase (e.g., `ImageProcessor`)
- **Files:** camelCase.js (e.g., `colorSpace.js`)

## Performance Considerations

- Test performance with different image sizes
- Avoid unnecessary loops or iterations
- Use efficient algorithms
- Document any performance limitations
- Use benchmarking for critical paths

## Documentation Requirements

- JSDoc comments for all exported functions
- Include parameter types and descriptions
- Include return type and description
- Include @throws for error conditions
- Include usage examples for complex functions

## Review Process

1. Automated checks (tests, lint)
2. Code review by maintainers
3. Approval and merge

**What we look for in reviews:**
- Code quality and style
- Test coverage
- Documentation
- Performance implications
- Breaking changes

## Common Issues and Solutions

### Tests Failing
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm test
```

### Linting Errors
```bash
# Auto-fix most issues
npm run lint:fix
```

### Merge Conflicts
```bash
git fetch upstream
git rebase upstream/main
# Resolve conflicts in your editor
git add .
git rebase --continue
```

## Getting Help

- Open an issue for questions
- Check existing issues first
- Provide detailed error descriptions
- Include reproduction steps
- Share test files if relevant

## Recognition

Contributors will be recognized in:
- Pull Request merge comments
- Release notes for new versions
- Contributors section (if applicable)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [Jest Testing Documentation](https://jestjs.io/docs/getting-started)
- [ESLint Documentation](https://eslint.org/docs/rules/)

---

**Thank you for contributing to Image Processing Toolkit! Your efforts help make this project better for everyone.**
